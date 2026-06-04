import type { BuilderPaletteItem } from '../types';

export const BUILDER_PALETTE: BuilderPaletteItem[] = [
  {
    type: 'hero',
    label: 'Bloc Hero',
    description: 'Bannière principale et accroche.',
  },
  {
    type: 'lead_form',
    label: 'Bloc Formulaire',
    description: 'Collecte de leads et contact.',
  },
  {
    type: 'trust_bar',
    label: 'Bloc Confiance',
    description: 'Indicateurs de réassurance.',
  },
  {
    type: 'features',
    label: 'Bloc Caractéristiques',
    description: 'Points forts véhicule ou offre.',
  },
  {
    type: 'final_cta',
    label: 'Bloc CTA final',
    description: 'Appel à l’action de clôture.',
  },
  {
    type: 'footer_legal',
    label: 'Bloc Pied de page',
    description: 'Mentions légales.',
  },
];

export const PALETTE_DRAG_PREFIX = 'palette:';

export function paletteDragId(type: string): string {
  return `${PALETTE_DRAG_PREFIX}${type}`;
}

export function parsePaletteDragId(id: string): string | null {
  if (!id.startsWith(PALETTE_DRAG_PREFIX)) return null;
  return id.slice(PALETTE_DRAG_PREFIX.length);
}
