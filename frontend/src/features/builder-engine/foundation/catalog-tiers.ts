import {
  getBuilderCatalog,
  getPremiumAnimatedCatalog,
  type CatalogBlockItem,
} from './builder-catalog';
import {
  COMPLEMENTARY_SECTION_BLOCK_TYPES,
  CORE_BUSINESS_BLOCK_TYPES,
  isMainCatalogHidden,
} from './catalog-visibility';

/** Blocs marketing complets — une section entière prête à personnaliser. */
export const COMPLETE_SECTION_BLOCK_TYPES = new Set([
  'core_campaign_form_landing',
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
  'premium_bento_features',
  'animated_stats_strip',
  'premium_testimonials',
  'vehicle_showcase_split',
  'sticky_lead_cta',
  'campaign_timeline_steps',
]);

/** Blocs atomiques — texte, visuel, espacement. */
export const BASIC_BLOCK_TYPES = new Set([
  'rich_text',
  'media_only',
  'spacer_divider',
  'video_embed',
]);

export const CATALOG_TIER_META = {
  coreBusiness: {
    title: 'Landing métier',
    description:
      'Pattern principal Auto Hall — visuel campagne ou véhicule avec formulaire intégré.',
  },
  complementary: {
    title: 'Sections complémentaires',
    description: 'FAQ, footer, réassurance et contenus optionnels autour de la landing.',
  },
  advanced: {
    title: 'Avancé',
    description:
      'Blocs premium animés et sections legacy — pour pages existantes ou enrichissement ponctuel.',
  },
  starters: {
    title: 'Modèles de page',
    description:
      'Structure complète prête à publier — remplace le contenu du canvas.',
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
  coreTemplates: {
    title: 'Landings métier',
    description:
      'Modèles focalisés image + formulaire — campagne, modèle véhicule ou gamme.',
  },
  campaignTemplates: {
    title: 'Templates étendus',
    description:
      'Pages complètes avec sections optionnelles — usage avancé ou legacy.',
  },
  /** @deprecated use advanced */
  premiumAnimated: {
    title: 'Sections complémentaires / Avancé',
    description: 'Blocs premium animés — hors parcours principal.',
  },
  /** @deprecated use complementary */
  sections: {
    title: 'Sections complètes',
    description: 'Blocs marketing autonomes.',
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

export function getCoreBusinessCatalog(): CatalogBlockItem[] {
  return getBuilderCatalog().filter((item) => CORE_BUSINESS_BLOCK_TYPES.has(item.type));
}

export function getComplementarySectionCatalog(): CatalogBlockItem[] {
  return getBuilderCatalog().filter(
    (item) =>
      COMPLEMENTARY_SECTION_BLOCK_TYPES.has(item.type) && !isMainCatalogHidden(item.type),
  );
}

export function getAdvancedSectionCatalog(): CatalogBlockItem[] {
  return getBuilderCatalog().filter(
    (item) =>
      (item.isPremium || isMainCatalogHidden(item.type)) &&
      !CORE_BUSINESS_BLOCK_TYPES.has(item.type),
  );
}

/** @deprecated use getAdvancedSectionCatalog */
export function getPremiumAnimatedSectionCatalog(): CatalogBlockItem[] {
  return getPremiumAnimatedCatalog();
}

export function getCompleteSectionsByCategory(): Array<{
  categoryId: string;
  categoryLabel: string;
  blocks: CatalogBlockItem[];
}> {
  const blocks = getComplementarySectionCatalog();
  const order = ['vehicle', 'sav', 'financing', 'social_proof', 'faq_legal'] as const;

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
    vehicle: 'Véhicule & offre',
    sav: 'SAV & services',
    financing: 'Financement',
    social_proof: 'Réassurance',
    faq_legal: 'FAQ & légal',
  };
  return labels[id] ?? id;
}
