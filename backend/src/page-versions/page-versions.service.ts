import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageVersion, PageVersionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageVersionDto } from './dto/create-page-version.dto';
import { ListPageVersionsQueryDto } from './dto/list-page-versions-query.dto';
import { UpdatePageVersionDto } from './dto/update-page-version.dto';
import { randomUUID } from 'crypto';
import { buildIndexHtml, buildLandingConfigJs, deriveApiBaseUrl, buildV4IndexHtml } from '../page-export/static-export.builder';
import { compileDocument } from '../landing-render/compile-document';
import { getLandingPageStylesheet } from '../landing-render/landing-styles';

type PageVersionCreator = {
  id: string;
  fullName: string;
};

export type PageVersionListItem = {
  id: string;
  landingPageId: string;
  versionNumber: number;
  label: string | null;
  status: PageVersionStatus;
  createdAt: string;
};

export type PageVersionDetail = PageVersionListItem & {
  themeJson: Prisma.JsonValue | null;
  updatedAt: string;
  createdBy: PageVersionCreator;
};

export type PublishedPageVersionResult = {
  pageVersion: PageVersionListItem;
  landingPage: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  campaign: {
    id: string;
    name: string;
    brand: string;
  };
};

@Injectable()
export class PageVersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(landingPageId: string, query: ListPageVersionsQueryDto) {
    await this.ensureLandingPageExists(landingPageId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PageVersionWhereInput = { landingPageId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.label = { contains: term, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.pageVersion.findMany({
        where,
        orderBy: { versionNumber: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pageVersion.count({ where }),
    ]);

    return {
      data: items.map((item) => this.toListItem(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(landingPageId: string, id: string): Promise<PageVersionDetail> {
    const pageVersion = await this.findPageVersionForLandingPage(
      landingPageId,
      id,
    );
    return this.toDetail(pageVersion);
  }

  async findOneById(id: string): Promise<PageVersionDetail> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        landingPage: {
          select: {
            campaignId: true,
            deletedAt: true,
            campaign: { select: { id: true, name: true, brand: true, model: true } },
          },
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

    if (pageVersion.landingPage?.deletedAt !== null) {
      throw new NotFoundException({
        success: false,
        message: 'Cette landing page appartient à une campagne supprimée',
        code: 'LANDING_PAGE_DELETED',
      });
    }

    return this.toDetailWithCampaign(pageVersion);
  }

  private toDetailWithCampaign(
    pageVersion: PageVersion & {
      createdBy: PageVersionCreator;
      landingPage?: { campaignId: string; campaign: { id: string; name: string; brand: string; model: string | null } } | null;
    },
  ): PageVersionDetail {
    const base = this.toDetail(pageVersion);
    return {
      ...base,
      campaignId: pageVersion.landingPage?.campaignId ?? null,
      campaignName: pageVersion.landingPage?.campaign?.name ?? null,
      campaignBrand: pageVersion.landingPage?.campaign?.brand ?? null,
      campaignModel: pageVersion.landingPage?.campaign?.model ?? null,
    } as PageVersionDetail;
  }

  async create(
    landingPageId: string,
    dto: CreatePageVersionDto,
    createdById: string,
  ) {
    await this.ensureLandingPageExists(landingPageId);

    const versionNumber = await this.nextVersionNumber(landingPageId);

    const pageVersion = await this.prisma.pageVersion.create({
      data: {
        landingPageId,
        versionNumber,
        label: dto.label?.trim() || null,
        status: dto.status ?? PageVersionStatus.DRAFT,
        themeJson: dto.themeJson as Prisma.InputJsonValue | undefined,
        createdById,
      },
    });

    return this.toListItem(pageVersion);
  }

  async update(landingPageId: string, id: string, dto: UpdatePageVersionDto) {
    await this.findPageVersionForLandingPage(landingPageId, id);

    const pageVersion = await this.prisma.pageVersion.update({
      where: { id },
      data: {
        label: dto.label === undefined ? undefined : dto.label?.trim() || null,
        status: dto.status,
        themeJson:
          dto.themeJson === undefined
            ? undefined
            : (dto.themeJson as Prisma.InputJsonValue),
      },
    });

    return this.toListItem(pageVersion);
  }

  async updateById(
    id: string,
    dto: UpdatePageVersionDto,
  ): Promise<PageVersionDetail> {
    await this.findOneById(id);

    const pageVersion = await this.prisma.pageVersion.update({
      where: { id },
      data: {
        label: dto.label === undefined ? undefined : dto.label?.trim() || null,
        status: dto.status,
        themeJson:
          dto.themeJson === undefined
            ? undefined
            : (dto.themeJson as Prisma.InputJsonValue),
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    return this.toDetail(pageVersion);
  }

  async publish(pageVersionId: string): Promise<PublishedPageVersionResult> {
    const existing = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: {
        landingPage: {
          include: { campaign: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    if (existing.status === PageVersionStatus.ARCHIVED) {
      throw new BadRequestException({
        success: false,
        message: 'Archived page versions cannot be published',
        code: 'PAGE_VERSION_ARCHIVED',
      });
    }

    await this.prisma.$transaction([
      this.prisma.pageVersion.updateMany({
        where: {
          landingPageId: existing.landingPageId,
          id: { not: pageVersionId },
          status: { not: PageVersionStatus.ARCHIVED },
        },
        data: { status: PageVersionStatus.DRAFT },
      }),
      this.prisma.pageVersion.update({
        where: { id: pageVersionId },
        data: { status: PageVersionStatus.PUBLISHED },
      }),
    ]);

    const pageVersion = await this.prisma.pageVersion.findUniqueOrThrow({
      where: { id: pageVersionId },
    });

    return {
      pageVersion: this.toListItem(pageVersion),
      landingPage: {
        id: existing.landingPage.id,
        title: existing.landingPage.title,
        slug: existing.landingPage.slug,
        status: existing.landingPage.status,
      },
      campaign: {
        id: existing.landingPage.campaign.id,
        name: existing.landingPage.campaign.name,
        brand: existing.landingPage.campaign.brand,
      },
    };
  }

  /** Archivage logique (pas de suppression physique — blocs et formulaires liés). */
  async archive(landingPageId: string, id: string) {
    await this.findPageVersionForLandingPage(landingPageId, id);

    const pageVersion = await this.prisma.pageVersion.update({
      where: { id },
      data: { status: PageVersionStatus.ARCHIVED },
    });

    return {
      id: pageVersion.id,
      status: pageVersion.status,
    };
  }

  private async ensureLandingPageExists(landingPageId: string): Promise<void> {
    const landingPage = await this.prisma.landingPage.findUnique({
      where: { id: landingPageId },
      select: { id: true, deletedAt: true },
    });

    if (!landingPage) {
      throw new NotFoundException({
        success: false,
        message: 'Landing page not found',
        code: 'LANDING_PAGE_NOT_FOUND',
      });
    }

    if (landingPage.deletedAt !== null) {
      throw new NotFoundException({
        success: false,
        message: 'Cette landing page appartient à une campagne supprimée',
        code: 'LANDING_PAGE_DELETED',
      });
    }
  }

  private async findPageVersionForLandingPage(
    landingPageId: string,
    id: string,
  ) {
    await this.ensureLandingPageExists(landingPageId);

    const pageVersion = await this.prisma.pageVersion.findFirst({
      where: { id, landingPageId },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!pageVersion) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    return pageVersion;
  }

  private async nextVersionNumber(landingPageId: string): Promise<number> {
    const aggregate = await this.prisma.pageVersion.aggregate({
      where: { landingPageId },
      _max: { versionNumber: true },
    });

    return (aggregate._max.versionNumber ?? 0) + 1;
  }

  private toListItem(pageVersion: PageVersion): PageVersionListItem {
    return {
      id: pageVersion.id,
      landingPageId: pageVersion.landingPageId,
      versionNumber: pageVersion.versionNumber,
      label: pageVersion.label,
      status: pageVersion.status,
      createdAt: pageVersion.createdAt.toISOString(),
    };
  }

  private toDetail(
    pageVersion: PageVersion & { createdBy: PageVersionCreator },
  ): PageVersionDetail {
    return {
      ...this.toListItem(pageVersion),
      themeJson: pageVersion.themeJson,
      updatedAt: pageVersion.updatedAt.toISOString(),
      createdBy: pageVersion.createdBy,
    };
  }

  async getStudioDocument(landingPageId: string, pageVersionId: string): Promise<any> {
    await this.findPageVersionForLandingPage(landingPageId, pageVersionId);

    const doc = await this.prisma.pageVersionStudioDocument.findUnique({
      where: { pageVersionId },
    });

    if (doc) {
      return doc.documentJson;
    }

    const block = await this.prisma.pageBlock.findFirst({
      where: { pageVersionId, blockType: 'core_campaign_form_landing' },
    });

    if (block) {
      return this.autoMigrateV3ToV4(block);
    }

    return this.buildDefaultV4BlankDocument();
  }

  async saveStudioDocument(landingPageId: string, pageVersionId: string, documentJson: any) {
    await this.findPageVersionForLandingPage(landingPageId, pageVersionId);
    const extractedProps = this.extractCampaignProps(documentJson);

    return this.prisma.$transaction(async (tx) => {
      const studioDoc = await tx.pageVersionStudioDocument.upsert({
        where: { pageVersionId },
        update: {
          documentJson: documentJson as Prisma.InputJsonValue,
        },
        create: {
          pageVersionId,
          engine: 'puck',
          documentJson: documentJson as Prisma.InputJsonValue,
        },
      });

      const hasHeroForm = Object.values(documentJson.nodes || {}).some(
        (n: any) => n.name === 'HeroFormSection' || (n.kind === 'section' && n.props?.blockType === 'hero-form')
      );

      if (hasHeroForm) {
        await tx.pageBlock.upsert({
          where: {
            pageVersionId_blockKey: {
              pageVersionId,
              blockKey: 'block_hero_form',
            },
          },
          update: {
            blockType: 'core_campaign_form_landing',
            propsJson: extractedProps as Prisma.InputJsonValue,
          },
          create: {
            pageVersionId,
            blockKey: 'block_hero_form',
            blockType: 'core_campaign_form_landing',
            sortOrder: 1,
            propsJson: extractedProps as Prisma.InputJsonValue,
          },
        });
      } else {
        await tx.pageBlock.deleteMany({
          where: {
            pageVersionId,
            blockKey: 'block_hero_form',
          },
        });
      }

      return studioDoc;
    });
  }

  async getPreviewHtml(landingPageId: string, pageVersionId: string): Promise<string> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: {
        landingPage: {
          include: { campaign: true },
        },
      },
    });

    if (!pageVersion) {
      throw new NotFoundException('Page version not found');
    }

    const { landingPage } = pageVersion;
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

    // Check if studio document exists for rendering
    const studioDoc = await this.prisma.pageVersionStudioDocument.findUnique({
      where: { pageVersionId },
    });

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

      const previewBase = (process.env.PUBLIC_API_BASE_URL || `http://localhost:${process.env.BACKEND_PORT || 3000}`).replace(/\/$/, '');
      const assetMap: Record<string, any> = {};
      for (const asset of assets) {
        assetMap[asset.id] = {
          url: `${previewBase}/api/public/assets/${asset.id}/file`,
          exportPath: asset.publicPath || `assets/images/${asset.storedName}`,
          absolutePath: asset.storagePath,
        };
      }

      const { html: compiledHtml, css: compiledCss } = compileDocument(docJson, { assetMap, mode: 'preview' });
      const baseStylesheet = getLandingPageStylesheet();

      const pageHtml = buildV4IndexHtml(
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

      return pageHtml
        .replace(
          `<link rel="stylesheet" href="css/style.css" />`,
          `<style>${baseStylesheet}</style>`
        )
        .replace(
          '<script src="js/landing-config.js"></script>',
          `<script>${landingConfigJs}</script>`
        );
    }

    // Fallback to legacy block list
    const pageVersionWithBlocks = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    const legacyBlocks = pageVersionWithBlocks?.blocks || [];
    const renderContext = {
      mode: 'preview' as const,
      assetMap: {},
    };

    const indexHtml = buildIndexHtml(
      shell,
      legacyBlocks,
      pageVersion.themeJson,
      renderContext,
    );

    return indexHtml.replace(
      '<script src="js/landing-config.js"></script>',
      `<script>${landingConfigJs}</script>`
    );
  }

  private resolvePublicLeadEndpoint(): string {
    const configuredEnv = process.env.PUBLIC_LEAD_ENDPOINT;
    if (configuredEnv?.trim()) return configuredEnv.trim();

    const base = process.env.PUBLIC_API_BASE_URL ?? '';
    if (base.trim()) {
      const normalized = base.trim().replace(/\/$/, '');
      return normalized.endsWith('/api/public/leads')
        ? normalized
        : `${normalized}/api/public/leads`;
    }

    const port = Number(process.env.BACKEND_PORT ?? '3000');
    return `http://localhost:${port}/api/public/leads`;
  }

  private autoMigrateV3ToV4(block: any): any {
    const rootId = `frame_${randomUUID()}`;
    const sectionId = `section_${randomUUID()}`;
    const imageId = `image_${randomUUID()}`;
    const formId = `form_${randomUUID()}`;
    const badgeId = `badge_${randomUUID()}`;
    const titleId = `title_${randomUUID()}`;
    const subtitleId = `subtitle_${randomUUID()}`;

    const props = block.propsJson || {};
    const layoutDirection = props.layoutDirection || 'image-right';
    const imagePosition = layoutDirection === 'image-left' ? 'left' : 'right';
    const layoutVariant = props.layoutVariant || 'split';

    return {
      rootId,
      nodes: {
        [rootId]: {
          id: rootId,
          kind: 'frame',
          name: 'Frame',
          children: [sectionId],
          layout: { display: 'flex', direction: 'column', width: '100%', minHeight: '100%', height: '100%', align: 'stretch', gap: 0, padding: 0 },
          props: {
            title: props.campaignTitle || 'Auto Hall — Offre',
            templateId: 'campaign-hero-form',
            heroFormGeometry: {
              mode: layoutVariant === 'overlay' ? 'overlay' : layoutVariant === 'floating' ? 'floating-card' : 'split',
              leftRatio: imagePosition === 'left' ? 68 : 72,
              rightRatio: imagePosition === 'left' ? 32 : 28,
              minHeight: 720,
              formColumnWidth: 440,
              gap: 0,
              padding: 0,
            },
          } as any,
        },
        [sectionId]: {
          id: sectionId,
          kind: 'section',
          name: 'HeroFormSection',
          parentId: rootId,
          children: [imageId, formId],
          layout: { display: 'grid', width: '100%', minHeight: 720, overflow: 'hidden', position: 'relative' },
          props: { label: 'Hero + Form', blockType: 'hero-form' },
        },
        [imageId]: {
          id: imageId,
          kind: 'image',
          name: 'ImageLayer',
          parentId: sectionId,
          children: [badgeId, titleId, subtitleId],
          layout: { width: '100%', height: '100%', minHeight: '100%', overflow: 'hidden' },
          props: {
            src: props.imageUrl || '',
            assetId: props.imageAssetId || '',
            alt: props.imageAlt || props.alt || 'Visuel de campagne',
            showMarketingContent: props.showMarketingContent !== false,
          } as any,
          style: { background: '#0e0e12', objectPositionX: 50, objectPositionY: 40, scale: 100, objectFit: 'contain' }
        },
        [badgeId]: {
          id: badgeId,
          kind: 'text',
          name: 'HeroBadge',
          parentId: imageId,
          props: { text: props.offerBadge || 'Nouvelle gamme thermique', tag: 'span', editable: true } as any,
          style: { color: '#ffffff', fontSize: 12, fontWeight: 600, letterSpacing: 1, background: 'rgba(255,255,255,0.14)', borderRadius: 999 } as any,
        },
        [titleId]: {
          id: titleId,
          kind: 'text',
          name: 'HeroTitle',
          parentId: imageId,
          props: { text: props.campaignTitle || 'Découvrez la gamme Auto Hall', tag: 'h1', editable: true } as any,
          style: { color: '#ffffff', fontSize: 40, fontWeight: 700, lineHeight: 1.12 } as any,
        },
        [subtitleId]: {
          id: subtitleId,
          kind: 'text',
          name: 'HeroSubtitle',
          parentId: imageId,
          props: { text: props.campaignSubtitle || 'Essayez le modèle de votre choix...', tag: 'p', editable: true } as any,
          style: { color: 'rgba(255,255,255,0.88)', fontSize: 17, lineHeight: 1.55 } as any,
        },
        [formId]: {
          id: formId,
          kind: 'form',
          name: 'FormLayer',
          parentId: sectionId,
          children: [],
          props: {
            variant: 'campaign',
            title: props.formTitle || 'Demandez votre essai',
            subtitle: props.formSubtitle || '',
            submitLabel: props.submitText || 'Suivant',
            backLabel: 'Retour',
            consentLabel: props.consentLabel || '',
            stepCount: props.stepCount || 1,
            fields: props.fields || [],
            steps: props.formSteps || [],
            showConsent: props.formConfig?.showConsent !== false,
          } as any,
          style: { background: '#ffffff' }
        }
      },
      meta: { title: props.campaignTitle || 'Campagne Hero + Form', templateId: 'campaign-hero-form' }
    };
  }

  private buildDefaultV4BlankDocument(): any {
    const rootId = `frame_${randomUUID()}`;
    return {
      version: 4,
      rootId,
      nodes: {
        [rootId]: {
          id: rootId,
          kind: 'frame',
          name: 'Frame',
          children: [],
          parentId: null,
          style: {},
          layout: { display: 'flex', direction: 'column', width: '100%', minHeight: '100%', height: '100%', align: 'stretch', gap: 0, padding: 0 },
          responsive: {},
          visibility: {},
          props: { title: 'Page vide', templateId: 'blank' }
        }
      },
      meta: { title: 'Page vide', templateId: 'blank' }
    };
  }

  private extractCampaignProps(documentJson: any): any {
    const nodes = documentJson?.nodes || {};
    
    const props: any = {
      campaignTitle: 'Votre campagne Auto Hall',
      campaignSubtitle: '',
      offerBadge: '',
      imageUrl: '',
      imageAssetId: '',
      formTitle: 'Contactez-nous',
      formSubtitle: 'Un conseiller vous recontacte rapidement.',
      submitText: 'Envoyer votre demande',
      consentLabel: 'J’accepte le traitement de mes données personnelles.',
      fields: [],
      formConfig: {
        showCivility: false,
        useSplitName: false,
        showCity: true,
        showVehicleModel: true,
        showMessage: true,
        showEmail: true,
        showConsent: true
      },
      layoutPreset: 'campaign_split',
      layoutDirection: 'image-right',
      layoutVariant: 'split',
      overlayStrength: 'medium',
      overlayColor: '#000000',
      overlayOpacity: 28,
      visualType: 'campaign_image',
      formMode: 'test_drive',
      stepCount: 1,
      fieldsPreset: 'model_city'
    };

    const imageNode = Object.values(nodes).find((n: any) => n.name === 'ImageLayer' || n.name === 'HeroImage');
    if (imageNode) {
      const p = (imageNode as any).props || {};
      props.imageUrl = p.src || '';
      props.imageAssetId = p.assetId || '';
      props.alt = p.alt || '';
      props.imageAlt = p.alt || '';
    }

    const formNode = Object.values(nodes).find((n: any) => n.name === 'FormLayer' || n.name === 'LeadForm' || n.kind === 'form');
    if (formNode) {
      const p = (formNode as any).props || {};
      props.formTitle = p.title || p.formTitle || props.formTitle;
      props.formSubtitle = p.subtitle || p.formSubtitle || props.formSubtitle;
      props.submitText = p.submitLabel || p.submitText || props.submitText;
      props.consentLabel = p.consentLabel || props.consentLabel;
      props.fields = p.fields || [];
      props.formSteps = p.steps || p.formSteps || [];
      props.stepCount = p.stepCount || props.formSteps.length || 1;
      if (p.formConfig) {
        props.formConfig = { ...props.formConfig, ...p.formConfig };
      }
    }

    const badgeNode = Object.values(nodes).find((n: any) => n.name === 'HeroBadge');
    if (badgeNode) {
      props.offerBadge = (badgeNode as any).props?.text || (badgeNode as any).props?.content || '';
    }
    const titleNode = Object.values(nodes).find((n: any) => n.name === 'HeroTitle');
    if (titleNode) {
      props.campaignTitle = (titleNode as any).props?.text || (titleNode as any).props?.content || '';
    }
    const subtitleNode = Object.values(nodes).find((n: any) => n.name === 'HeroSubtitle');
    if (subtitleNode) {
      props.campaignSubtitle = (subtitleNode as any).props?.text || (subtitleNode as any).props?.content || '';
    }

    const rootNode = nodes[documentJson.rootId];
    if (rootNode) {
      const geo = rootNode.props?.heroFormGeometry || {};
      props.layoutDirection = geo.layoutMode === 'split' ? (geo.imagePosition === 'left' ? 'image-left' : 'image-right') : 'image-right';
      props.layoutVariant = geo.layoutMode || 'split';
      props.overlayOpacity = geo.overlayOpacity ?? 28;
      props.overlayColor = geo.overlayColor || '#000000';
    }

    return props;
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
