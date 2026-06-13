import type { LucideIcon } from 'lucide-react';
import {
  Car,
  CreditCard,
  HelpCircle,
  ImageIcon,
  LayoutTemplate,
  ListChecks,
  Megaphone,
  Minus,
  Quote,
  Scale,
  Sparkles,
  Timer,
  Type,
  Video,
  Wrench,
  Zap,
} from 'lucide-react';
import { PREMIUM_ANIMATED_BLOCK_TYPES } from '@/features/builder/block-motion';
import {
  getActivePaletteBlocks,
  getRegistryEntry,
  type BlockRegistryEntry,
} from '../registry/block-registry';
import {
  BUILDER_BUSINESS_CATEGORIES,
  getBusinessCategoryForBlock,
  type BuilderBusinessCategoryId,
} from './business-categories';

export type CatalogBlockItem = Omit<BlockRegistryEntry, 'icon'> & {
  businessCategory: BuilderBusinessCategoryId;
  icon: LucideIcon;
  sidebarLabel: string;
  isPremium?: boolean;
  motionReady?: boolean;
  businessUseCase?: string;
};

const BLOCK_ICONS: Record<string, LucideIcon> = {
  core_campaign_form_landing: LayoutTemplate,
  promo_autohall: Sparkles,
  hero_campaign: LayoutTemplate,
  hero_form_campaign: LayoutTemplate,
  hero_vehicle_offer: LayoutTemplate,
  campaign_lead_hero: LayoutTemplate,
  lead_form: ListChecks,
  vehicle_offer: Car,
  vehicle_features: ListChecks,
  vehicle_range: Car,
  gallery: ImageIcon,
  pricing_trim: CreditCard,
  benefits: Wrench,
  cta_band: Megaphone,
  final_cta: Megaphone,
  testimonials: Quote,
  trust_bar: Scale,
  faq: HelpCircle,
  footer_legal: Scale,
  rich_text: Type,
  media_only: ImageIcon,
  spacer_divider: Minus,
  video_embed: Video,
  premium_bento_features: Sparkles,
  animated_stats_strip: Zap,
  premium_testimonials: Quote,
  vehicle_showcase_split: Car,
  sticky_lead_cta: Megaphone,
  campaign_timeline_steps: Timer,
};

const PREMIUM_USE_CASES: Record<string, string> = {
  premium_bento_features: 'Avantages campagne & highlights véhicule',
  animated_stats_strip: 'Chiffres clés & réassurance',
  premium_testimonials: 'Preuve sociale client',
  vehicle_showcase_split: 'Mise en avant modèle automotive',
  sticky_lead_cta: 'Conversion persistante',
  campaign_timeline_steps: 'Parcours offre en étapes',
};

/** Libellés orientés métier (évite le jargon technique registry). */
const SIDEBAR_LABELS: Record<string, string> = {
  core_campaign_form_landing: 'Landing image + formulaire',
  promo_autohall: 'Hero acquisition (legacy)',
  hero_campaign: 'Bannière campagne',
  hero_form_campaign: 'Hero + formulaire (legacy)',
  hero_vehicle_offer: 'Hero offre véhicule (marque)',
  campaign_lead_hero: 'Hero campagne (legacy)',
  lead_form: 'Formulaire seul (legacy)',
  vehicle_offer: 'Section offre véhicule complète',
  vehicle_features: 'Caractéristiques véhicule',
  vehicle_range: 'Gamme véhicules',
  gallery: 'Galerie photos',
  pricing_trim: 'Grille finitions / financement',
  benefits: 'Avantages & services',
  cta_band: 'Bandeau d’action',
  final_cta: 'Appel à l’action final',
  testimonials: 'Avis clients',
  trust_bar: 'Bandeau de confiance',
  faq: 'Questions fréquentes',
  footer_legal: 'Pied de page légal',
  rich_text: 'Bloc texte',
  media_only: 'Visuel pleine largeur',
  spacer_divider: 'Espacement / séparateur',
  video_embed: 'Vidéo intégrée',
  premium_bento_features: 'Bento avantages premium',
  animated_stats_strip: 'Chiffres animés',
  premium_testimonials: 'Témoignages premium',
  vehicle_showcase_split: 'Showcase véhicule split',
  sticky_lead_cta: 'CTA sticky lead',
  campaign_timeline_steps: 'Timeline campagne',
};

function toCatalogItem(entry: BlockRegistryEntry): CatalogBlockItem {
  const isPremium = (PREMIUM_ANIMATED_BLOCK_TYPES as readonly string[]).includes(entry.type);
  return {
    ...entry,
    businessCategory: getBusinessCategoryForBlock(entry.type),
    icon: BLOCK_ICONS[entry.type] ?? LayoutTemplate,
    sidebarLabel: SIDEBAR_LABELS[entry.type] ?? entry.label,
    isPremium,
    motionReady: isPremium,
    businessUseCase: PREMIUM_USE_CASES[entry.type],
  };
}

/** Catalogue actif — palette + export + sidebar partagent cette source. */
export function getBuilderCatalog(): CatalogBlockItem[] {
  return getActivePaletteBlocks().map(toCatalogItem);
}

export function getCatalogItem(blockType: string): CatalogBlockItem | undefined {
  const entry = getRegistryEntry(blockType);
  if (!entry || entry.availability !== 'stable') return undefined;
  return toCatalogItem(entry);
}

export function getCatalogByBusinessCategory(): Array<{
  category: (typeof BUILDER_BUSINESS_CATEGORIES)[number];
  blocks: CatalogBlockItem[];
}> {
  const catalog = getBuilderCatalog();
  return BUILDER_BUSINESS_CATEGORIES.map((category) => ({
    category,
    blocks: catalog.filter((b) => b.businessCategory === category.id),
  })).filter((group) => group.blocks.length > 0);
}

export function countCatalogBlocks(): number {
  return getBuilderCatalog().length;
}

export function getPremiumAnimatedCatalog(): CatalogBlockItem[] {
  return getBuilderCatalog().filter((item) => item.isPremium);
}
