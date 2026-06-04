import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildLandingPreviewFragment } from '../landing-render/landing-document.builder';
import { AssetRenderService } from '../page-assets/asset-render.service';
import { PrismaService } from '../prisma/prisma.service';

export type PreviewCampaign = {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  campaignType: string;
  status: string;
};

export type PreviewLandingPage = {
  id: string;
  campaignId: string;
  title: string;
  slug: string;
  status: string;
  publicBaseUrl: string | null;
};

export type PreviewPageVersion = {
  id: string;
  landingPageId: string;
  versionNumber: number;
  label: string | null;
  status: string;
  themeJson: Prisma.JsonValue | null;
  createdAt: string;
  updatedAt: string;
};

export type PreviewBlock = {
  id: string;
  blockKey: string;
  blockType: string;
  sortOrder: number;
  propsJson: Prisma.JsonValue;
};

export type PreviewRenderBlock = {
  id: string;
  html: string;
};

export type PagePreviewRender = {
  themeMode: 'light' | 'dark';
  themeStyle: string;
  headerHtml: string;
  blocksHtml: PreviewRenderBlock[];
  footerHtml: string;
  mainHtml: string;
};

export type PagePreviewData = {
  pageVersion: PreviewPageVersion;
  landingPage: PreviewLandingPage;
  campaign: PreviewCampaign;
  blocks: PreviewBlock[];
  render: PagePreviewRender;
};

@Injectable()
export class PagePreviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetRenderService: AssetRenderService,
  ) {}

  async getPreview(pageVersionId: string): Promise<PagePreviewData> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: {
        landingPage: {
          include: {
            campaign: true,
          },
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

    const { landingPage, blocks, ...version } = pageVersion;

    const blockInputs = blocks.map((block) => ({
      id: block.id,
      blockType: block.blockType,
      sortOrder: block.sortOrder,
      propsJson: block.propsJson,
    }));

    const assetMap = await this.assetRenderService.buildAssetMapForBlocks(
      blocks,
      'preview',
    );

    const render = buildLandingPreviewFragment({
      shell: {
        title: landingPage.title,
        campaignName: landingPage.campaign.name,
        brand: landingPage.campaign.brand,
      },
      blocks: blockInputs,
      themeJson: version.themeJson,
      renderContext: { mode: 'preview', assetMap },
    });

    return {
      pageVersion: {
        id: version.id,
        landingPageId: version.landingPageId,
        versionNumber: version.versionNumber,
        label: version.label,
        status: version.status,
        themeJson: version.themeJson,
        createdAt: version.createdAt.toISOString(),
        updatedAt: version.updatedAt.toISOString(),
      },
      landingPage: {
        id: landingPage.id,
        campaignId: landingPage.campaignId,
        title: landingPage.title,
        slug: landingPage.slug,
        status: landingPage.status,
        publicBaseUrl: landingPage.publicBaseUrl,
      },
      campaign: {
        id: landingPage.campaign.id,
        name: landingPage.campaign.name,
        brand: landingPage.campaign.brand,
        model: landingPage.campaign.model,
        campaignType: landingPage.campaign.campaignType,
        status: landingPage.campaign.status,
      },
      blocks: blocks.map((block) => ({
        id: block.id,
        blockKey: block.blockKey,
        blockType: block.blockType,
        sortOrder: block.sortOrder,
        propsJson: block.propsJson,
      })),
      render,
    };
  }
}
