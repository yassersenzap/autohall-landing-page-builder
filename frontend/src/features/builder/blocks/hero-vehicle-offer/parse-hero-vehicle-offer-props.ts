import { asPropString } from '@/features/builder-engine/lib/block-props';
import type {
  HeroVehicleOfferContent,
  HeroVehicleOfferDesign,
  HeroVehicleOfferLayoutVariant,
} from './hero-vehicle-offer.types';
import {
  heroVehicleOfferDefaultContent,
  heroVehicleOfferDefaultDesign,
} from './hero-vehicle-offer.definition';

const LAYOUT_VARIANTS = new Set<HeroVehicleOfferLayoutVariant>([
  'split-media-right',
  'split-media-left',
  'full-bleed-overlay',
  'stacked-mobile',
]);

const IMAGE_FITS = new Set(['cover', 'contain']);
const IMAGE_POSITIONS = new Set(['left', 'right', 'background']);
const FOCAL_POINTS = new Set(['center', 'left', 'right', 'top', 'bottom']);
const OVERLAY_LEVELS = new Set(['none', 'light', 'medium', 'heavy']);

function pickEnum<T extends string>(
  value: unknown,
  allowed: Set<T>,
  fallback: T,
): T {
  return typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback;
}

function readDesign(propsJson: Record<string, unknown>): HeroVehicleOfferDesign {
  const raw =
    propsJson.design && typeof propsJson.design === 'object' && !Array.isArray(propsJson.design)
      ? (propsJson.design as Record<string, unknown>)
      : {};

  return {
    tone: pickEnum(raw.tone, new Set(['light', 'dark', 'brand']), heroVehicleOfferDefaultDesign.tone),
    density: pickEnum(
      raw.density,
      new Set(['compact', 'comfortable', 'immersive']),
      heroVehicleOfferDefaultDesign.density,
    ),
    ctaStyle: pickEnum(
      raw.ctaStyle,
      new Set(['primary', 'outline', 'ghost']),
      heroVehicleOfferDefaultDesign.ctaStyle,
    ),
    showOfferBadge:
      typeof raw.showOfferBadge === 'boolean'
        ? raw.showOfferBadge
        : heroVehicleOfferDefaultDesign.showOfferBadge,
    alignContent: pickEnum(
      raw.alignContent,
      new Set(['left', 'center']),
      heroVehicleOfferDefaultDesign.alignContent,
    ),
  };
}

export type ParsedHeroVehicleOfferProps = HeroVehicleOfferContent & {
  design: HeroVehicleOfferDesign;
  heroImageUrl: string | null;
  mobileImageUrl: string | null;
};

export function parseHeroVehicleOfferProps(
  propsJson: Record<string, unknown>,
): ParsedHeroVehicleOfferProps {
  const design = readDesign(propsJson);

  return {
    brandId: (asPropString(propsJson.brandId) as HeroVehicleOfferContent['brandId']) ||
      heroVehicleOfferDefaultContent.brandId,
    modelName: asPropString(propsJson.modelName) ?? heroVehicleOfferDefaultContent.modelName,
    headline: asPropString(propsJson.headline) ?? heroVehicleOfferDefaultContent.headline,
    subheadline: asPropString(propsJson.subheadline) ?? heroVehicleOfferDefaultContent.subheadline,
    offerLabel: asPropString(propsJson.offerLabel) ?? heroVehicleOfferDefaultContent.offerLabel,
    priceText: asPropString(propsJson.priceText) ?? heroVehicleOfferDefaultContent.priceText,
    primaryCtaLabel:
      asPropString(propsJson.primaryCtaLabel) ?? heroVehicleOfferDefaultContent.primaryCtaLabel,
    secondaryCtaLabel:
      asPropString(propsJson.secondaryCtaLabel) ?? heroVehicleOfferDefaultContent.secondaryCtaLabel,
    heroImage: asPropString(propsJson.heroImage) ?? null,
    heroImageUrl: asPropString(propsJson.heroImageUrl) ?? null,
    imageFit: pickEnum(
      propsJson.imageFit,
      IMAGE_FITS as Set<HeroVehicleOfferContent['imageFit']>,
      heroVehicleOfferDefaultContent.imageFit,
    ),
    imagePosition: pickEnum(
      propsJson.imagePosition,
      IMAGE_POSITIONS as Set<HeroVehicleOfferContent['imagePosition']>,
      heroVehicleOfferDefaultContent.imagePosition,
    ),
    focalPoint: pickEnum(
      propsJson.focalPoint,
      FOCAL_POINTS as Set<HeroVehicleOfferContent['focalPoint']>,
      heroVehicleOfferDefaultContent.focalPoint,
    ),
    overlayIntensity: pickEnum(
      propsJson.overlayIntensity,
      OVERLAY_LEVELS as Set<HeroVehicleOfferContent['overlayIntensity']>,
      heroVehicleOfferDefaultContent.overlayIntensity,
    ),
    layoutVariant: pickEnum(
      propsJson.layoutVariant,
      LAYOUT_VARIANTS,
      heroVehicleOfferDefaultContent.layoutVariant,
    ),
    mobileImage: asPropString(propsJson.mobileImage) ?? null,
    mobileImageUrl: asPropString(propsJson.mobileImageUrl) ?? null,
    design,
  };
}

export function buildHeroVehicleOfferSectionClasses(
  props: Pick<
    ParsedHeroVehicleOfferProps,
    'layoutVariant' | 'imageFit' | 'imagePosition' | 'focalPoint' | 'overlayIntensity' | 'design'
  >,
): string {
  const { design } = props;
  return [
    'lp-hero-vehicle-offer',
    `lp-hero-vehicle-offer--layout-${props.layoutVariant}`,
    `lp-hero-vehicle-offer--fit-${props.imageFit}`,
    `lp-hero-vehicle-offer--position-${props.imagePosition}`,
    `lp-hero-vehicle-offer--focal-${props.focalPoint}`,
    `lp-hero-vehicle-offer--overlay-${props.overlayIntensity}`,
    `lp-hero-vehicle-offer--tone-${design.tone}`,
    `lp-hero-vehicle-offer--density-${design.density}`,
    `lp-hero-vehicle-offer--cta-${design.ctaStyle}`,
    `lp-hero-vehicle-offer--align-${design.alignContent}`,
    design.showOfferBadge ? 'lp-hero-vehicle-offer--has-badge' : 'lp-hero-vehicle-offer--no-badge',
  ].join(' ');
}
