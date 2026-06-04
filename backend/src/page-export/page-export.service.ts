import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageVersionStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import archiver from 'archiver';
import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import { PassThrough } from 'stream';
import { AssetRenderService } from '../page-assets/asset-render.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildExportFilename,
  buildIndexHtml,
  buildLandingConfigJs,
  STATIC_MAIN_JS,
  STATIC_STYLE_CSS,
} from './static-export.builder';

export type PageExportResult = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

type ZipTextEntry = { kind: 'text'; path: string; content: string };
type ZipFileEntry = { kind: 'file'; path: string; absolutePath: string };
type ZipEntry = ZipTextEntry | ZipFileEntry;

@Injectable()
export class PageExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly assetRenderService: AssetRenderService,
  ) {}

  async exportZip(pageVersionId: string): Promise<PageExportResult> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: {
        landingPage: {
          include: { campaign: true },
        },
        blocks: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!pageVersion) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    if (pageVersion.status !== PageVersionStatus.PUBLISHED) {
      throw new BadRequestException({
        success: false,
        message: 'Only published page versions can be exported',
        code: 'PAGE_VERSION_NOT_PUBLISHED',
      });
    }

    const { landingPage, blocks } = pageVersion;

    const leadEndpoint = this.resolvePublicLeadEndpoint();

    const landingConfigJs = buildLandingConfigJs({
      leadEndpoint,
      campaignId: landingPage.campaignId,
      landingPageId: landingPage.id,
      pageVersionId: pageVersion.id,
      landingSlug: landingPage.slug,
    });

    const shell = {
      title: landingPage.title,
      campaignName: landingPage.campaign.name,
      brand: landingPage.campaign.brand,
    };

    const assetMap = await this.assetRenderService.buildAssetMapForBlocks(
      blocks,
      'export',
    );

    const renderContext = {
      mode: 'export' as const,
      assetMap,
    };

    const indexHtml = buildIndexHtml(
      shell,
      blocks,
      pageVersion.themeJson,
      renderContext,
    );
    const styleCss = STATIC_STYLE_CSS;

    const zipEntries: ZipEntry[] = [
      { kind: 'text', path: 'index.html', content: indexHtml },
      { kind: 'text', path: 'assets/style.css', content: styleCss },
      { kind: 'text', path: 'js/landing-config.js', content: landingConfigJs },
      { kind: 'text', path: 'js/main.js', content: STATIC_MAIN_JS },
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

    const buffer = await this.createZipBuffer(zipEntries);

    const filename = buildExportFilename(
      landingPage.slug,
      pageVersion.versionNumber,
    );

    return {
      buffer,
      filename,
      mimeType: 'application/zip',
    };
  }

  private resolvePublicLeadEndpoint(): string {
    const configured = this.configService.get<string>('PUBLIC_API_BASE_URL');
    if (configured?.trim()) {
      const base = configured.trim().replace(/\/$/, '');
      return base.endsWith('/api/public/leads')
        ? base
        : `${base}/api/public/leads`;
    }

    const port = Number(
      this.configService.get<string>('BACKEND_PORT') ?? '3000',
    );
    return `http://localhost:${port}/api/public/leads`;
  }

  private createZipBuffer(entries: ZipEntry[]): Promise<Buffer> {
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
