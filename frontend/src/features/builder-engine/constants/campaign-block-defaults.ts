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
    eyebrow: 'Auto Hall',
    title: 'Réservez votre essai en concession',
    subtitle: 'Découvrez nos offres du moment et bénéficiez de l’accompagnement de nos conseillers.',
    promoBadge: 'Offre du moment',
    buttonText: 'Réserver un essai',
    buttonTarget: '#lead-form',
    secondaryButtonText: 'Voir l’offre',
    secondaryButtonTarget: '#offer',
    imageAssetId: '',
    imageUrl: '',
    alt: 'Véhicule en promotion Auto Hall',
    legalNote: 'Offre soumise à conditions. Photos non contractuelles.',
    trustItems: [
      'Un conseiller Auto Hall vous accompagne sous 24h',
      'Essai en concession sans engagement',
    ],
    backgroundType: '',
    backgroundColor: '#18181b',
    overlayOpacity: '70',
    parallaxEnabled: false,
    shapeDividerBottom: false,
    design: {
      ...DEFAULT_HERO_DESIGN,
      ...heroDesignForVariant(variant),
      variant: 'standard',
      tone: 'brand',
      density: 'comfortable',
      mediaPosition: 'right',
      alignment: 'left',
    },
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

const DEFAULT_PREMIUM_DESIGN = {
  variant: 'split-form',
  tone: 'light',
  mediaPosition: 'right',
  density: 'comfortable',
  imageShape: 'rounded-card',
  ctaStyle: 'primary',
} as const;

export function buildHeroFormCampaignDefaults(
  variant: HeroFormCampaignVariant = 'text_left_form_right',
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    layoutVariant: variant,
    campaignType: 'promo',
    eyebrow: 'Auto Hall',
    title: 'Réservez votre essai en concession',
    subtitle:
      'Découvrez nos offres du moment et bénéficiez de l’accompagnement de nos conseillers.',
    promoBadge: 'Offre du moment',
    buttonText: '',
    buttonTarget: '#lead-form',
    imageAssetId: '',
    imageUrl: '',
    alt: 'Véhicule en promotion Auto Hall',
    legalNote: 'Offre soumise à conditions. Photos non contractuelles.',
    trustItems: [
      'Un conseiller Auto Hall vous accompagne sous 24h',
      'Essai en concession sans engagement',
      'Financements adaptés à votre projet',
    ],
    design: { ...DEFAULT_PREMIUM_DESIGN, ...heroFormDesign(variant) },
    form: {
      title: 'Demandez votre offre personnalisée',
      subtitle: 'Un conseiller vous recontacte sous 24 h ouvrées.',
      submitText: 'Envoyer ma demande',
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
    modelName: 'Nouveau modèle',
    heading: 'Découvrez nos offres du moment',
    subtitle: 'Performance, confort et technologies au service de votre mobilité.',
    priceLabel: 'À partir de',
    priceValue: '299 900 DH',
    monthlyValue: 'ou 3 499 DH / mois',
    buttonText: 'Demander une offre',
    buttonTarget: '#lead-form',
    legalNote: 'Offre soumise à conditions. Photos non contractuelles.',
    imageAssetId: '',
    imageUrl: '',
    alt: 'Véhicule en promotion Auto Hall',
    highlights: [
      {
        title: 'Garantie constructeur',
        description: 'Tranquillité sur le long terme.',
      },
      {
        title: 'Financement sur mesure',
        description: 'Solutions adaptées à votre budget.',
      },
      {
        title: 'Essai en concession',
        description: 'Réservez votre créneau en ligne.',
      },
    ],
    design: {
      ...DEFAULT_PREMIUM_DESIGN,
      mediaPosition: 'left',
    },
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
    subtitle: 'Découvrez le véhicule sous tous les angles en concession.',
    images: [
      { url: '', alt: 'Vue avant du véhicule' },
      { url: '', alt: 'Vue profil du véhicule' },
      { url: '', alt: 'Intérieur et habitacle' },
    ],
    design: { variant: 'grid', tone: 'neutral', alignment: 'center' },
    ...overrides,
  };
}

export function buildLeadFormDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    title: 'Parlez à un conseiller Auto Hall',
    subtitle: 'Un conseiller Auto Hall vous accompagne sous 24h.',
    submitText: 'Envoyer ma demande',
    privacyNote:
      'Conformément à la loi 09-08, vous disposez d’un droit d’accès et de rectification de vos données.',
    consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
    requiredFieldsNote: DEFAULT_AUTOHALL_REQUIRED_NOTE,
    formConfig: { ...DEFAULT_AUTOHALL_FORM_CONFIG },
    fields: buildAutoHallLeadFormFields(DEFAULT_AUTOHALL_FORM_CONFIG),
    reassurance: [
      'Réponse sous 24 h ouvrées',
      'Essai en concession sans engagement',
    ],
    design: { ...DEFAULT_FORM_DESIGN, variant: 'split', tone: 'light', alignment: 'split' },
    ...overrides,
  };
}

export function buildBenefitsDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    heading: 'Pourquoi choisir Auto Hall',
    subtitle: 'Un réseau de confiance pour votre mobilité au quotidien.',
    items: [
      { title: 'Réseau national', description: 'Plus de 50 points de vente et services à travers le pays.' },
      { title: 'Conseillers dédiés', description: 'Un interlocuteur unique pour votre projet automobile.' },
      { title: 'Services complets', description: 'Vente, financement, entretien et reprise sous un même toit.' },
    ],
    design: { variant: 'grid', tone: 'light', alignment: 'center' },
    ...overrides,
  };
}

export function buildTrustBarDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    metrics: [
      { value: '+50', label: 'Concessions Auto Hall' },
      { value: '24h', label: 'Réponse conseiller' },
      { value: '15 ans', label: 'D’expérience client' },
      { value: '4.8/5', label: 'Satisfaction clients' },
    ],
    design: { variant: 'standard', tone: 'neutral', alignment: 'center' },
    ...overrides,
  };
}

export function buildFinalCtaDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    title: 'Prêt à passer à l’action ?',
    subtitle: 'Réservez votre essai ou demandez une offre personnalisée dès maintenant.',
    buttonText: 'Réserver un essai',
    buttonTarget: '#lead-form',
    design: { variant: 'standard', tone: 'brand', alignment: 'center', ctaStyle: 'white' },
    ...overrides,
  };
}

export function buildFooterLegalDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    legalText:
      '© Auto Hall. Offre soumise à conditions. Photos non contractuelles. Mentions légales et politique de confidentialité disponibles en concession.',
    links: [
      { label: 'Mentions légales', href: '#' },
      { label: 'Politique de confidentialité', href: '#' },
      { label: 'Contact', href: '#lead-form' },
    ],
    design: { variant: 'standard', tone: 'neutral', alignment: 'center' },
    ...overrides,
  };
}

export function buildVehicleRangeDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    heading: 'Notre gamme du moment',
    subtitle: 'Thermique, hybride ou électrique — trouvez le modèle adapté à vos trajets.',
    vehicles: [
      {
        name: 'SUV Compact',
        energy: 'Hybride',
        tag: 'Best-seller',
        imageUrl: '',
        imageAssetId: '',
        alt: 'SUV compact Auto Hall',
        ctaText: 'Découvrir',
        ctaTarget: '#offer',
      },
      {
        name: 'Berline Executive',
        energy: 'Thermique',
        tag: 'Nouveauté',
        imageUrl: '',
        imageAssetId: '',
        alt: 'Berline executive Auto Hall',
        ctaText: 'Demander une offre',
        ctaTarget: '#lead-form',
      },
      {
        name: 'Citadine Connectée',
        energy: 'Électrique',
        tag: 'Éco',
        imageUrl: '',
        imageAssetId: '',
        alt: 'Citadine électrique Auto Hall',
        ctaText: 'Essai gratuit',
        ctaTarget: '#lead-form',
      },
    ],
    design: { variant: 'grid', tone: 'light', alignment: 'center' },
    ...overrides,
  };
}

/** Defaults neutres pour palette (contenu vide). */
export const CAMPAIGN_BLOCK_NEUTRAL_DEFAULTS: Record<string, Record<string, unknown>> = {
  promo_autohall: buildPromoAutoHallDefaults(),
  hero_campaign: buildHeroCampaignDefaults('promo_image_right'),
  hero_form_campaign: buildHeroFormCampaignDefaults('text_left_form_right'),
  lead_form: buildLeadFormDefaults(),
  vehicle_offer: buildVehicleOfferDefaults('image_right_offer_left'),
  vehicle_range: buildVehicleRangeDefaults(),
  vehicle_features: buildVehicleFeaturesDefaults(),
  gallery: buildGalleryDefaults(),
  rich_text: buildRichTextDefaults(),
  media_only: buildMediaOnlyDefaults(),
  spacer_divider: buildSpacerDividerDefaults(),
  video_embed: buildVideoEmbedDefaults(),
  cta_band: buildCTABandDefaults(),
  pricing_trim: buildPricingTrimDefaults(),
  benefits: buildBenefitsDefaults(),
  trust_bar: buildTrustBarDefaults(),
  faq: buildFAQDefaults(),
  testimonials: buildTestimonialsDefaults(),
  final_cta: buildFinalCtaDefaults(),
  footer_legal: buildFooterLegalDefaults(),
};
