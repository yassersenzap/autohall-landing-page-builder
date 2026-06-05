import type { PageThemeDraft } from '../builder-engine/store/builder-document.store';
import {
  buildHeroCampaignDefaults,
  buildHeroFormCampaignDefaults,
  buildVehicleOfferDefaults,
} from '../builder-engine/constants/campaign-block-defaults';
import {
  DEFAULT_AUTOHALL_CONSENT_LABEL,
  DEFAULT_AUTOHALL_FORM_CONFIG,
  buildAutoHallLeadFormFields,
} from '../builder-engine/constants/autohall-lead-form';
import { isDeliverableBlockType } from '../builder-engine/registry/block-registry';

export type LandingTemplateId =
  | 'sav_offer'
  | 'ford_promo'
  | 'gamme_thermique'
  | 'gamme_hev'
  | 'quick_lead';

export type LandingTemplateBlock = {
  blockType: string;
  propsJson: Record<string, unknown>;
};

export type LandingTemplate = {
  id: LandingTemplateId;
  name: string;
  description: string;
  audience: string;
  blocks: LandingTemplateBlock[];
  themeDefaults?: Partial<PageThemeDraft>;
};

const AUTOHALL_THEME = { primaryColor: '#003B73' } as const;

const FORM_CENTER = {
  title: 'Contactez-nous',
  submitText: 'Envoyer votre demande',
  consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
  formConfig: { ...DEFAULT_AUTOHALL_FORM_CONFIG },
  fields: buildAutoHallLeadFormFields(DEFAULT_AUTOHALL_FORM_CONFIG),
  design: { layoutVariant: 'card_below' },
};

export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: 'sav_offer',
    name: 'Offre SAV',
    description: 'Hero SAV + formulaire, avantages, FAQ et footer.',
    audience: 'offresav.myautohall.ma',
    themeDefaults: {
      mode: 'light',
      ...AUTOHALL_THEME,
      seoTitle: 'Offres SAV — Auto Hall',
      seoDescription: 'Services, entretien et prise de contact atelier Auto Hall.',
    },
    blocks: [
      {
        blockType: 'hero_form_campaign',
        propsJson: buildHeroFormCampaignDefaults('sav_light_form', {
          eyebrow: 'Service Auto Hall',
          title: 'Votre véhicule entre de bonnes mains',
          subtitle: 'Entretien, réparation et services après-vente par nos experts.',
          form: {
            title: 'Demande SAV',
            submitText: 'Envoyer votre demande',
            consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
            formConfig: { ...DEFAULT_AUTOHALL_FORM_CONFIG, showVehicleModel: false },
            fields: buildAutoHallLeadFormFields({
              ...DEFAULT_AUTOHALL_FORM_CONFIG,
              showVehicleModel: false,
            }),
          },
        }),
      },
      {
        blockType: 'benefits',
        propsJson: {
          heading: 'Pourquoi choisir Auto Hall SAV',
          subtitle: 'Un réseau national à votre service.',
          items: [
            { title: 'Techniciens certifiés', description: 'Expertise constructeur garantie.' },
            { title: 'Pièces d’origine', description: 'Qualité et durabilité assurées.' },
            { title: 'Réponse rapide', description: 'Prise en charge sous 48 h.' },
          ],
        },
      },
      {
        blockType: 'faq',
        propsJson: {
          heading: 'Questions fréquentes',
          items: [
            { question: 'Comment prendre rendez-vous ?', answer: 'Remplissez le formulaire, un conseiller vous rappelle.' },
            { question: 'Quels services proposez-vous ?', answer: 'Entretien, réparation, diagnostic et pièces détachées.' },
          ],
        },
      },
      {
        blockType: 'footer_legal',
        propsJson: {
          legalText: 'Offre SAV Auto Hall — informations légales sur demande.',
        },
      },
    ],
  },
  {
    id: 'ford_promo',
    name: 'Ford Promo',
    description: 'Hero promo, offre véhicule, formulaire, CTA et footer.',
    audience: 'fordpromo.myautohall.ma',
    themeDefaults: {
      mode: 'dark',
      ...AUTOHALL_THEME,
      seoTitle: 'Promotion — Auto Hall',
      seoDescription: 'Découvrez l’offre et contactez un conseiller Auto Hall.',
    },
    blocks: [
      {
        blockType: 'hero_campaign',
        propsJson: buildHeroCampaignDefaults('dark_split', {
          campaignType: 'promo',
          eyebrow: 'Promotion',
          title: 'L’offre du moment',
          subtitle: 'Un véhicule sélectionné à conditions exceptionnelles.',
          buttonText: 'Découvrir l’offre',
          buttonTarget: '#offer',
        }),
      },
      {
        blockType: 'vehicle_offer',
        propsJson: buildVehicleOfferDefaults('image_right_offer_left', {
          modelName: 'Ford',
          heading: 'Offre exclusive',
          subtitle: 'Stock limité — contactez un conseiller.',
          priceLabel: 'À partir de',
          priceValue: '',
          highlights: [
            { title: 'Remise exceptionnelle', description: 'Sur une sélection de modèles.' },
            { title: 'Reprise valorisée', description: 'Estimation rapide de votre véhicule.' },
          ],
          buttonText: 'Demander un devis',
          buttonTarget: '#lead-form',
        }),
      },
      {
        blockType: 'lead_form',
        propsJson: { ...FORM_CENTER },
      },
      {
        blockType: 'final_cta',
        propsJson: {
          title: 'Prêt à passer à l’action ?',
          subtitle: 'Réservez votre essai ou demandez un rappel.',
          buttonText: 'Je réserve mon essai',
          buttonTarget: '#lead-form',
        },
      },
      {
        blockType: 'footer_legal',
        propsJson: {
          legalText: 'Offre sous réserve de disponibilité. Photos non contractuelles.',
        },
      },
    ],
  },
  {
    id: 'gamme_thermique',
    name: 'Gamme thermique',
    description: 'Hero gamme, grille modèles, avantages, formulaire, FAQ et footer.',
    audience: 'autohall.ma/campagne/gamme-thermique',
    themeDefaults: {
      mode: 'light',
      ...AUTOHALL_THEME,
      seoTitle: 'Gamme thermique — Auto Hall',
      seoDescription: 'Découvrez la gamme thermique Auto Hall.',
    },
    blocks: [
      {
        blockType: 'hero_campaign',
        propsJson: buildHeroCampaignDefaults('gamme_centered', {
          campaignType: 'gamme',
          title: 'Gamme thermique',
          subtitle: 'Motorisations essence et diesel.',
          buttonText: 'Demander des infos',
          buttonTarget: '#lead-form',
        }),
      },
      {
        blockType: 'vehicle_range',
        propsJson: {
          heading: 'Nos modèles',
          subtitle: 'Sélectionnez un modèle.',
          vehicles: [
            { name: 'Modèle 1', energy: 'Thermique', ctaText: 'Découvrir', ctaTarget: '#lead-form' },
            { name: 'Modèle 2', energy: 'Thermique', ctaText: 'Découvrir', ctaTarget: '#lead-form' },
            { name: 'Modèle 3', energy: 'Thermique', ctaText: 'Découvrir', ctaTarget: '#lead-form' },
          ],
        },
      },
      {
        blockType: 'benefits',
        propsJson: {
          heading: 'Les avantages Auto Hall',
          items: [
            { title: 'Conseillers dédiés', description: 'Un interlocuteur unique.' },
            { title: 'Financement adapté', description: 'Solutions mensualisées.' },
            { title: 'Réseau national', description: 'Présence dans tout le Maroc.' },
          ],
        },
      },
      {
        blockType: 'lead_form',
        propsJson: { ...FORM_CENTER },
      },
      {
        blockType: 'faq',
        propsJson: {
          heading: 'FAQ',
          items: [
            { question: 'Quels modèles sont disponibles ?', answer: 'Consultez la grille ci-dessus.' },
          ],
        },
      },
      {
        blockType: 'footer_legal',
        propsJson: { legalText: 'Auto Hall — gamme thermique. Mentions légales sur demande.' },
      },
    ],
  },
  {
    id: 'gamme_hev',
    name: 'Gamme HEV',
    description: 'Hero HEV, grille hybride, avantages, formulaire et footer.',
    audience: 'autohall.ma/campagne/gamme-hev',
    themeDefaults: {
      mode: 'light',
      ...AUTOHALL_THEME,
      seoTitle: 'Gamme HEV — Auto Hall',
      seoDescription: 'Découvrez la gamme hybride Auto Hall.',
    },
    blocks: [
      {
        blockType: 'hero_campaign',
        propsJson: buildHeroCampaignDefaults('gamme_centered', {
          campaignType: 'gamme',
          title: 'Gamme hybride (HEV)',
          subtitle: 'Efficience et confort au quotidien.',
          buttonText: 'Demander des infos',
          buttonTarget: '#lead-form',
        }),
      },
      {
        blockType: 'vehicle_range',
        propsJson: {
          heading: 'Modèles hybrides',
          vehicles: [
            { name: 'Modèle HEV 1', energy: 'Hybride', tag: 'HEV', ctaText: 'Découvrir', ctaTarget: '#lead-form' },
            { name: 'Modèle HEV 2', energy: 'Hybride', tag: 'HEV', ctaText: 'Découvrir', ctaTarget: '#lead-form' },
          ],
        },
      },
      {
        blockType: 'benefits',
        propsJson: {
          heading: 'Pourquoi l’hybride',
          items: [
            { title: 'Consommation réduite', description: 'Idéal en ville et sur route.' },
            { title: 'Confort premium', description: 'Silencieux et fluide.' },
          ],
        },
      },
      {
        blockType: 'lead_form',
        propsJson: { ...FORM_CENTER },
      },
      {
        blockType: 'footer_legal',
        propsJson: { legalText: 'Auto Hall — gamme HEV. Mentions légales sur demande.' },
      },
    ],
  },
  {
    id: 'quick_lead',
    name: 'Capture lead rapide',
    description: 'Hero minimal + formulaire, confiance et footer.',
    audience: 'Landing contact rapide',
    themeDefaults: {
      mode: 'light',
      primaryColor: '#b91c1c',
      seoTitle: 'Contact — Auto Hall',
      seoDescription: 'Laissez vos coordonnées, un conseiller Auto Hall vous recontacte.',
    },
    blocks: [
      {
        blockType: 'hero_form_campaign',
        propsJson: buildHeroFormCampaignDefaults('text_left_form_right', {
          campaignType: 'lead_capture',
          title: 'Parlez à un conseiller',
          subtitle: 'Une question sur un véhicule ou un service ?',
          form: { ...FORM_CENTER, title: 'Vos coordonnées' },
        }),
      },
      {
        blockType: 'trust_bar',
        propsJson: {
          metrics: [
            { value: '48 h', label: 'Réponse garantie' },
            { value: 'Réseau', label: 'National Auto Hall' },
          ],
        },
      },
      {
        blockType: 'footer_legal',
        propsJson: { legalText: 'Auto Hall — contact. Données traitées conformément à la loi 09-08.' },
      },
    ],
  },
];

export function getLandingTemplate(id: LandingTemplateId): LandingTemplate | undefined {
  return LANDING_TEMPLATES.find((template) => template.id === id);
}

export function assertTemplateUsesDeliverableBlocks(template: LandingTemplate): void {
  for (const b of template.blocks) {
    if (!isDeliverableBlockType(b.blockType)) {
      throw new Error(`Template ${template.id} uses non-deliverable block: ${b.blockType}`);
    }
  }
}
