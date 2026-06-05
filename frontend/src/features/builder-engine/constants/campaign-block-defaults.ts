/**
 * Defaults campagne Auto Hall — blocs plats livrables.
 */
import {
  DEFAULT_AUTOHALL_CONSENT_LABEL,
  DEFAULT_AUTOHALL_FORM_CONFIG,
  DEFAULT_AUTOHALL_REQUIRED_NOTE,
  buildAutoHallLeadFormFields,
} from './autohall-lead-form';
import {
  DEFAULT_CTA_DESIGN,
  DEFAULT_FORM_DESIGN,
  DEFAULT_HERO_DESIGN,
} from './default-block-design';

import {
  buildMediaOnlyDefaults,
  buildRichTextDefaults,
  buildSpacerDividerDefaults,
} from './utility-block-defaults';
import {
  buildCTABandDefaults,
  buildFAQDefaults,
  buildPricingTrimDefaults,
  buildTestimonialsDefaults,
  buildVideoEmbedDefaults,
} from './conversion-block-defaults';

export type HeroCampaignVariant =
  | 'promo_image_right'
  | 'promo_image_left'
  | 'sav_form_focus'
  | 'gamme_centered'
  | 'dark_split'
  | 'light_split'
  | 'minimal_lead';

export type HeroFormCampaignVariant =
  | 'text_left_form_right'
  | 'form_left_text_right'
  | 'image_left_form_right'
  | 'dark_promo_form'
  | 'sav_light_form';

export type VehicleOfferVariant =
  | 'image_right_offer_left'
  | 'image_left_offer_right'
  | 'offer_card'
  | 'offer_with_cta';

function heroDesignForVariant(variant: HeroCampaignVariant): Record<string, unknown> {
  switch (variant) {
    case 'promo_image_left':
      return { layoutVariant: 'split_image_left', backgroundMode: 'dark', mediaPosition: 'left', alignment: 'left' };
    case 'sav_form_focus':
      return { layoutVariant: 'split_image_right', backgroundMode: 'light', mediaPosition: 'right', alignment: 'left' };
    case 'gamme_centered':
      return { layoutVariant: 'centered', backgroundMode: 'light', mediaPosition: 'none', alignment: 'center' };
    case 'dark_split':
      return { layoutVariant: 'split_image_right', backgroundMode: 'dark', mediaPosition: 'right', alignment: 'left' };
    case 'light_split':
      return { layoutVariant: 'split_image_right', backgroundMode: 'light', mediaPosition: 'right', alignment: 'left' };
    case 'minimal_lead':
      return { layoutVariant: 'minimal', backgroundMode: 'light', mediaPosition: 'none', alignment: 'center' };
    case 'promo_image_right':
    default:
      return { layoutVariant: 'split_image_right', backgroundMode: 'dark', mediaPosition: 'right', alignment: 'left' };
  }
}

function campaignTypeForHeroVariant(variant: HeroCampaignVariant): string {
  if (variant === 'sav_form_focus') return 'sav';
  if (variant === 'gamme_centered') return 'gamme';
  if (variant === 'minimal_lead') return 'lead_capture';
  return 'promo';
}

export function buildHeroCampaignDefaults(
  variant: HeroCampaignVariant = 'promo_image_right',
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    layoutVariant: variant,
    campaignType: campaignTypeForHeroVariant(variant),
    eyebrow: '',
    title: '',
    subtitle: '',
    promoBadge: '',
    buttonText: '',
    buttonTarget: '#lead-form',
    secondaryButtonText: '',
    secondaryButtonTarget: '#offer',
    imageAssetId: '',
    imageUrl: '',
    alt: '',
    backgroundType: '',
    backgroundColor: '#18181b',
    overlayOpacity: '70',
    parallaxEnabled: false,
    shapeDividerBottom: false,
    design: { ...DEFAULT_HERO_DESIGN, ...heroDesignForVariant(variant) },
    ...overrides,
  };
}

function heroFormDesign(variant: HeroFormCampaignVariant): Record<string, unknown> {
  switch (variant) {
    case 'form_left_text_right':
      return { tone: 'light', imagePosition: 'none', contentAlignment: 'left' };
    case 'image_left_form_right':
      return { tone: 'dark', imagePosition: 'left', contentAlignment: 'left' };
    case 'dark_promo_form':
      return { tone: 'dark', imagePosition: 'right', contentAlignment: 'left' };
    case 'sav_light_form':
      return { tone: 'light', imagePosition: 'right', contentAlignment: 'left' };
    case 'text_left_form_right':
    default:
      return { tone: 'light', imagePosition: 'none', contentAlignment: 'left' };
  }
}

export function buildHeroFormCampaignDefaults(
  variant: HeroFormCampaignVariant = 'sav_light_form',
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const isSav = variant === 'sav_light_form';
  return {
    layoutVariant: variant,
    campaignType: isSav ? 'sav' : 'promo',
    eyebrow: isSav ? 'Service Auto Hall' : '',
    title: '',
    subtitle: '',
    promoBadge: '',
    buttonText: '',
    buttonTarget: '#lead-form',
    imageAssetId: '',
    imageUrl: '',
    alt: '',
    design: heroFormDesign(variant),
    form: {
      title: isSav ? 'Demande SAV' : 'Contactez-nous',
      subtitle: '',
      submitText: 'Envoyer votre demande',
      privacyNote:
        'Conformément à la loi 09-08, vous disposez d’un droit d’accès et de rectification de vos données.',
      consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
      requiredFieldsNote: DEFAULT_AUTOHALL_REQUIRED_NOTE,
      formConfig: { ...DEFAULT_AUTOHALL_FORM_CONFIG },
      fields: buildAutoHallLeadFormFields(DEFAULT_AUTOHALL_FORM_CONFIG),
      design: { ...DEFAULT_FORM_DESIGN, layoutVariant: 'card_below' },
    },
    ...overrides,
  };
}

export function buildVehicleOfferDefaults(
  variant: VehicleOfferVariant = 'image_right_offer_left',
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    layoutVariant: variant,
    modelName: '',
    heading: '',
    subtitle: '',
    priceLabel: 'À partir de',
    priceValue: '',
    buttonText: '',
    buttonTarget: '#lead-form',
    legalNote: '',
    imageAssetId: '',
    imageUrl: '',
    alt: '',
    highlights: [],
    design: { ...DEFAULT_CTA_DESIGN },
    ...overrides,
  };
}

/** Master block V3 — hero plein écran + formulaire flottant (référence Auto Hall). */
export function buildPromoAutoHallDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    eyebrow: 'Auto Hall',
    title: 'Votre prochaine aventure commence ici',
    subtitle: 'Offres exclusives, financement sur mesure et essai en concession.',
    legalNote:
      '* Offre soumise à conditions. Photos non contractuelles. Voir détail en concession Auto Hall.',
    promoBadge: 'Offre limitée',
    imageUrl: '',
    imageAssetId: '',
    imageAlt: 'Véhicule en promotion Auto Hall',
    backgroundType: 'image',
    backgroundColor: '#0f172a',
    overlayOpacity: '80',
    parallaxEnabled: false,
    textAlignment: 'left',
    sectionPadding: 'M',
    anchorId: '',
    formBorderRadius: 16,
    formGlassEffect: false,
    shapeDividerBottom: false,
    formTitle: 'Demandez votre offre personnalisée',
    formSubtitle: 'Un conseiller vous recontacte sous 24 h ouvrées.',
    submitText: 'Envoyer ma demande',
    consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
    requiredFieldsNote: DEFAULT_AUTOHALL_REQUIRED_NOTE,
    formConfig: { ...DEFAULT_AUTOHALL_FORM_CONFIG },
    fields: buildAutoHallLeadFormFields(DEFAULT_AUTOHALL_FORM_CONFIG),
    ...overrides,
  };
}

export function buildVehicleFeaturesDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    heading: 'Caractéristiques clés',
    subtitle: 'Technologie, performance et confort au service de votre mobilité.',
    items: [
      { title: 'Moteur Hybride', description: 'Performance et efficience combinées.', icon: 'fuel' },
      { title: 'Consommation 4L/100', description: 'Efficacité énergétique optimisée.', icon: 'gauge' },
      { title: 'Boîte Automatique', description: 'Conduite fluide en toute situation.', icon: 'settings' },
    ],
    ...overrides,
  };
}

export function buildGalleryDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    heading: 'Galerie véhicule',
    images: [
      { url: '', alt: 'Vue avant' },
      { url: '', alt: 'Vue profil' },
      { url: '', alt: 'Vue intérieur' },
    ],
    ...overrides,
  };
}

/** Defaults neutres pour palette (contenu vide). */
export const CAMPAIGN_BLOCK_NEUTRAL_DEFAULTS: Record<string, Record<string, unknown>> = {
  promo_autohall: buildPromoAutoHallDefaults(),
  hero_campaign: buildHeroCampaignDefaults('promo_image_right'),
  hero_form_campaign: buildHeroFormCampaignDefaults('sav_light_form'),
  vehicle_offer: buildVehicleOfferDefaults('image_right_offer_left'),
  vehicle_features: buildVehicleFeaturesDefaults(),
  gallery: buildGalleryDefaults(),
  rich_text: buildRichTextDefaults(),
  media_only: buildMediaOnlyDefaults(),
  spacer_divider: buildSpacerDividerDefaults(),
  video_embed: buildVideoEmbedDefaults(),
  cta_band: buildCTABandDefaults(),
  pricing_trim: buildPricingTrimDefaults(),
  faq: buildFAQDefaults(),
  testimonials: buildTestimonialsDefaults(),
};
