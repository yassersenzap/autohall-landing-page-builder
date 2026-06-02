import { DEFAULT_LEAD_FORM_PROPS } from '../../../lib/lead-form-block';

export const EDITOR_BLOCK_TYPES = [
  'hero',
  'text',
  'image',
  'button',
  'lead_form',
] as const;

export type EditorBlockType = (typeof EDITOR_BLOCK_TYPES)[number];

export type EditorPageBlock = {
  id: string;
  pageVersionId: string;
  blockKey: string;
  blockType: string;
  sortOrder: number;
  propsJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type EditorCreateBlockPayload = {
  blockType: EditorBlockType;
  propsJson: Record<string, unknown>;
  sortOrder?: number;
};

export type EditorUpdateBlockPayload = {
  blockType?: EditorBlockType;
  sortOrder?: number;
  propsJson?: Record<string, unknown>;
};

export type EditorBlockDefinition = {
  type: EditorBlockType;
  label: string;
  description: string;
  icon: string;
  landingClassName: string;
};

export const EDITOR_BLOCK_LIBRARY: EditorBlockDefinition[] = [
  {
    type: 'hero',
    label: 'Bannière principale',
    description: 'Titre d’ouverture avec promesse et bouton d’action.',
    icon: 'H',
    landingClassName: 'lp-hero',
  },
  {
    type: 'text',
    label: 'Bloc de contenu',
    description: 'Texte explicatif pour détailler l’offre.',
    icon: 'T',
    landingClassName: 'lp-text',
  },
  {
    type: 'image',
    label: 'Visuel',
    description: 'Image de campagne avec légende.',
    icon: 'M',
    landingClassName: 'lp-media',
  },
  {
    type: 'button',
    label: 'Bande d’action',
    description: 'Section conversion avec CTA unique.',
    icon: 'C',
    landingClassName: 'lp-cta-band',
  },
  {
    type: 'lead_form',
    label: 'Formulaire lead',
    description: 'Formulaire de contact pour les prospects.',
    icon: 'F',
    landingClassName: 'lp-lead-form',
  },
];

export const DEFAULT_EDITOR_BLOCK_PROPS: Record<
  EditorBlockType,
  Record<string, unknown>
> = {
  hero: {
    eyebrow: 'Offre Auto Hall',
    title: 'Découvrez nos offres du moment',
    subtitle:
      'Profitez d’un accompagnement personnalisé et d’avantages exclusifs.',
    buttonText: 'Demander un rappel',
    buttonTarget: '#lead-form',
  },
  text: {
    heading: 'Pourquoi choisir Auto Hall ?',
    content:
      'Des experts à votre écoute.\n\nUn accompagnement transparent à chaque étape.',
  },
  image: {
    imageUrl:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80',
    alt: 'Véhicule en concession',
    caption: 'Véhicules disponibles immédiatement.',
  },
  button: {
    label: 'Voir nos modèles',
    target: '#lead-form',
    description: 'Nos conseillers vous accompagnent dans votre choix.',
  },
  lead_form: DEFAULT_LEAD_FORM_PROPS,
};

export type EditorDeviceMode = 'desktop' | 'mobile';
