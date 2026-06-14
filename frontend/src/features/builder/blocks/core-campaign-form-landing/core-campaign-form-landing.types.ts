import type { LeadFormConfig } from '@/features/builder-engine/constants/autohall-lead-form';

/** Orientation métier du split visuel / formulaire (standard Auto Hall). */
export type CoreLayoutDirection = 'image-left' | 'image-right';

/** Variante de mise en page au-delà du split classique. */
export type CoreLayoutVariant = 'split' | 'background' | 'banner';

/** Clé CSS interne — dérivée de layoutDirection + layoutVariant (rétrocompat coreLayout). */
export type CoreCampaignLayout =
  | 'image_left_form_right'
  | 'form_left_image_right'
  | 'background_image_form_card'
  | 'full_width_banner_form_side';

export type CoreVisualType = 'campaign_image' | 'vehicle_image';

export type CoreFormMode = 'test_drive' | 'contact' | 'callback' | 'model_interest';

export type CoreFieldsPreset = 'city_date' | 'model_city' | 'name_phone' | 'contact_preference';

export type CoreStepCount = 2 | 3;

export type CoreCampaignFormLandingFormProps = {
  title?: string;
  subtitle?: string;
  submitText?: string;
  consentLabel?: string;
  requiredFieldsNote?: string;
  formConfig?: LeadFormConfig;
  fields?: Record<string, unknown>[];
};

export type CoreCampaignFormLandingProps = {
  layoutDirection: CoreLayoutDirection;
  layoutVariant: CoreLayoutVariant;
  /** @deprecated dérivé automatiquement — conservé pour documents JSON existants */
  coreLayout?: CoreCampaignLayout;
  visualType: CoreVisualType;
  formMode: CoreFormMode;
  stepCount: CoreStepCount;
  fieldsPreset: CoreFieldsPreset;
  overlayStrength: 'light' | 'medium' | 'strong';
  brandLogoText?: string;
  title?: string;
  subtitle?: string;
  offerLine?: string;
  legalNote?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  imageAssetId?: string;
  imageUrl?: string;
  alt?: string;
  formTitle?: string;
  formSubtitle?: string;
  submitText?: string;
  consentLabel?: string;
  requiredFieldsNote?: string;
  footerCopyright?: string;
  formConfig?: LeadFormConfig;
  fields?: Record<string, unknown>[];
  form?: CoreCampaignFormLandingFormProps;
  design?: Record<string, unknown>;
};
