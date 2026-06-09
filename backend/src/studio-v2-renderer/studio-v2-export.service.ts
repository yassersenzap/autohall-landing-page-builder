import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import archiver from 'archiver';
import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import { PassThrough } from 'stream';
import { AssetRenderService } from '../page-assets/asset-render.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildExportFilename,
  buildLandingConfigJs,
  deriveApiBaseUrl,
  STATIC_LEAD_FORM_JS,
} from '../page-export/static-export.builder';
import { StudioV2DocumentService } from '../studio-v2/studio-v2-document.service';
import { buildStudioV2ExportStyleCss, buildStudioV2Html } from './build-html';
import { containsForbiddenAssetUrl } from './extract-puck-assets';
import {
  hasCriticalReadinessIssues,
  validateStudioV2Readiness,
} from './readiness';
import type { PuckDocument } from './types';

type ZipTextEntry = { kind: 'text'; path: string; content: string };
type ZipFileEntry = { kind: 'file'; path: string; absolutePath: string };
type ZipEntry = ZipTextEntry | ZipFileEntry;

const README_DEPLOYMENT = `Auto Hall — Landing page statique (Visual Studio V2)
================================================================

Contenu du ZIP :
- index.html          Page principale
- assets/style.css    Styles
- assets/images/      Images uploadées
- js/landing-config.js Configuration leads
- js/lead-form.js     Script formulaire

Déploiement :
1. Déposer le contenu du ZIP sur votre hébergement statique.
2. Vérifier que js/landing-config.js pointe vers l'endpoint leads public.
3. Tester le formulaire en conditions réelles.

Support : Auto Hall SI Digital
`;

@Injectable()
export class StudioV2ExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly assetRenderService: AssetRenderService,
    private readonly studioV2DocumentService: StudioV2DocumentService,
  ) {}

  async exportZip(pageVersionId: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: { landingPage: { include: { campaign: true } } },
    });

    if (!pageVersion) {
      throw new NotFoundException('Page version not found');
    }

    const record =
      await this.studioV2DocumentService.getOrCreate(pageVersionId);
    const document = record.documentJson as PuckDocument;
    const readiness = validateStudioV2Readiness(document);

    if (hasCriticalReadinessIssues(readiness)) {
      throw new BadRequestException({
        success: false,
        message: 'Export V2 bloqué : problèmes critiques de readiness.',
        code: 'STUDIO_V2_READINESS_BLOCKED',
        issues: readiness,
      });
    }

    this.assertNoForbiddenUrls(document);

    const assetMap = await this.assetRenderService.buildAssetMapForPuckDocument(
      document,
      'export',
    );

    const leadEndpoint = this.resolvePublicLeadEndpoint();
    const landingConfigJs = buildLandingConfigJs({
      leadEndpoint,
      apiBaseUrl: deriveApiBaseUrl(leadEndpoint),
      campaignId: pageVersion.landingPage.campaignId,
      landingPageId: pageVersion.landingPage.id,
      pageVersionId: pageVersion.id,
      landingSlug: pageVersion.landingPage.slug,
    });

    const studioAssetMap = Object.fromEntries(
      Object.entries(assetMap).map(([id, entry]) => [
        id,
        {
          previewUrl: entry.previewUrl,
          exportPath: entry.exportPath,
          absolutePath: entry.absolutePath,
          storedName: entry.storedName,
        },
      ]),
    );

    const indexHtml = buildStudioV2Html({
      document,
      pageTitle: pageVersion.landingPage.title,
      assetMap: studioAssetMap,
      mode: 'export',
      includeScripts: true,
      stylesheetHref: 'assets/style.css',
    });

    const styleCss = buildStudioV2ExportStyleCss(document);

    const zipEntries: ZipEntry[] = [
      { kind: 'text', path: 'index.html', content: indexHtml },
      { kind: 'text', path: 'assets/style.css', content: styleCss },
      { kind: 'text', path: 'js/landing-config.js', content: landingConfigJs },
      { kind: 'text', path: 'js/lead-form.js', content: STATIC_LEAD_FORM_JS },
      {
        kind: 'text',
        path: 'README_DEPLOYMENT.txt',
        content: README_DEPLOYMENT,
      },
    ];

    for (const entry of Object.values(assetMap)) {
      const exists = await access(entry.absolutePath)
        .then(() => true)
        .catch(() => false);
      if (!exists) continue;
      zipEntries.push({
        kind: 'file',
        path: entry.exportPath,
        absolutePath: entry.absolutePath,
      });
    }

    const buffer = await this.buildZipBuffer(zipEntries);
    const filename = buildExportFilename(
      pageVersion.landingPage.slug,
      pageVersion.versionNumber,
    ).replace('.zip', '-v2.zip');

    return { buffer, filename, mimeType: 'application/zip' };
  }

  private assertNoForbiddenUrls(document: PuckDocument): void {
    const json = JSON.stringify(document);
    if (
      json.includes('localhost') ||
      json.includes('data:image') ||
      json.includes('/api/assets/')
    ) {
      throw new BadRequestException({
        success: false,
        message:
          'Export V2 refusé : URL interdite (localhost, base64 ou API privée).',
        code: 'STUDIO_V2_FORBIDDEN_URL',
      });
    }

    const walk = (value: unknown): void => {
      if (typeof value === 'string' && containsForbiddenAssetUrl(value)) {
        throw new BadRequestException(
          'Export V2 refusé : URL image interdite.',
        );
      }
      if (Array.isArray(value)) {
        for (const item of value) walk(item);
        return;
      }
      if (value && typeof value === 'object') {
        for (const nested of Object.values(value)) walk(nested);
      }
    };
    walk(document);
  }

  private resolvePublicLeadEndpoint(): string {
    const configured = this.configService.get<string>('PUBLIC_LEAD_ENDPOINT');
    if (configured?.trim()) return configured.trim();
    const base = this.configService.get<string>('PUBLIC_API_BASE_URL') ?? '';
    return `${base.replace(/\/$/, '')}/api/public/leads`;
  }

  private buildZipBuffer(entries: ZipEntry[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const stream = new PassThrough();
      const chunks: Buffer[] = [];

      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
      archive.on('error', reject);

      archive.pipe(stream);

      for (const entry of entries) {
        if (entry.kind === 'text') {
          archive.append(entry.content, { name: entry.path });
        } else {
          archive.append(createReadStream(entry.absolutePath), {
            name: entry.path,
          });
        }
      }

      void archive.finalize();
    });
  }
}
