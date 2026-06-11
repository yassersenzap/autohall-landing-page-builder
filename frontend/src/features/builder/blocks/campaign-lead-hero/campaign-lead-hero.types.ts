import type { BrandPresetId } from '../../brand-presets';
import type { HeroCropPreset } from '../hero-vehicle-offer/hero-image-controls';

export type CampaignLeadHeroLayoutVariant =
  | 'media_left_form_right'
  | 'form_left_media_right'
  | 'background_media_form_right'
  | 'background_media_form_left'
  | 'dual_media_form_right'
  | 'dual_media_form_left';

export type CampaignLeadHeroImageFit = 'cover' | 'contain';
export type CampaignLeadHeroImagePosition = 'left' | 'right' | 'center';
export type CampaignLeadHeroOverlayIntensity = 'none' | 'light' | 'medium' | 'heavy';
export type CampaignLeadHeroFormTheme = 'light' | 'dark' | 'glass';
export type CampaignLeadHeroContentPlacement = 'overlay_media' | 'beside_form' | 'hidden';

export type CampaignLeadHeroContent = {
  brandId: BrandPresetId;
  campaignTitle: string;
  campaignSubtitle: string;
  offerBadge: string;
  primaryImage: string | null;
  primaryImageAlt: string;
  secondaryImage?: string | null;
  secondaryImageAlt: string;
  mobileImage?: string | null;
  imageFit: CampaignLeadHeroImageFit;
  imagePosition: CampaignLeadHeroImagePosition;
  cropPreset: HeroCropPreset;
  focalPointX: number;
  focalPointY: number;
  overlayIntensity: CampaignLeadHeroOverlayIntensity;
  layoutVariant: CampaignLeadHeroLayoutVariant;
  contentPlacement: CampaignLeadHeroContentPlacement;
  formTitle: string;
  formSubtitle: string;
  formStepLabel: string;
  formPrimaryFieldLabel: string;
  formCtaLabel: string;
  legalText: string;
  footerText: string;
};

export type CampaignLeadHeroDesign = {
  tone: 'light' | 'dark' | 'brand';
  showOfferBadge: boolean;
  showProgressBar: boolean;
  formTheme: CampaignLeadHeroFormTheme;
};

export const CAMPAIGN_LEAD_HERO_TYPE = 'campaign_lead_hero' as const;

export type CampaignLeadHeroBlockType = typeof CAMPAIGN_LEAD_HERO_TYPE;
