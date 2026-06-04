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
    description: 'Hero, formulaire lead, bandeau confiance et mentions légales.',
    audience: 'Demande d’essai en concession',
    blocks: [
      block('hero', {
        eyebrow: 'Essai',
        title: 'Réservez votre essai',
        subtitle: 'Indiquez vos coordonnées — un conseiller vous rappelle pour fixer un créneau.',
        buttonText: 'Demander un essai',
        secondaryButtonText: '',
      }),
      block('lead_form', {
        title: 'Demande d’essai',
        subtitle: 'Nom, téléphone et modèle souhaité.',
      }),
      block('trust_bar', {
        metrics: [
          { value: '—', label: 'Indicateur 1' },
          { value: '—', label: 'Indicateur 2' },
          { value: '—', label: 'Indicateur 3' },
        ],
      }),
      block('footer_legal'),
    ],
  },
  {
    id: 'seasonal_offer',
    name: 'Offre véhicule',
    description: 'Hero, points clés, CTA final et formulaire lead.',
    audience: 'Campagne promotionnelle',
    blocks: [
      block('hero', {
        eyebrow: 'Offre',
        title: 'Votre offre du moment',
        subtitle: 'Conditions, stock et financement — personnalisez ce texte.',
        buttonText: 'Profiter de l’offre',
      }),
      block('features', {
        heading: 'Points clés du véhicule',
        modelName: 'Modèle',
        modelTagline: 'Courte description du modèle.',
        items: [
          { title: 'Point 1', description: 'Description.' },
          { title: 'Point 2', description: 'Description.' },
          { title: 'Point 3', description: 'Description.' },
        ],
      }),
      block('final_cta', {
        title: 'Intéressé par cette offre ?',
        subtitle: 'Laissez vos coordonnées.',
        buttonText: 'Je suis intéressé',
      }),
      block('lead_form', {
        title: 'Recevoir l’offre',
        subtitle: 'Un conseiller vous recontacte.',
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
        eyebrow: 'Service',
        title: 'Entretien & services',
        subtitle: 'Prise de rendez-vous, garantie et suivi atelier.',
        buttonText: 'Prendre contact',
        imageUrl: '',
        imageAssetId: '',
      }),
      block('text', {
        heading: 'Nos services',
        content:
          'Décrivez ici vos prestations atelier, horaires et engagements qualité.',
      }),
      block('lead_form', {
        title: 'Demande de rendez-vous',
        subtitle: 'Nous vous rappelons pour confirmer.',
      }),
      block('footer_legal'),
    ],
  },
];

export function getLandingTemplate(id: LandingTemplateId): LandingTemplate | undefined {
  return LANDING_TEMPLATES.find((template) => template.id === id);
}
