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
  Type,
  Video,
  Wrench,
} from 'lucide-react';
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
};

const BLOCK_ICONS: Record<string, LucideIcon> = {
  promo_autohall: Sparkles,
  hero_campaign: LayoutTemplate,
  hero_form_campaign: LayoutTemplate,
  hero_vehicle_offer: LayoutTemplate,
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
};

/** Libellés orientés métier (évite le jargon technique registry). */
const SIDEBAR_LABELS: Record<string, string> = {
  promo_autohall: 'Hero acquisition (split + lead)',
  hero_campaign: 'Bannière campagne',
  hero_form_campaign: 'Section hero + formulaire lead',
  hero_vehicle_offer: 'Hero offre véhicule (marque)',
  lead_form: 'Formulaire de capture',
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
};

function toCatalogItem(entry: BlockRegistryEntry): CatalogBlockItem {
  return {
    ...entry,
    businessCategory: getBusinessCategoryForBlock(entry.type),
    icon: BLOCK_ICONS[entry.type] ?? LayoutTemplate,
    sidebarLabel: SIDEBAR_LABELS[entry.type] ?? entry.label,
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
