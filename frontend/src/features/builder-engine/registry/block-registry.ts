import type { BuilderPaletteItem } from '../types';
import { isBackendSupportedBlockType } from './backend-block-types';

export type BlockCategory =
  | 'hero'
  | 'conversion'
  | 'content'
  | 'trust'
  | 'footer';

export type BlockAvailability = 'stable' | 'experimental' | 'disabled';

export type BlockRegistryEntry = BuilderPaletteItem & {
  category: BlockCategory;
  availability: BlockAvailability;
  icon: string;
};

export const BUILDER_BLOCK_REGISTRY: BlockRegistryEntry[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Bannière principale, visuel et accroche.',
    category: 'hero',
    availability: 'stable',
    icon: 'H',
  },
  {
    type: 'lead_form',
    label: 'Formulaire',
    description: 'Collecte de demandes et leads.',
    category: 'conversion',
    availability: 'stable',
    icon: 'F',
  },
  {
    type: 'trust_bar',
    label: 'Bandeau confiance',
    description: 'Chiffres clés et réassurance.',
    category: 'trust',
    availability: 'stable',
    icon: '+',
  },
  {
    type: 'features',
    label: 'Caractéristiques',
    description: 'Points forts véhicule ou offre.',
    category: 'content',
    availability: 'stable',
    icon: '⚙',
  },
  {
    type: 'text',
    label: 'Section texte',
    description: 'Paragraphe éditorial.',
    category: 'content',
    availability: 'stable',
    icon: 'T',
  },
  {
    type: 'image',
    label: 'Section image',
    description: 'Visuel pleine largeur.',
    category: 'content',
    availability: 'stable',
    icon: 'M',
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Questions fréquentes.',
    category: 'content',
    availability: 'stable',
    icon: '?',
  },
  {
    type: 'final_cta',
    label: 'CTA final',
    description: 'Dernier appel à l’action.',
    category: 'conversion',
    availability: 'stable',
    icon: '→',
  },
  {
    type: 'footer_legal',
    label: 'Pied de page',
    description: 'Mentions légales.',
    category: 'footer',
    availability: 'stable',
    icon: '§',
  },
  {
    type: 'offer_highlights',
    label: 'Offre véhicule',
    description: 'Modèle, prix et points clés de l’offre.',
    category: 'content',
    availability: 'disabled',
    icon: '★',
  },
  {
    type: 'vehicle_range',
    label: 'Gamme véhicules',
    description: 'Grille de modèles thermique / HEV.',
    category: 'content',
    availability: 'disabled',
    icon: '▦',
  },
  {
    type: 'benefits',
    label: 'Avantages',
    description: 'Cartes avantages campagne ou SAV.',
    category: 'trust',
    availability: 'stable',
    icon: '✓',
  },
  {
    type: 'financing',
    label: 'Financement',
    description: 'Conditions financement et reprise.',
    category: 'conversion',
    availability: 'disabled',
    icon: '€',
  },
];

export function getRegistryEntry(type: string): BlockRegistryEntry | undefined {
  return BUILDER_BLOCK_REGISTRY.find((b) => b.type === type);
}

export function getActivePaletteBlocks(): BlockRegistryEntry[] {
  return BUILDER_BLOCK_REGISTRY.filter(
    (entry) =>
      entry.availability === 'stable' && isBackendSupportedBlockType(entry.type),
  );
}

export function getDisabledPaletteBlocks(): BlockRegistryEntry[] {
  return BUILDER_BLOCK_REGISTRY.filter(
    (entry) =>
      entry.availability === 'disabled' ||
      !isBackendSupportedBlockType(entry.type),
  );
}
