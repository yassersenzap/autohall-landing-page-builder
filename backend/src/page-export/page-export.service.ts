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
import { compileDocument } from '../landing-render/compile-document';
import {
  buildExportFilename,
  buildIndexHtml,
  buildLandingConfigJs,
  deriveApiBaseUrl,
  STATIC_LEAD_FORM_JS,
  STATIC_MAIN_JS,
  STATIC_STYLE_CSS,
  buildV4IndexHtml,
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

    if (pageVersion.landingPage?.deletedAt !== null && pageVersion.landingPage?.deletedAt !== undefined) {
      throw new NotFoundException({
        success: false,
        message: 'Cette landing page appartient à une campagne supprimée',
        code: 'LANDING_PAGE_DELETED',
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
      apiBaseUrl: deriveApiBaseUrl(leadEndpoint),
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

    const studioDoc = await this.prisma.pageVersionStudioDocument.findUnique({
      where: { pageVersionId },
    });

    let indexHtml = '';
    let styleCss = STATIC_STYLE_CSS;
    let assetMap: Record<string, any> = {};

    if (studioDoc && studioDoc.documentJson) {
      const docJson = studioDoc.documentJson as any;
      
      // Extract asset references recursively
      const assetIdsSet = new Set<string>();
      const nodes = docJson.nodes || {};
      for (const node of Object.values(nodes)) {
        if ((node as any).props) {
          extractAssetIdsFromJson((node as any).props, assetIdsSet);
        }
      }
      const uniqueAssetIds = [...assetIdsSet];
      
      const assets = uniqueAssetIds.length > 0
        ? await this.prisma.landingPageAsset.findMany({
            where: { id: { in: uniqueAssetIds } },
          })
        : [];

      for (const asset of assets) {
        assetMap[asset.id] = {
          url: `/api/public/assets/${asset.id}/file`,
          exportPath: `images/${asset.storedName}`,
          absolutePath: asset.storagePath,
        };
      }

      let { html: compiledHtml, css: compiledCss } = compileDocument(docJson, { assetMap, mode: 'export' });
      
      // Post-process the compiled output to substitute server asset URLs with static relative export paths
      for (const assetId of Object.keys(assetMap)) {
        const assetInfo = assetMap[assetId];
        const regex = new RegExp(`https?:\\/\\/[^\\/]+\\/api\\/public\\/assets\\/${assetId}\\/file|\\/api\\/public\\/assets\\/${assetId}\\/file`, 'g');
        compiledHtml = compiledHtml.replace(regex, assetInfo.exportPath);
        compiledCss = compiledCss.replace(regex, assetInfo.exportPath);
      }

      indexHtml = buildV4IndexHtml(
        {
          ...shell,
          seoDescription: docJson.meta?.seoDescription,
          headScripts: docJson.meta?.headScripts,
        },
        compiledHtml,
        compiledCss,
        pageVersion.themeJson,
        true,
        'css/style.css'
      );
    } else {
      const legacyAssetMap = await this.assetRenderService.buildAssetMapForBlocks(
        blocks,
        'export',
      );
      assetMap = legacyAssetMap;

      const renderContext = {
        mode: 'export' as const,
        assetMap: legacyAssetMap,
      };

      indexHtml = buildIndexHtml(
        shell,
        blocks,
        pageVersion.themeJson,
        renderContext,
      );
    }

    const zipEntries: ZipEntry[] = [
      { kind: 'text', path: 'index.html', content: indexHtml },
      { kind: 'text', path: 'css/style.css', content: styleCss },
      { kind: 'text', path: 'js/landing-config.js', content: landingConfigJs },
      { kind: 'text', path: 'js/lead-form.js', content: STATIC_LEAD_FORM_JS },
      { kind: 'text', path: 'js/main.js', content: STATIC_MAIN_JS },
      { kind: 'text', path: 'js/motion-runtime.js', content: '// Motion runtime is bundled inside lead-form.js' },
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

function extractAssetIdsFromJson(val: any, assetIds: Set<string>): void {
  if (!val) return;
  if (typeof val === 'string') {
    const match = val.match(/\/api\/public\/assets\/([a-fA-F0-9-]{36}|[a-zA-Z0-9_-]+)\/file/);
    if (match && match[1]) {
      assetIds.add(match[1]);
    }
    return;
  }
  if (Array.isArray(val)) {
    for (const item of val) {
      extractAssetIdsFromJson(item, assetIds);
    }
    return;
  }
  if (typeof val === 'object') {
    for (const key of Object.keys(val)) {
      const child = val[key];
      if (key === 'assetId' || key === 'imageAssetId') {
        if (typeof child === 'string' && child.trim()) {
          assetIds.add(child.trim());
        }
      } else {
        extractAssetIdsFromJson(child, assetIds);
      }
    }
  }
}
