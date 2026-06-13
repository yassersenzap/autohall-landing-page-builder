import { buildFooterLegalDefaults } from '../constants/campaign-block-defaults';
import { buildCoreCampaignFormLandingDefaults } from '@/features/builder/blocks/core-campaign-form-landing/core-campaign-form-landing.defaults';
import type { CampaignPageTemplate } from './campaign-page-templates.types';

const FOOTER = buildFooterLegalDefaults({
  legalText:
    '© Auto Hall — Offre soumise à conditions. Photos non contractuelles. Données personnelles traitées conformément à la loi 09-08.',
});

export const CORE_CAMPAIGN_TEMPLATES: CampaignPageTemplate[] = [
  {
    id: 'core-campaign-visual-form',
    name: 'Campagne visuel + formulaire',
    description:
      'Landing type campagne Auto Hall — visuel fort et formulaire latéral pour capture lead.',
    brandId: 'autohall',
    category: 'campaign',
    useCase: 'conversion',
    previewLabel: 'Campagne + form',
    recommendedUse: 'Pages promo concession, offres limitées, campagnes digitales.',
    blocks: [
      {
        type: 'core_campaign_form_landing',
        label: 'Landing campagne',
        props: buildCoreCampaignFormLandingDefaults({
          coreLayout: 'full_width_banner_form_side',
          visualType: 'campaign_image',
          formMode: 'contact',
          stepCount: 3,
          title: 'Profitez de nos offres du moment',
          subtitle: 'Un conseiller Auto Hall vous accompagne sous 24 h.',
          formTitle: 'Demandez votre offre',
          formSubtitle: 'Étape 1 — vos coordonnées',
          submitText: 'Suivant',
        }),
      },
      { type: 'footer_legal', props: FOOTER },
    ],
  },
  {
    id: 'core-vehicle-test-drive',
    name: 'Modèle véhicule + essai',
    description:
      'Page modèle type Chery — visuel véhicule, contenu modèle et formulaire essai.',
    brandId: 'chery',
    category: 'model',
    useCase: 'vehicle-offer',
    previewLabel: 'Modèle + essai',
    recommendedUse: 'Landing modèle, lancement véhicule, essai en concession.',
    blocks: [
      {
        type: 'core_campaign_form_landing',
        label: 'Landing modèle',
        props: buildCoreCampaignFormLandingDefaults({
          coreLayout: 'image_left_form_right',
          visualType: 'vehicle_image',
          formMode: 'test_drive',
          stepCount: 2,
          brandLogoText: 'Chery',
          title: 'Découvrez le nouveau modèle',
          subtitle: 'Design, technologie et efficience pour votre quotidien.',
          offerLine: 'Essai gratuit en concession',
          formTitle: 'Réservez votre essai',
          formSubtitle: 'Choisissez votre ville et votre créneau',
          submitText: 'Confirmer mon essai',
        }),
      },
      { type: 'footer_legal', props: FOOTER },
    ],
  },
  {
    id: 'core-range-offer-form',
    name: 'Gamme / offre + formulaire',
    description:
      'Landing gamme thermique — bannière campagne, sélection modèle et formulaire en 3 étapes.',
    brandId: 'ford',
    category: 'model',
    useCase: 'vehicle-offer',
    previewLabel: 'Gamme + form',
    recommendedUse: 'Pages gamme, offres thermiques/hybrides, sélection modèle.',
    blocks: [
      {
        type: 'core_campaign_form_landing',
        label: 'Landing gamme',
        props: buildCoreCampaignFormLandingDefaults({
          coreLayout: 'background_image_form_card',
          visualType: 'campaign_image',
          formMode: 'model_interest',
          stepCount: 3,
          fieldsPreset: 'model_city',
          title: 'Trouvez le modèle qui vous correspond',
          subtitle: 'Thermique, hybride ou électrique — nos conseillers vous guident.',
          formTitle: 'Configurez votre demande',
          formSubtitle: 'Étape 1/3 — modèle et ville',
          submitText: 'Suivant',
        }),
      },
      { type: 'footer_legal', props: FOOTER },
    ],
  },
];

export function getCoreCampaignTemplates(): CampaignPageTemplate[] {
  return CORE_CAMPAIGN_TEMPLATES;
}

export function getCoreCampaignTemplateById(id: string): CampaignPageTemplate | undefined {
  return CORE_CAMPAIGN_TEMPLATES.find((t) => t.id === id);
}
