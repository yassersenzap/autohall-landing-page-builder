/**
 * Defaults pour nouveaux blocs du builder — contenu vide, structure conservée.
 * Ne pas confondre avec DEFAULT_EDITOR_BLOCK_PROPS (templates / legacy).
 */
import {
  DEFAULT_CTA_DESIGN,
  DEFAULT_FEATURES_DESIGN,
  DEFAULT_FOOTER_DESIGN,
  DEFAULT_FORM_DESIGN,
  DEFAULT_HERO_DESIGN,
  DEFAULT_IMAGE_DESIGN,
  DEFAULT_TEXT_DESIGN,
} from './default-block-design';

import {
  DEFAULT_AUTOHALL_CONSENT_LABEL,
  DEFAULT_AUTOHALL_FORM_CONFIG,
  DEFAULT_AUTOHALL_REQUIRED_NOTE,
  buildAutoHallLeadFormFields,
} from './autohall-lead-form';

import {
  buildHeroCampaignDefaults,
  buildHeroFormCampaignDefaults,
  buildVehicleOfferDefaults,
} from './campaign-block-defaults';
import {
  campaignLeadHeroDefaultContent,
  campaignLeadHeroDefaultDesign,
} from '@/features/builder/blocks/campaign-lead-hero';
import {
  heroVehicleOfferDefaultContent,
  heroVehicleOfferDefaultDesign,
} from '@/features/builder/blocks/hero-vehicle-offer';

export const BUILDER_NEUTRAL_DEFAULT_PROPS: Record<string, Record<string, unknown>> = {
  hero_campaign: buildHeroCampaignDefaults('promo_image_right'),
  hero_form_campaign: buildHeroFormCampaignDefaults('sav_light_form'),
  hero_vehicle_offer: {
    ...heroVehicleOfferDefaultContent,
    design: { ...heroVehicleOfferDefaultDesign },
  },
  campaign_lead_hero: {
    ...campaignLeadHeroDefaultContent,
    design: { ...campaignLeadHeroDefaultDesign },
  },
  vehicle_offer: buildVehicleOfferDefaults('image_right_offer_left'),
  hero: {
    eyebrow: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonTarget: '#lead-form',
    secondaryButtonText: '',
    secondaryButtonTarget: '#offer',
    campaignType: 'promo',
    promoBadge: '',
    imageUrl: '',
    imageAssetId: '',
    alt: '',
    design: { ...DEFAULT_HERO_DESIGN },
  },
  lead_form: {
    title: '',
    subtitle: '',
    submitText: 'Envoyer votre demande',
    privacyNote:
      'Conformément à la loi 09-08, vous disposez d’un droit d’accès et de rectification de vos données.',
    consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
    requiredFieldsNote: DEFAULT_AUTOHALL_REQUIRED_NOTE,
    formConfig: { ...DEFAULT_AUTOHALL_FORM_CONFIG },
    fields: buildAutoHallLeadFormFields(DEFAULT_AUTOHALL_FORM_CONFIG),
    reassurance: [],
    design: { ...DEFAULT_FORM_DESIGN },
  },
  trust_bar: {
    metrics: [],
  },
  features: {
    modelName: '',
    modelTagline: '',
    heading: '',
    subtitle: '',
    imageUrl: '',
    imageAssetId: '',
    alt: '',
    items: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
    design: { ...DEFAULT_FEATURES_DESIGN },
  },
  text: {
    heading: '',
    content: '',
    design: { ...DEFAULT_TEXT_DESIGN },
  },
  image: {
    imageUrl: '',
    imageAssetId: '',
    alt: '',
    caption: '',
    design: { ...DEFAULT_IMAGE_DESIGN },
  },
  faq: {
    heading: '',
    subtitle: '',
    items: [{ question: '', answer: '' }],
  },
  final_cta: {
    title: '',
    subtitle: '',
    buttonText: '',
    buttonTarget: '#lead-form',
    design: { ...DEFAULT_CTA_DESIGN },
  },
  footer_legal: {
    legalText: '',
    links: [],
    design: { ...DEFAULT_FOOTER_DESIGN },
  },
  benefits: {
    heading: '',
    subtitle: '',
    items: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
  },
  offer_highlights: {
    heading: '',
    subtitle: '',
    modelName: '',
    tagline: '',
    priceLabel: 'À partir de',
    priceValue: '',
    monthlyValue: '',
    buttonText: '',
    buttonTarget: '#lead-form',
    imageUrl: '',
    imageAssetId: '',
    alt: '',
    highlights: [],
  },
  financing: {
    heading: '',
    subtitle: '',
    paymentExample: '',
    bullets: [],
    ctaLabel: 'Demander un financement',
    ctaTarget: '#lead-form',
  },
  vehicle_range: {
    heading: '',
    subtitle: '',
    vehicles: [
      { name: '', energy: 'Thermique', tag: '', imageUrl: '', imageAssetId: '', alt: '', ctaText: 'Découvrir', ctaTarget: '#lead-form' },
      { name: '', energy: 'HEV', tag: '', imageUrl: '', imageAssetId: '', alt: '', ctaText: 'Découvrir', ctaTarget: '#lead-form' },
      { name: '', energy: 'Thermique', tag: '', imageUrl: '', imageAssetId: '', alt: '', ctaText: 'Découvrir', ctaTarget: '#lead-form' },
    ],
  },
};
