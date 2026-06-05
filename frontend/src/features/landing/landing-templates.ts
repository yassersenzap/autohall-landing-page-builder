import type { PageThemeDraft } from '../builder-engine/store/builder-document.store';
import {
  DEFAULT_AUTOHALL_CONSENT_LABEL,
  DEFAULT_AUTOHALL_FORM_CONFIG,
  DEFAULT_AUTOHALL_REQUIRED_NOTE,
  buildAutoHallLeadFormFields,
} from '../builder-engine/constants/autohall-lead-form';
import type { EditorBlockType } from './landing-block-catalog';
import { BUILDER_NEUTRAL_DEFAULT_PROPS } from '../builder-engine/constants/neutral-default-props';

/** 3 templates V1 stables — blocs palette uniquement. */
export type LandingTemplateId = 'vehicle_offer' | 'sav_offer' | 'quick_lead';

export type LandingTemplateBlock = {
  blockType: EditorBlockType;
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

function block(
  blockType: EditorBlockType,
  overrides: Record<string, unknown> = {},
): LandingTemplateBlock {
  const base =
    (BUILDER_NEUTRAL_DEFAULT_PROPS[blockType] as Record<string, unknown> | undefined) ??
    {};
  return {
    blockType,
    propsJson: {
      ...JSON.parse(JSON.stringify(base)),
      ...overrides,
    },
  };
}

function campaignForm(overrides: Record<string, unknown> = {}): LandingTemplateBlock {
  return block('lead_form', {
    title: 'Contactez-nous',
    subtitle: 'Un conseiller Auto Hall vous recontacte.',
    submitText: 'Envoyer votre demande',
    privacyNote:
      'Conformément à la loi 09-08, vous disposez d’un droit d’accès et de rectification de vos données.',
    consentLabel: DEFAULT_AUTOHALL_CONSENT_LABEL,
    requiredFieldsNote: DEFAULT_AUTOHALL_REQUIRED_NOTE,
    formConfig: { ...DEFAULT_AUTOHALL_FORM_CONFIG },
    fields: buildAutoHallLeadFormFields(DEFAULT_AUTOHALL_FORM_CONFIG),
    design: { layoutVariant: 'card_right', backgroundMode: 'light' },
    ...overrides,
  });
}

export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: 'vehicle_offer',
    name: 'Offre véhicule',
    description: 'Hero, points forts, formulaire Auto Hall, FAQ et footer.',
    audience: 'Campagne promotionnelle véhicule',
    themeDefaults: {
      mode: 'dark',
      primaryColor: '#003B73',
      seoTitle: 'Offre véhicule — Auto Hall',
      seoDescription: 'Découvrez l’offre du moment et contactez un conseiller Auto Hall.',
    },
    blocks: [
      block('hero', {
        eyebrow: 'Offre en cours',
        title: 'Profitez de l’offre du moment',
        subtitle: 'Contactez-nous pour connaître les conditions en concession.',
        buttonText: 'Je suis intéressé',
        buttonTarget: '#lead-form',
        promoBadge: 'Offre limitée',
        design: { layoutVariant: 'split_image_right', backgroundMode: 'dark', mediaPosition: 'right' },
      }),
      block('features', {
        heading: 'Points forts',
        subtitle: 'Les atouts du véhicule ou de l’offre.',
        items: [
          { title: 'Garantie', description: 'Conditions constructeur à préciser.' },
          { title: 'Essai', description: 'Essai en concession sur rendez-vous.' },
          { title: 'Accompagnement', description: 'Conseiller dédié Auto Hall.' },
        ],
        design: { layoutVariant: 'grid_cards', backgroundMode: 'light' },
      }),
      campaignForm({ title: 'Contactez-moi', submitText: 'Envoyer' }),
      block('faq', {
        heading: 'Questions fréquentes',
        items: [
          { question: 'Comment profiter de l’offre ?', answer: 'Remplissez le formulaire, un conseiller vous rappelle.' },
          { question: 'Puis-je essayer le véhicule ?', answer: 'Oui, sur rendez-vous en concession.' },
        ],
      }),
      block('footer_legal', {
        legalText: 'Offre soumise à conditions. Auto Hall — mentions légales à compléter.',
      }),
    ],
  },
  {
    id: 'sav_offer',
    name: 'Offre SAV',
    description: 'Hero SAV, avantages, formulaire avec ville, réassurance et footer.',
    audience: 'Campagne service après-vente',
    themeDefaults: {
      mode: 'light',
      primaryColor: '#003B73',
      seoTitle: 'Offres SAV — Auto Hall',
      seoDescription: 'Services, entretien et prise de contact atelier Auto Hall.',
    },
    blocks: [
      block('hero', {
        eyebrow: 'Service Auto Hall',
        title: 'Entretien & services',
        subtitle: 'Prise de rendez-vous, garantie et suivi atelier.',
        buttonText: 'Prendre contact',
        buttonTarget: '#lead-form',
        design: { layoutVariant: 'split_image_right', backgroundMode: 'light', mediaPosition: 'right' },
      }),
      block('benefits', {
        heading: 'Nos engagements',
        items: [
          { title: 'Réseau national', description: 'Concessionnaires Auto Hall partout au Maroc.' },
          { title: 'Réponse rapide', description: 'Un conseiller vous recontacte sous 48 h.' },
          { title: 'Données protégées', description: 'Traitement conforme à la loi 09-08.' },
        ],
      }),
      campaignForm({ title: 'Demande SAV', subtitle: 'Sélectionnez votre ville et laissez vos coordonnées.' }),
      block('trust_bar', {
        metrics: [
          { value: 'Réseau', label: 'Auto Hall' },
          { value: '48 h', label: 'Réponse conseiller' },
          { value: 'Sécurisé', label: 'Données personnelles' },
        ],
      }),
      block('footer_legal', {
        legalText: 'Auto Hall — mentions légales et politique de confidentialité à compléter.',
      }),
    ],
  },
  {
    id: 'quick_lead',
    name: 'Capture lead rapide',
    description: 'Hero minimal, formulaire complet, réassurance et footer.',
    audience: 'Collecte de contacts rapide',
    themeDefaults: {
      mode: 'light',
      primaryColor: '#b91c1c',
      seoTitle: 'Contact — Auto Hall',
      seoDescription: 'Laissez vos coordonnées, un conseiller Auto Hall vous recontacte.',
    },
    blocks: [
      block('hero', {
        eyebrow: 'Auto Hall',
        title: 'Parlez à un conseiller',
        subtitle: 'Une question sur un véhicule ou un service ?',
        buttonText: 'Accéder au formulaire',
        buttonTarget: '#lead-form',
        design: { layoutVariant: 'centered', backgroundMode: 'light', mediaPosition: 'none', alignment: 'center' },
      }),
      campaignForm({ design: { layoutVariant: 'card_below' } }),
      block('trust_bar', {
        metrics: [
          { value: '48 h', label: 'Réponse garantie' },
          { value: 'Réseau', label: 'National Auto Hall' },
        ],
      }),
      block('footer_legal', {
        legalText: 'Auto Hall — mentions légales à compléter.',
        design: { layoutVariant: 'minimal' },
      }),
    ],
  },
];

export function getLandingTemplate(id: LandingTemplateId): LandingTemplate | undefined {
  return LANDING_TEMPLATES.find((template) => template.id === id);
}
