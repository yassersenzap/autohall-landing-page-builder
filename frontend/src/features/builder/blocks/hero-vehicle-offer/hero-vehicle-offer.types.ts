import type { BrandPresetId } from '../../brand-presets';
import type {
  ImageFit,
  ImageFocalPoint,
  ImagePosition,
  OverlayIntensity,
} from '../../block-registry/image-control.types';

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
  imageFit: ImageFit;
  imagePosition: ImagePosition;
  focalPoint: ImageFocalPoint;
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
