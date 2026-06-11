import {
  getBuilderCatalog,
  type CatalogBlockItem,
} from './builder-catalog';

/** Blocs marketing complets — une section entière prête à personnaliser. */
export const COMPLETE_SECTION_BLOCK_TYPES = new Set([
  'promo_autohall',
  'hero_campaign',
  'hero_form_campaign',
  'hero_vehicle_offer',
  'campaign_lead_hero',
  'vehicle_offer',
  'vehicle_features',
  'vehicle_range',
  'gallery',
  'pricing_trim',
  'benefits',
  'cta_band',
  'final_cta',
  'lead_form',
  'testimonials',
  'trust_bar',
  'faq',
  'footer_legal',
]);

/** Blocs atomiques — texte, visuel, espacement. */
export const BASIC_BLOCK_TYPES = new Set([
  'rich_text',
  'media_only',
  'spacer_divider',
  'video_embed',
]);

export const CATALOG_TIER_META = {
  starters: {
    title: 'Modèles de page',
    description:
      'Structure complète prête à publier — remplace le contenu du canvas.',
  },
  sections: {
    title: 'Sections complètes',
    description:
      'Blocs marketing autonomes (hero, offre, formulaire…) à insérer ou glisser-déposer.',
  },
  basics: {
    title: 'Blocs de contenu',
    description: 'Texte, image, vidéo ou espacement pour compléter une section.',
  },
  sectionStarters: {
    title: 'Ensembles de sections',
    description:
      'Séquences pré-assemblées à ajouter sous vos sections existantes.',
  },
} as const;

export function getCompleteSectionCatalog(): CatalogBlockItem[] {
  return getBuilderCatalog().filter((item) =>
    COMPLETE_SECTION_BLOCK_TYPES.has(item.type),
  );
}

export function getBasicBlockCatalog(): CatalogBlockItem[] {
  return getBuilderCatalog().filter((item) => BASIC_BLOCK_TYPES.has(item.type));
}

export function getCompleteSectionsByCategory(): Array<{
  categoryId: string;
  categoryLabel: string;
  blocks: CatalogBlockItem[];
}> {
  const blocks = getCompleteSectionCatalog();
  const order = [
    'acquisition',
    'vehicle',
    'sav',
    'financing',
    'event',
    'social_proof',
    'faq_legal',
  ] as const;

  const grouped = new Map<string, CatalogBlockItem[]>();
  for (const block of blocks) {
    const list = grouped.get(block.businessCategory) ?? [];
    list.push(block);
    grouped.set(block.businessCategory, list);
  }

  return order
    .filter((id) => grouped.has(id))
    .map((id) => ({
      categoryId: id,
      categoryLabel: labelForCategory(id),
      blocks: grouped.get(id) ?? [],
    }));
}

function labelForCategory(id: string): string {
  const labels: Record<string, string> = {
    acquisition: 'Acquisition & conversion',
    vehicle: 'Véhicule & offre',
    sav: 'SAV & services',
    financing: 'Financement',
    event: 'Événement & essai',
    social_proof: 'Réassurance',
    faq_legal: 'FAQ & légal',
  };
  return labels[id] ?? id;
}
