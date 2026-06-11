import type { BlockDefinition } from '../../block-registry/block-definition.types';
import type { CampaignLeadHeroContent, CampaignLeadHeroDesign } from './campaign-lead-hero.types';
import { CAMPAIGN_LEAD_HERO_TYPE } from './campaign-lead-hero.types';

export const campaignLeadHeroDefaultContent: CampaignLeadHeroContent = {
  brandId: 'chery',
  campaignTitle: 'Campagne de lancement',
  campaignSubtitle: 'Réservez votre essai et découvrez nos offres exclusives Auto Hall',
  offerBadge: 'Offre limitée',
  primaryImage: null,
  primaryImageAlt: '',
  secondaryImage: null,
  secondaryImageAlt: '',
  mobileImage: null,
  imageFit: 'cover',
  imagePosition: 'center',
  cropPreset: 'center',
  focalPointX: 50,
  focalPointY: 50,
  overlayIntensity: 'light',
  layoutVariant: 'media_left_form_right',
  contentPlacement: 'hidden',
  formTitle: 'Demandez votre offre',
  formSubtitle: 'Un conseiller Auto Hall vous recontacte sous 24h',
  formStepLabel: 'Étape 1 sur 3',
  formPrimaryFieldLabel: 'Sélectionnez un modèle',
  formCtaLabel: 'Continuer',
  legalText: 'En soumettant ce formulaire, vous acceptez d’être contacté par Auto Hall.',
  footerText: 'Photos non contractuelles. Offre sous réserve de disponibilité.',
};

export const campaignLeadHeroDefaultDesign: CampaignLeadHeroDesign = {
  tone: 'light',
  showOfferBadge: true,
  showProgressBar: true,
  formTheme: 'light',
};

export const campaignLeadHeroDefinition: BlockDefinition<
  typeof CAMPAIGN_LEAD_HERO_TYPE,
  CampaignLeadHeroContent,
  CampaignLeadHeroDesign
> = {
  type: CAMPAIGN_LEAD_HERO_TYPE,
  label: 'Hero campagne + lead',
  description:
    'Hero campagne SI Digital : visuel fort, formulaire step-based et layouts média/formulaire.',
  category: 'hero',
  availability: 'foundation',
  defaultContent: campaignLeadHeroDefaultContent,
  defaultDesign: campaignLeadHeroDefaultDesign,
  editableFields: [
    { key: 'brandId', label: 'Marque', fieldType: 'brand', required: true },
    { key: 'campaignTitle', label: 'Titre campagne', fieldType: 'text', required: true },
    { key: 'campaignSubtitle', label: 'Sous-titre', fieldType: 'textarea' },
    { key: 'offerBadge', label: 'Badge offre', fieldType: 'text' },
    { key: 'formTitle', label: 'Titre formulaire', fieldType: 'text', required: true },
    { key: 'formCtaLabel', label: 'CTA formulaire', fieldType: 'cta', required: true },
  ],
  designControls: [],
  imageControls: [],
  compatibleBrands: 'all',
  builderRenderer: 'CampaignLeadHeroBlockPreview',
  exportRenderer: 'campaign-lead-hero.render',
};
