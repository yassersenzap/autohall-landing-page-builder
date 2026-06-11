import type { BrandPresetId } from '../../brand-presets';
import type { ImageFit, ImagePosition, OverlayIntensity } from '../../block-registry/image-control.types';
import type { HeroCropPreset } from './hero-image-controls';

export type HeroVehicleOfferLayoutVariant =
  | 'split-media-right'
  | 'split-media-left'
  | 'full-bleed-overlay'
  | 'stacked-mobile';

export type HeroVehicleOfferContent = {
  brandId: BrandPresetId;
  modelName: string;
  headline: string;
  subheadline: string;
  offerLabel: string;
  priceText: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  heroImage: string | null;
  heroImageAlt: string;
  imageFit: ImageFit;
  imagePosition: ImagePosition;
  /** @deprecated Use cropPreset — kept for legacy documents */
  focalPoint?: 'center' | 'left' | 'right' | 'top' | 'bottom';
  cropPreset: HeroCropPreset;
  focalPointX: number;
  focalPointY: number;
  overlayIntensity: OverlayIntensity;
  layoutVariant: HeroVehicleOfferLayoutVariant;
  mobileImage?: string | null;
};

export type HeroVehicleOfferDesign = {
  tone: 'light' | 'dark' | 'brand';
  density: 'compact' | 'comfortable' | 'immersive';
  ctaStyle: 'primary' | 'outline' | 'ghost';
  showOfferBadge: boolean;
  alignContent: 'left' | 'center';
};

export const HERO_VEHICLE_OFFER_TYPE = 'hero_vehicle_offer' as const;

export type HeroVehicleOfferBlockType = typeof HERO_VEHICLE_OFFER_TYPE;
