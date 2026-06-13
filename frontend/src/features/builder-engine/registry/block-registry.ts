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

/** Blocs campagne Auto Hall — palette utilisateur uniquement. */
export const BUILDER_BLOCK_REGISTRY: BlockRegistryEntry[] = [
  {
    type: 'core_campaign_form_landing',
    label: 'Landing campagne + formulaire',
    description:
      'Pattern métier Auto Hall — visuel campagne ou véhicule avec formulaire multistep intégré.',
    category: 'hero',
    availability: 'stable',
    icon: '⊞',
  },
  {
    type: 'promo_autohall',
    label: 'Promo Auto Hall',
    description: 'Hero plein écran + formulaire flottant — layout référence.',
    category: 'hero',
    availability: 'stable',
    icon: '★',
  },
  {
    type: 'vehicle_features',
    label: 'Caractéristiques véhicule',
    description: 'Grille 3 colonnes — specs et points forts du modèle.',
    category: 'content',
    availability: 'stable',
    icon: '⚙',
  },
  {
    type: 'gallery',
    label: 'Galerie visuelle',
    description: 'Trio d’images véhicule pleine largeur avec hover.',
    category: 'content',
    availability: 'stable',
    icon: '▦',
  },
  {
    type: 'rich_text',
    label: 'Section Texte',
    description: 'Titre + paragraphe — mise en page contrôlée.',
    category: 'content',
    availability: 'stable',
    icon: 'T',
  },
  {
    type: 'media_only',
    label: 'Section Visuel',
    description: 'Image HD encadrée — ratio et ombre verrouillés.',
    category: 'content',
    availability: 'stable',
    icon: 'M',
  },
  {
    type: 'spacer_divider',
    label: 'Séparateur / Espacement',
    description: 'Respiration entre sections sans CSS.',
    category: 'content',
    availability: 'stable',
    icon: '—',
  },
  {
    type: 'video_embed',
    label: 'Section Vidéo',
    description: 'Embed YouTube ou Vimeo — cadre 16:9 premium.',
    category: 'content',
    availability: 'stable',
    icon: '▶',
  },
  {
    type: 'cta_band',
    label: 'Bandeau CTA',
    description: 'Bandeau conversion pleine largeur avec bouton contrasté.',
    category: 'conversion',
    availability: 'stable',
    icon: '→',
  },
  {
    type: 'pricing_trim',
    label: 'Financement / Finitions',
    description: 'Grille 3 finitions — prix, équipements et sélection.',
    category: 'conversion',
    availability: 'stable',
    icon: '€',
  },
  {
    type: 'testimonials',
    label: 'Avis Clients',
    description: 'Témoignages vérifiés en grille 3 colonnes.',
    category: 'trust',
    availability: 'stable',
    icon: '★',
  },
  {
    type: 'hero_campaign',
    label: 'Hero Campaign',
    description: 'Bannière campagne — promo, SAV, gamme ou capture lead.',
    category: 'hero',
    availability: 'stable',
    icon: 'H',
  },
  {
    type: 'hero_form_campaign',
    label: 'Hero + Formulaire',
    description: 'Section complète : message campagne + formulaire lead côte à côte.',
    category: 'hero',
    availability: 'stable',
    icon: '⊞',
  },
  {
    type: 'hero_vehicle_offer',
    label: 'Hero offre véhicule',
    description: 'Hero premium brand-aware : modèle, offre, prix et CTAs.',
    category: 'hero',
    availability: 'stable',
    icon: '◎',
  },
  {
    type: 'campaign_lead_hero',
    label: 'Hero campagne + lead',
    description: 'Hero campagne SI Digital : visuel, formulaire step-based et layouts flexibles.',
    category: 'hero',
    availability: 'stable',
    icon: '⊞',
  },
  {
    type: 'lead_form',
    label: 'Formulaire Auto Hall',
    description: 'Collecte leads conforme campagnes Auto Hall.',
    category: 'conversion',
    availability: 'stable',
    icon: 'F',
  },
  {
    type: 'vehicle_offer',
    label: 'Offre véhicule',
    description: 'Section complète : visuel, prix, points clés et CTA pour une offre véhicule.',
    category: 'content',
    availability: 'stable',
    icon: '★',
  },
  {
    type: 'vehicle_range',
    label: 'Gamme véhicules',
    description: 'Grille de modèles thermique / HEV.',
    category: 'content',
    availability: 'stable',
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
    type: 'trust_bar',
    label: 'Bandeau confiance',
    description: 'Chiffres clés et réassurance.',
    category: 'trust',
    availability: 'stable',
    icon: '+',
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Questions fréquentes en accordéon épuré.',
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
    label: 'Footer légal',
    description: 'Mentions légales.',
    category: 'footer',
    availability: 'stable',
    icon: '§',
  },
  {
    type: 'premium_bento_features',
    label: 'Bento avantages premium',
    description: 'Grille bento moderne — bénéfices campagne et points forts véhicule.',
    category: 'content',
    availability: 'stable',
    icon: '◈',
  },
  {
    type: 'animated_stats_strip',
    label: 'Bandeau chiffres animés',
    description: 'Indicateurs de confiance avec compteur export-safe.',
    category: 'trust',
    availability: 'stable',
    icon: '▴',
  },
  {
    type: 'premium_testimonials',
    label: 'Témoignages premium',
    description: 'Preuve sociale moderne — cartes ou mur de citations.',
    category: 'trust',
    availability: 'stable',
    icon: '❝',
  },
  {
    type: 'vehicle_showcase_split',
    label: 'Showcase véhicule split',
    description: 'Section automotive premium — visuel, specs et CTAs.',
    category: 'content',
    availability: 'stable',
    icon: '◎',
  },
  {
    type: 'sticky_lead_cta',
    label: 'CTA sticky conversion',
    description: 'Bandeau flottant ou sticky pour maximiser la conversion.',
    category: 'conversion',
    availability: 'stable',
    icon: '⊡',
  },
  {
    type: 'campaign_timeline_steps',
    label: 'Parcours campagne',
    description: 'Étapes du parcours client — offre, formulaire, contact.',
    category: 'content',
    availability: 'stable',
    icon: '↝',
  },
  /** Legacy — hors palette, rendu conservé pour pages existantes. */
  {
    type: 'hero',
    label: 'Hero (legacy)',
    description: 'Ancien bloc hero.',
    category: 'hero',
    availability: 'disabled',
    icon: 'H',
  },
  {
    type: 'offer_highlights',
    label: 'Offre (legacy)',
    description: 'Ancien bloc offre.',
    category: 'content',
    availability: 'disabled',
    icon: '★',
  },
  {
    type: 'features',
    label: 'Caractéristiques',
    description: 'Hors palette campagne.',
    category: 'content',
    availability: 'disabled',
    icon: '⚙',
  },
  {
    type: 'text',
    label: 'Section texte',
    description: 'Hors palette campagne.',
    category: 'content',
    availability: 'disabled',
    icon: 'T',
  },
  {
    type: 'image',
    label: 'Section image',
    description: 'Hors palette campagne.',
    category: 'content',
    availability: 'disabled',
    icon: 'M',
  },
  {
    type: 'financing',
    label: 'Financement',
    description: 'Non livré.',
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

export function isDeliverableBlockType(type: string): boolean {
  const entry = getRegistryEntry(type);
  return Boolean(entry && entry.availability === 'stable' && isBackendSupportedBlockType(type));
}
