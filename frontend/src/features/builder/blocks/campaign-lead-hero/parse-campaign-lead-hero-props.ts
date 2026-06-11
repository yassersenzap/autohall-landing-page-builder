import { asPropString } from '@/features/builder-engine/lib/block-props';
import { parseCampaignLeadHeroFormIntegration } from '../../export-contracts';
import {
  buildHeroFocalStyleVars,
  resolveHeroFocalPoint,
} from '../hero-vehicle-offer/hero-image-controls';
import type {
  CampaignLeadHeroContent,
  CampaignLeadHeroContentPlacement,
  CampaignLeadHeroDesign,
  CampaignLeadHeroFormTheme,
  CampaignLeadHeroLayoutVariant,
} from './campaign-lead-hero.types';
import {
  campaignLeadHeroDefaultContent,
  campaignLeadHeroDefaultDesign,
} from './campaign-lead-hero.definition';

const LAYOUT_VARIANTS = new Set<CampaignLeadHeroLayoutVariant>([
  'media_left_form_right',
  'form_left_media_right',
  'background_media_form_right',
  'background_media_form_left',
  'dual_media_form_right',
  'dual_media_form_left',
]);

const CONTENT_PLACEMENTS = new Set<CampaignLeadHeroContentPlacement>([
  'overlay_media',
  'beside_form',
  'hidden',
]);

function pickEnum<T extends string>(value: unknown, allowed: Set<T>, fallback: T): T {
  return typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback;
}

function readDesign(propsJson: Record<string, unknown>): CampaignLeadHeroDesign {
  const raw =
    propsJson.design && typeof propsJson.design === 'object' && !Array.isArray(propsJson.design)
      ? (propsJson.design as Record<string, unknown>)
      : {};

  return {
    tone: pickEnum(raw.tone, new Set(['light', 'dark', 'brand']), campaignLeadHeroDefaultDesign.tone),
    showOfferBadge:
      typeof raw.showOfferBadge === 'boolean'
        ? raw.showOfferBadge
        : campaignLeadHeroDefaultDesign.showOfferBadge,
    showProgressBar:
      typeof raw.showProgressBar === 'boolean'
        ? raw.showProgressBar
        : campaignLeadHeroDefaultDesign.showProgressBar,
    formTheme: pickEnum(
      raw.formTheme,
      new Set<CampaignLeadHeroFormTheme>(['light', 'dark', 'glass']),
      campaignLeadHeroDefaultDesign.formTheme,
    ),
  };
}

export function resolveContentPlacement(
  layout: CampaignLeadHeroLayoutVariant,
  value: unknown,
): CampaignLeadHeroContentPlacement {
  if (typeof value === 'string' && CONTENT_PLACEMENTS.has(value as CampaignLeadHeroContentPlacement)) {
    return value as CampaignLeadHeroContentPlacement;
  }
  if (isBackgroundLayout(layout)) return 'beside_form';
  if (isDualMediaLayout(layout)) return 'overlay_media';
  return 'hidden';
}

export type ParsedCampaignLeadHeroProps = CampaignLeadHeroContent & {
  design: CampaignLeadHeroDesign;
  primaryImageUrl: string | null;
  secondaryImageUrl: string | null;
  mobileImageUrl: string | null;
  resolvedFocalX: number;
  resolvedFocalY: number;
  primaryImageAltResolved: string;
  resolvedContentPlacement: CampaignLeadHeroContentPlacement;
};

export function parseCampaignLeadHeroProps(
  propsJson: Record<string, unknown>,
): ParsedCampaignLeadHeroProps {
  const design = readDesign(propsJson);
  const focal = resolveHeroFocalPoint(propsJson);
  const layoutVariant = pickEnum(
    propsJson.layoutVariant,
    LAYOUT_VARIANTS,
    campaignLeadHeroDefaultContent.layoutVariant,
  );
  const campaignTitle =
    asPropString(propsJson.campaignTitle) || campaignLeadHeroDefaultContent.campaignTitle;
  const contentPlacement = resolveContentPlacement(
    layoutVariant,
    propsJson.contentPlacement,
  );
  const formIntegration = parseCampaignLeadHeroFormIntegration(propsJson);

  return {
    brandId: (asPropString(propsJson.brandId) as CampaignLeadHeroContent['brandId']) ||
      campaignLeadHeroDefaultContent.brandId,
    campaignTitle,
    campaignSubtitle:
      asPropString(propsJson.campaignSubtitle) || campaignLeadHeroDefaultContent.campaignSubtitle,
    offerBadge: asPropString(propsJson.offerBadge) || campaignLeadHeroDefaultContent.offerBadge,
    primaryImage: asPropString(propsJson.primaryImage) ?? null,
    primaryImageUrl: asPropString(propsJson.primaryImageUrl) ?? null,
    primaryImageAlt:
      asPropString(propsJson.primaryImageAlt) ?? campaignLeadHeroDefaultContent.primaryImageAlt,
    secondaryImage: asPropString(propsJson.secondaryImage) ?? null,
    secondaryImageUrl: asPropString(propsJson.secondaryImageUrl) ?? null,
    secondaryImageAlt:
      asPropString(propsJson.secondaryImageAlt) ?? campaignLeadHeroDefaultContent.secondaryImageAlt,
    mobileImage: asPropString(propsJson.mobileImage) ?? null,
    mobileImageUrl: asPropString(propsJson.mobileImageUrl) ?? null,
    imageFit: pickEnum(
      propsJson.imageFit,
      new Set(['cover', 'contain']),
      campaignLeadHeroDefaultContent.imageFit,
    ),
    imagePosition: pickEnum(
      propsJson.imagePosition,
      new Set(['left', 'right', 'center']),
      campaignLeadHeroDefaultContent.imagePosition,
    ),
    cropPreset: focal.cropPreset,
    focalPointX: focal.x,
    focalPointY: focal.y,
    overlayIntensity: pickEnum(
      propsJson.overlayIntensity,
      new Set(['none', 'light', 'medium', 'heavy']),
      campaignLeadHeroDefaultContent.overlayIntensity,
    ),
    layoutVariant,
    contentPlacement: pickEnum(
      propsJson.contentPlacement,
      CONTENT_PLACEMENTS,
      contentPlacement,
    ),
    formTitle: asPropString(propsJson.formTitle) || campaignLeadHeroDefaultContent.formTitle,
    formSubtitle: asPropString(propsJson.formSubtitle) || campaignLeadHeroDefaultContent.formSubtitle,
    formStepLabel:
      asPropString(propsJson.formStepLabel) || campaignLeadHeroDefaultContent.formStepLabel,
    formPrimaryFieldLabel:
      asPropString(propsJson.formPrimaryFieldLabel) ||
      campaignLeadHeroDefaultContent.formPrimaryFieldLabel,
    formCtaLabel: asPropString(propsJson.formCtaLabel) || campaignLeadHeroDefaultContent.formCtaLabel,
    legalText: asPropString(propsJson.legalText) || campaignLeadHeroDefaultContent.legalText,
    footerText: asPropString(propsJson.footerText) || campaignLeadHeroDefaultContent.footerText,
    ...formIntegration,
    design,
    resolvedFocalX: focal.x,
    resolvedFocalY: focal.y,
    primaryImageAltResolved:
      asPropString(propsJson.primaryImageAlt) || campaignTitle || 'Visuel campagne',
    resolvedContentPlacement: contentPlacement,
  };
}

export function buildCampaignLeadHeroSectionClasses(
  props: Pick<
    ParsedCampaignLeadHeroProps,
    | 'layoutVariant'
    | 'imageFit'
    | 'imagePosition'
    | 'cropPreset'
    | 'overlayIntensity'
    | 'resolvedContentPlacement'
    | 'design'
  >,
): string {
  const { design } = props;
  return [
    'lp-campaign-lead-hero',
    `lp-campaign-lead-hero--layout-${props.layoutVariant}`,
    `lp-campaign-lead-hero--fit-${props.imageFit}`,
    `lp-campaign-lead-hero--position-${props.imagePosition}`,
    `lp-campaign-lead-hero--crop-${props.cropPreset}`,
    `lp-campaign-lead-hero--overlay-${props.overlayIntensity}`,
    `lp-campaign-lead-hero--tone-${design.tone}`,
    `lp-campaign-lead-hero--form-theme-${design.formTheme}`,
    `lp-campaign-lead-hero--content-${props.resolvedContentPlacement}`,
    design.showOfferBadge ? 'lp-campaign-lead-hero--has-badge' : 'lp-campaign-lead-hero--no-badge',
    design.showProgressBar
      ? 'lp-campaign-lead-hero--has-progress'
      : 'lp-campaign-lead-hero--no-progress',
  ].join(' ');
}

export function buildCampaignLeadHeroSectionStyle(
  props: Pick<ParsedCampaignLeadHeroProps, 'resolvedFocalX' | 'resolvedFocalY'>,
  brandStyle: Record<string, string>,
): Record<string, string> {
  return {
    ...brandStyle,
    ...buildHeroFocalStyleVars(props.resolvedFocalX, props.resolvedFocalY),
  };
}

export function isBackgroundLayout(layout: CampaignLeadHeroLayoutVariant): boolean {
  return (
    layout === 'background_media_form_right' || layout === 'background_media_form_left'
  );
}

export function isDualMediaLayout(layout: CampaignLeadHeroLayoutVariant): boolean {
  return layout === 'dual_media_form_right' || layout === 'dual_media_form_left';
}

export function isFormFirst(layout: CampaignLeadHeroLayoutVariant): boolean {
  return (
    layout === 'form_left_media_right' ||
    layout === 'background_media_form_left' ||
    layout === 'dual_media_form_left'
  );
}

export function shouldRenderCampaignOverlay(
  placement: CampaignLeadHeroContentPlacement,
): boolean {
  return placement === 'overlay_media';
}

export function shouldRenderCampaignBeside(
  placement: CampaignLeadHeroContentPlacement,
): boolean {
  return placement === 'beside_form';
}
