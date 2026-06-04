import type { EditorBlockType } from './landing-block-catalog';
import { BUILDER_NEUTRAL_DEFAULT_PROPS } from '../builder-engine/constants/neutral-default-props';

/** Modèles V1 livrables — 3 parcours Auto Hall, contenu guidé sans images externes. */
export type LandingTemplateId = 'test_drive' | 'seasonal_offer' | 'after_sales';

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
    description: 'Hero, formulaire, bandeau confiance et mentions légales.',
    audience: 'Demande d’essai en concession',
    blocks: [
      block('hero', {
        eyebrow: 'Essai en concession',
        title: 'Réservez votre essai',
        subtitle: 'Indiquez vos coordonnées — un conseiller vous rappelle sous 48 h.',
        buttonText: 'Demander un essai',
        buttonTarget: '#lead-form',
        secondaryButtonText: '',
        design: { backgroundMode: 'light', mediaPosition: 'right' },
      }),
      block('lead_form', {
        title: 'Votre demande d’essai',
        subtitle: 'Nom, téléphone et modèle souhaité.',
        submitText: 'Envoyer ma demande',
      }),
      block('trust_bar', {
        metrics: [
          { value: '48 h', label: 'Délai de rappel' },
          { value: '100 %', label: 'Véhicules contrôlés' },
          { value: '15+', label: 'Années d’expérience' },
        ],
      }),
      block('footer_legal'),
    ],
  },
  {
    id: 'seasonal_offer',
    name: 'Offre véhicule',
    description: 'Hero, caractéristiques, CTA final et formulaire.',
    audience: 'Campagne promotionnelle',
    blocks: [
      block('hero', {
        eyebrow: 'Offre en cours',
        title: 'Votre offre du moment',
        subtitle: 'Stock limité — personnalisez les conditions et le financement.',
        buttonText: 'Profiter de l’offre',
        buttonTarget: '#lead-form',
        design: { backgroundMode: 'dark', mediaPosition: 'right' },
      }),
      block('features', {
        heading: 'Points clés',
        modelName: 'Modèle',
        modelTagline: 'Courte description du véhicule.',
        items: [
          { title: 'Motorisation', description: 'À compléter.' },
          { title: 'Équipements', description: 'À compléter.' },
          { title: 'Garantie', description: 'À compléter.' },
        ],
      }),
      block('final_cta', {
        title: 'Intéressé par cette offre ?',
        subtitle: 'Laissez vos coordonnées.',
        buttonText: 'Je suis intéressé',
        buttonTarget: '#lead-form',
      }),
      block('lead_form', {
        title: 'Recevoir l’offre',
        subtitle: 'Un conseiller vous recontacte.',
        submitText: 'Recevoir l’offre',
      }),
    ],
  },
  {
    id: 'after_sales',
    name: 'SAV & services',
    description: 'Hero, texte informatif, formulaire et footer légal.',
    audience: 'Prise de contact atelier / SAV',
    blocks: [
      block('hero', {
        eyebrow: 'Service Auto Hall',
        title: 'Entretien & services',
        subtitle: 'Prise de rendez-vous, garantie et suivi atelier.',
        buttonText: 'Prendre contact',
        buttonTarget: '#lead-form',
        imageUrl: '',
        imageAssetId: '',
        design: { backgroundMode: 'light', mediaPosition: 'right' },
      }),
      block('text', {
        heading: 'Nos prestations',
        content:
          'Décrivez ici vos services atelier, horaires d’ouverture et engagements qualité.',
      }),
      block('lead_form', {
        title: 'Demande de rendez-vous',
        subtitle: 'Nous vous rappelons pour confirmer le créneau.',
        submitText: 'Envoyer ma demande',
      }),
      block('footer_legal'),
    ],
  },
];

export function getLandingTemplate(id: LandingTemplateId): LandingTemplate | undefined {
  return LANDING_TEMPLATES.find((template) => template.id === id);
}
