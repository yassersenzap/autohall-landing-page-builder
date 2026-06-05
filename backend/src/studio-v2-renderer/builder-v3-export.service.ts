import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildExportFilename,
  buildLandingConfigJs,
  deriveApiBaseUrl,
  STATIC_LEAD_FORM_JS,
} from '../page-export/static-export.builder';
import { BuilderV3HtmlCompilerService } from './builder-v3-html-compiler.service';
import type { ExportBuilderV3DocumentDto } from './dto/export-builder-v3-document.dto';

type ZipTextEntry = { kind: 'text'; path: string; content: string };

@Injectable()
export class BuilderV3ExportService {
  private readonly logger = new Logger(BuilderV3ExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly htmlCompiler: BuilderV3HtmlCompilerService,
  ) {}

  async exportZip(
    pageVersionId: string,
    dto: ExportBuilderV3DocumentDto,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    try {
      const pageVersion = await this.prisma.pageVersion.findUnique({
        where: { id: pageVersionId },
        include: { landingPage: { include: { campaign: true } } },
      });

      if (!pageVersion) {
        throw new NotFoundException({
          success: false,
          message: 'Page version not found',
          code: 'PAGE_VERSION_NOT_FOUND',
        });
      }

      const pageTheme = dto.pageTheme ?? {};
      const pageSettings = dto.pageSettings ?? {};

      const primaryColor =
        typeof pageTheme.primaryColor === 'string'
          ? pageTheme.primaryColor
          : '#b91c1c';
      const secondaryColor =
        typeof pageTheme.secondaryColor === 'string'
          ? pageTheme.secondaryColor
          : '#1e293b';
      const headingFont =
        typeof pageTheme.headingFont === 'string'
          ? pageTheme.headingFont
          : typeof pageTheme.fontFamily === 'string'
            ? pageTheme.fontFamily
            : 'Inter';
      const bodyFont =
        typeof pageTheme.bodyFont === 'string' ? pageTheme.bodyFont : 'Roboto';

      const pageTitle =
        (typeof pageSettings.metaTitle === 'string' && pageSettings.metaTitle.trim()) ||
        (typeof pageTheme.seoTitle === 'string' && pageTheme.seoTitle.trim()) ||
        pageVersion.landingPage.title;

      const metaDescription =
        (typeof pageSettings.metaDescription === 'string' &&
          pageSettings.metaDescription.trim()) ||
        (typeof pageTheme.seoDescription === 'string' && pageTheme.seoDescription.trim()) ||
        `Campagne ${pageVersion.landingPage.campaign.name} — Auto Hall`;

      const blocks = (dto.blocks ?? []).map((block, index) => ({
        type: block.type,
        sortOrder: block.sortOrder ?? index + 1,
        propsJson: block.propsJson ?? {},
      }));

      this.logger.log(
        `Compiling V3 export for pageVersion=${pageVersionId} blocks=${blocks.length}`,
      );

      const indexHtml = this.htmlCompiler.compile({
        pageTitle,
        metaDescription,
        primaryColor,
        secondaryColor,
        headingFont,
        bodyFont,
        blocks,
      });

      const leadEndpoint = this.resolvePublicLeadEndpoint();
      const landingConfigJs = buildLandingConfigJs({
        leadEndpoint,
        apiBaseUrl: deriveApiBaseUrl(leadEndpoint),
        campaignId: pageVersion.landingPage.campaignId,
        landingPageId: pageVersion.landingPage.id,
        pageVersionId: pageVersion.id,
        landingSlug: pageVersion.landingPage.slug,
      });

      const zipEntries: ZipTextEntry[] = [
        { kind: 'text', path: 'index.html', content: indexHtml },
        { kind: 'text', path: 'js/landing-config.js', content: landingConfigJs },
        { kind: 'text', path: 'js/lead-form.js', content: STATIC_LEAD_FORM_JS },
        {
          kind: 'text',
          path: 'README_DEPLOYMENT.txt',
          content: `Auto Hall — Landing page statique (Builder V3)
============================================

1. Déployez le contenu du ZIP sur un hébergement statique.
2. Ouvrez index.html dans un navigateur pour vérifier le rendu.
3. Testez le formulaire lead en conditions réelles.

Support : Auto Hall SI Digital
`,
        },
      ];

      const buffer = await this.buildZipBuffer(zipEntries);
      const filename =
        buildExportFilename(
          pageVersion.landingPage.slug,
          pageVersion.versionNumber,
        ).replace('.zip', '-v3.zip') || 'autohall-campagne.zip';

      this.logger.log(`V3 export ready: ${filename} (${buffer.length} bytes)`);

      return { buffer, filename, mimeType: 'application/zip' };
    } catch (error) {
      this.logger.error(
        `V3 export failed for pageVersion=${pageVersionId}`,
        error instanceof Error ? error.stack : String(error),
      );
      console.error('[BuilderV3ExportService] Export error:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message:
          error instanceof Error
            ? `Export V3 impossible : ${error.message}`
            : 'Export V3 impossible.',
        code: 'BUILDER_V3_EXPORT_FAILED',
      });
    }
  }

  private resolvePublicLeadEndpoint(): string {
    const configured = this.configService.get<string>('PUBLIC_LEAD_ENDPOINT');
    if (configured?.trim()) return configured.trim();

    const base = this.configService.get<string>('PUBLIC_API_BASE_URL') ?? '';
    if (base.trim()) {
      const normalized = base.trim().replace(/\/$/, '');
      return normalized.endsWith('/api/public/leads')
        ? normalized
        : `${normalized}/api/public/leads`;
    }

    const port = Number(
      this.configService.get<string>('BACKEND_PORT') ?? '3000',
    );
    return `http://localhost:${port}/api/public/leads`;
  }

  private buildZipBuffer(entries: ZipTextEntry[]): Promise<Buffer> {
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
        archive.append(entry.content, { name: entry.path });
      }

      void archive.finalize();
    });
  }
}
