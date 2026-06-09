import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AssetRenderService } from '../page-assets/asset-render.service';
import type { RenderAssetMap } from '../landing-render/render-asset.types';
import { StudioV2DocumentService } from '../studio-v2/studio-v2-document.service';
import { buildStudioV2Html } from './build-html';
import {
  hasCriticalReadinessIssues,
  validateStudioV2Readiness,
} from './readiness';
import type { PuckDocument, StudioV2AssetMap } from './types';

function toStudioV2AssetMap(map: RenderAssetMap): StudioV2AssetMap {
  const result: StudioV2AssetMap = {};
  for (const [id, entry] of Object.entries(map)) {
    result[id] = {
      previewUrl: entry.previewUrl,
      exportPath: entry.exportPath,
      absolutePath: entry.absolutePath,
      storedName: entry.storedName,
    };
  }
  return result;
}

@Injectable()
export class StudioV2RendererService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly assetRenderService: AssetRenderService,
    private readonly studioV2DocumentService: StudioV2DocumentService,
  ) {}

  async getDocument(pageVersionId: string): Promise<PuckDocument> {
    const record =
      await this.studioV2DocumentService.getOrCreate(pageVersionId);
    return record.documentJson as PuckDocument;
  }

  async buildAssetMap(
    document: PuckDocument,
    mode: 'preview' | 'export',
  ): Promise<StudioV2AssetMap> {
    const map = await this.assetRenderService.buildAssetMapForPuckDocument(
      document,
      mode,
    );
    return toStudioV2AssetMap(map);
  }

  async renderPreviewHtml(pageVersionId: string): Promise<{
    html: string;
    readiness: ReturnType<typeof validateStudioV2Readiness>;
  }> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: { landingPage: true },
    });
    if (!pageVersion) {
      throw new NotFoundException('Page version not found');
    }

    const document = await this.getDocument(pageVersionId);
    const assetMap = await this.buildAssetMap(document, 'preview');
    const html = buildStudioV2Html({
      document,
      pageTitle: pageVersion.landingPage.title,
      assetMap,
      mode: 'preview',
      includeScripts: false,
    });

    return { html, readiness: validateStudioV2Readiness(document) };
  }

  validateReadiness(document: PuckDocument) {
    const issues = validateStudioV2Readiness(document);
    return {
      issues,
      canExport: !hasCriticalReadinessIssues(issues),
    };
  }

  resolvePublicLeadEndpoint(): string {
    const configured = this.configService.get<string>('PUBLIC_LEAD_ENDPOINT');
    if (configured?.trim()) return configured.trim();
    const base = this.configService.get<string>('PUBLIC_API_BASE_URL') ?? '';
    return `${base.replace(/\/$/, '')}/api/public/leads`;
  }
}
