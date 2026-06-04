import type { PageThemeDraft } from '../builder-engine/store/builder-document.store';
import type { EditorBlockType } from './landing-block-catalog';
import { BUILDER_NEUTRAL_DEFAULT_PROPS } from '../builder-engine/constants/neutral-default-props';

/** Modèles V1 premium — 4 parcours Auto Hall, sans images externes. */
export type LandingTemplateId =
  | 'test_drive'
  | 'seasonal_offer'
  | 'after_sales'
  | 'quick_lead';

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
  /** Thème page suggéré à l’application du modèle (local, sauvegardé avec la page). */
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

export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: 'test_drive',
    name: 'Essai véhicule',
    description: 'Hero premium, confiance, formulaire, FAQ courte et mentions légales.',
    audience: 'Demande d’essai en concession',
    themeDefaults: {
      mode: 'light',
      primaryColor: '#b91c1c',
      headingScale: 'normal',
      sectionSpacing: 'normal',
      buttonStyle: 'pill',
      seoTitle: 'Essai véhicule — Auto Hall',
      seoDescription: 'Réservez votre essai en concession Auto Hall.',
    },
    blocks: [
      block('hero', {
        eyebrow: 'Essai en concession',
        title: 'Réservez votre essai',
        subtitle: 'Indiquez vos coordonnées — un conseiller vous rappelle sous 48 h.',
        buttonText: 'Demander un essai',
        buttonTarget: '#lead-form',
        secondaryButtonText: '',
        design: {
          layoutVariant: 'split_image_right',
          backgroundMode: 'light',
          mediaPosition: 'right',
          headingSize: 'large',
          buttonSize: 'lg',
          buttonRadius: 'pill',
        },
      }),
      block('trust_bar', {
        metrics: [
          { value: '48 h', label: 'Délai de rappel' },
          { value: '100 %', label: 'Véhicules contrôlés' },
          { value: '15+', label: 'Années d’expérience' },
          { value: 'Réseau', label: 'National Auto Hall' },
        ],
      }),
      block('lead_form', {
        title: 'Votre demande d’essai',
        subtitle: 'Nom, téléphone et modèle souhaité.',
        submitText: 'Envoyer ma demande',
        privacyNote: 'Vos données sont utilisées uniquement pour traiter votre demande.',
        design: { layoutVariant: 'card_right', backgroundMode: 'light' },
      }),
      block('faq', {
        heading: 'Questions fréquentes',
        subtitle: 'Informations utiles avant votre essai.',
        items: [
          {
            question: 'Comment se déroule l’essai ?',
            answer: 'Un conseiller vous contacte pour fixer un créneau en concession.',
          },
          {
            question: 'Quels documents prévoir ?',
            answer: 'Permis de conduire en cours de validité et pièce d’identité.',
          },
        ],
      }),
      block('footer_legal', {
        legalText: 'Offre soumise à conditions. Auto Hall — mentions légales à compléter.',
        design: { layoutVariant: 'legal_full', backgroundMode: 'neutral' },
      }),
    ],
  },
  {
    id: 'seasonal_offer',
    name: 'Offre véhicule',
    description: 'Hero impact, caractéristiques, visuel, CTA et formulaire.',
    audience: 'Campagne promotionnelle',
    themeDefaults: {
      mode: 'dark',
      primaryColor: '#b91c1c',
      headingScale: 'large',
      sectionSpacing: 'spacious',
      buttonStyle: 'rounded',
      seoTitle: 'Offre véhicule — Auto Hall',
      seoDescription: 'Découvrez l’offre du moment dans le réseau Auto Hall.',
    },
    blocks: [
      block('hero', {
        eyebrow: 'Offre en cours',
        title: 'Votre offre du moment',
        subtitle: 'Stock limité — personnalisez les conditions et le financement.',
        buttonText: 'Profiter de l’offre',
        buttonTarget: '#lead-form',
        design: {
          layoutVariant: 'split_image_right',
          backgroundMode: 'dark',
          mediaPosition: 'right',
          headingSize: 'xlarge',
        },
      }),
      block('features', {
        heading: 'Points clés',
        modelName: 'Modèle',
        modelTagline: 'Courte description du véhicule.',
        items: [
          { title: 'Motorisation', description: 'À compléter selon le véhicule.' },
          { title: 'Équipements', description: 'Liste des équipements principaux.' },
          { title: 'Garantie', description: 'Conditions de garantie constructeur.' },
        ],
        design: { layoutVariant: 'grid_cards', backgroundMode: 'light' },
      }),
      block('image', {
        alt: '',
        caption: 'Visuel véhicule — uploadez votre photo officielle.',
        design: { layoutVariant: 'contained', mediaRadius: 'medium', mediaShadow: 'soft' },
      }),
      block('final_cta', {
        title: 'Intéressé par cette offre ?',
        subtitle: 'Laissez vos coordonnées, un conseiller vous recontacte.',
        buttonText: 'Je suis intéressé',
        buttonTarget: '#lead-form',
        design: { layoutVariant: 'simple_band', backgroundMode: 'dark', alignment: 'center' },
      }),
      block('lead_form', {
        title: 'Recevoir l’offre',
        subtitle: 'Un conseiller vous recontacte rapidement.',
        submitText: 'Recevoir l’offre',
        design: { layoutVariant: 'card_below', backgroundMode: 'light' },
      }),
      block('footer_legal', {
        legalText: 'Offre soumise à conditions. Auto Hall — mentions légales à compléter.',
      }),
    ],
  },
  {
    id: 'after_sales',
    name: 'SAV & services',
    description: 'Hero sobre, contenu, prestations, formulaire et footer.',
    audience: 'Prise de contact atelier / SAV',
    themeDefaults: {
      mode: 'light',
      primaryColor: '#18181b',
      headingScale: 'normal',
      sectionSpacing: 'normal',
      buttonStyle: 'rounded',
      seoTitle: 'Services & SAV — Auto Hall',
      seoDescription: 'Entretien, garantie et prise de rendez-vous atelier Auto Hall.',
    },
    blocks: [
      block('hero', {
        eyebrow: 'Service Auto Hall',
        title: 'Entretien & services',
        subtitle: 'Prise de rendez-vous, garantie et suivi atelier.',
        buttonText: 'Prendre contact',
        buttonTarget: '#lead-form',
        imageUrl: '',
        imageAssetId: '',
        design: {
          layoutVariant: 'split_image_right',
          backgroundMode: 'light',
          mediaPosition: 'right',
        },
      }),
      block('text', {
        heading: 'Nos prestations',
        content:
          'Décrivez ici vos services atelier, horaires d’ouverture et engagements qualité.',
        design: { layoutVariant: 'left_aligned', contentWidth: 'narrow' },
      }),
      block('features', {
        heading: 'Services disponibles',
        items: [
          { title: 'Entretien', description: 'Révisions et maintenance.' },
          { title: 'Garantie', description: 'Suivi et prise en charge.' },
          { title: 'Pièces', description: 'Pièces d’origine constructeur.' },
        ],
        design: { layoutVariant: 'icon_list', backgroundMode: 'neutral' },
      }),
      block('lead_form', {
        title: 'Demande de rendez-vous',
        subtitle: 'Nous vous rappelons pour confirmer le créneau.',
        submitText: 'Envoyer ma demande',
        design: { layoutVariant: 'full_width', backgroundMode: 'light' },
      }),
      block('footer_legal', {
        legalText: 'Auto Hall — mentions légales et politique de confidentialité à compléter.',
      }),
    ],
  },
  {
    id: 'quick_lead',
    name: 'Capture lead rapide',
    description: 'Hero minimal, formulaire, confiance et footer — idéal campagne courte.',
    audience: 'Collecte de contacts rapide',
    themeDefaults: {
      mode: 'light',
      primaryColor: '#b91c1c',
      headingScale: 'compact',
      sectionSpacing: 'compact',
      buttonStyle: 'pill',
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
        secondaryButtonText: '',
        design: {
          layoutVariant: 'minimal',
          backgroundMode: 'light',
          mediaPosition: 'none',
          alignment: 'center',
          headingSize: 'large',
        },
      }),
      block('lead_form', {
        title: 'Vos coordonnées',
        subtitle: 'Remplissez le formulaire — réponse sous 48 h.',
        submitText: 'Envoyer',
        privacyNote: 'Vos données ne sont pas partagées avec des tiers.',
        design: { layoutVariant: 'card_below', backgroundMode: 'light' },
      }),
      block('trust_bar', {
        metrics: [
          { value: '48 h', label: 'Réponse garantie' },
          { value: 'Réseau', label: 'Concessionnaires Auto Hall' },
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
