import type { BlockVariantDefinition } from './block-variant.types';

const CAMPAIGN_LEAD_HERO_VARIANTS: BlockVariantDefinition[] = [
  {
    id: 'campaign-hero-split-premium-form',
    blockType: 'campaign_lead_hero',
    name: 'Split premium form',
    description: 'Média à gauche, formulaire premium à droite avec badge offre.',
    previewLabel: '◇',
    category: 'layout',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'media_left_form_right',
      contentPlacement: 'beside_form',
      overlayIntensity: 'light',
    },
    designPatch: {
      tone: 'light',
      formTheme: 'light',
      showOfferBadge: true,
      showProgressBar: true,
    },
    sectionStylePatch: {
      sectionPaddingY: 'lg',
      containerWidth: 'default',
      sectionBackground: 'default',
    },
    blockVisualPatch: {
      formCardStyle: 'elevated',
      mediaEmphasis: 'balanced',
      heroHeight: 'default',
    },
  },
  {
    id: 'campaign-hero-background-image',
    blockType: 'campaign_lead_hero',
    name: 'Background image campaign',
    description: 'Visuel plein écran avec overlay et formulaire glass.',
    previewLabel: '▣',
    category: 'media',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'background_media_form_right',
      contentPlacement: 'overlay_media',
      overlayIntensity: 'medium',
      imageFit: 'cover',
    },
    designPatch: {
      tone: 'dark',
      formTheme: 'glass',
      showOfferBadge: true,
      showProgressBar: true,
    },
    sectionStylePatch: {
      sectionBackground: 'dark',
      sectionPaddingY: 'xl',
    },
    blockVisualPatch: {
      heroHeight: 'viewport',
      mediaRatio: 'cinematic',
      formCardStyle: 'glass',
      mediaEmphasis: 'media_focus',
    },
  },
  {
    id: 'campaign-hero-dual-media',
    blockType: 'campaign_lead_hero',
    name: 'Dual media launch',
    description: 'Double visuel pour lancement avec contenu en overlay.',
    previewLabel: '◫',
    category: 'media',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'dual_media_form_right',
      contentPlacement: 'overlay_media',
      overlayIntensity: 'light',
    },
    designPatch: {
      tone: 'brand',
      formTheme: 'light',
      showOfferBadge: true,
      showProgressBar: true,
    },
    sectionStylePatch: {
      containerWidth: 'wide',
      sectionPaddingY: 'lg',
    },
  },
  {
    id: 'campaign-hero-compact-lead',
    blockType: 'campaign_lead_hero',
    name: 'Compact lead capture',
    description: 'Formulaire compact sans distraction — idéal conversion directe.',
    previewLabel: '▪',
    category: 'compact',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'form_left_media_right',
      contentPlacement: 'hidden',
      overlayIntensity: 'none',
    },
    designPatch: {
      tone: 'light',
      formTheme: 'light',
      showOfferBadge: false,
      showProgressBar: false,
    },
    sectionStylePatch: {
      sectionPaddingY: 'sm',
      sectionPaddingX: 'sm',
      verticalDensity: 'compact',
    },
    blockVisualPatch: {
      heroHeight: 'compact',
      formWidth: 'sm',
      formCardStyle: 'flat',
      verticalAlignment: 'center',
    },
  },
  {
    id: 'campaign-hero-minimal-offer',
    blockType: 'campaign_lead_hero',
    name: 'Minimal offer hero',
    description: 'Offre épurée sur fond média avec formulaire glass discret.',
    previewLabel: '○',
    category: 'style',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'background_media_form_left',
      contentPlacement: 'overlay_media',
      overlayIntensity: 'light',
    },
    designPatch: {
      tone: 'light',
      formTheme: 'glass',
      showOfferBadge: true,
      showProgressBar: false,
    },
    sectionStylePatch: {
      sectionPaddingY: 'md',
      sectionBackground: 'muted',
    },
  },
];

const HERO_VEHICLE_OFFER_VARIANTS: BlockVariantDefinition[] = [
  {
    id: 'vehicle-hero-focus-split',
    blockType: 'hero_vehicle_offer',
    name: 'Vehicle focus split',
    description: 'Split classique — véhicule à droite, offre à gauche.',
    previewLabel: '◇',
    category: 'layout',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'split-media-right',
      imagePosition: 'right',
      overlayIntensity: 'light',
    },
    designPatch: {
      tone: 'brand',
      density: 'comfortable',
      alignContent: 'left',
      showOfferBadge: true,
      ctaStyle: 'primary',
    },
    sectionStylePatch: {
      sectionPaddingY: 'lg',
      containerWidth: 'default',
    },
  },
  {
    id: 'vehicle-hero-offer-card',
    blockType: 'hero_vehicle_offer',
    name: 'Offer focus card',
    description: 'Média à gauche avec badge offre mis en avant.',
    previewLabel: '▣',
    category: 'conversion',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'split-media-left',
      imagePosition: 'left',
      overlayIntensity: 'medium',
    },
    designPatch: {
      tone: 'light',
      density: 'comfortable',
      alignContent: 'left',
      showOfferBadge: true,
      ctaStyle: 'primary',
    },
    sectionStylePatch: {
      sectionBackground: 'muted',
      contentAlignment: 'left',
    },
    blockVisualPatch: {
      offerCardStyle: 'elevated',
      priceEmphasis: 'strong',
      layoutEmphasis: 'offer_focus',
      vehicleImageScale: 'lg',
    },
  },
  {
    id: 'vehicle-hero-centered-premium',
    blockType: 'hero_vehicle_offer',
    name: 'Centered premium',
    description: 'Mise en page centrée premium pour modèle phare.',
    previewLabel: '◎',
    category: 'style',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'stacked-mobile',
      overlayIntensity: 'none',
    },
    designPatch: {
      tone: 'brand',
      density: 'immersive',
      alignContent: 'center',
      showOfferBadge: true,
      ctaStyle: 'outline',
    },
    sectionStylePatch: {
      contentAlignment: 'center',
      sectionPaddingY: 'xl',
      containerWidth: 'narrow',
    },
  },
  {
    id: 'vehicle-hero-dark-brand',
    blockType: 'hero_vehicle_offer',
    name: 'Dark brand hero',
    description: 'Hero sombre plein écran avec overlay marque.',
    previewLabel: '●',
    category: 'style',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'full-bleed-overlay',
      overlayIntensity: 'heavy',
      imageFit: 'cover',
    },
    designPatch: {
      tone: 'dark',
      density: 'immersive',
      alignContent: 'left',
      showOfferBadge: true,
      ctaStyle: 'primary',
    },
    sectionStylePatch: {
      sectionBackground: 'dark',
      sectionPaddingY: 'xl',
    },
  },
  {
    id: 'vehicle-hero-compact-promo',
    blockType: 'hero_vehicle_offer',
    name: 'Compact promo',
    description: 'Promo compacte — idéal bandeau offre courte.',
    previewLabel: '▪',
    category: 'compact',
    patchStrategy: 'merge_props',
    safeApplyMode: 'layout_and_visual',
    propsPatch: {
      layoutVariant: 'split-media-right',
      overlayIntensity: 'none',
    },
    designPatch: {
      tone: 'light',
      density: 'compact',
      alignContent: 'left',
      showOfferBadge: false,
      ctaStyle: 'primary',
    },
    sectionStylePatch: {
      sectionPaddingY: 'sm',
      verticalDensity: 'compact',
    },
    blockVisualPatch: {
      heroHeight: 'compact',
      vehicleImageScale: 'md',
      priceEmphasis: 'subtle',
      offerCardStyle: 'flat',
    },
  },
];

const FAQ_VARIANTS: BlockVariantDefinition[] = [
  {
    id: 'faq-clean-accordion',
    blockType: 'faq',
    name: 'Clean accordion',
    description: 'FAQ aérée avec accordéon standard et ton clair.',
    previewLabel: '≡',
    category: 'style',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'standard',
      tone: 'light',
      alignment: 'center',
      density: 'comfortable',
    },
    sectionStylePatch: {
      sectionPaddingY: 'lg',
      contentAlignment: 'center',
    },
  },
  {
    id: 'faq-dense-support',
    blockType: 'faq',
    name: 'Dense support FAQ',
    description: 'FAQ compacte pour support SAV — plus de questions visibles.',
    previewLabel: '▪',
    category: 'compact',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'compact',
      tone: 'neutral',
      alignment: 'left',
      density: 'compact',
    },
    sectionStylePatch: {
      sectionPaddingY: 'sm',
      verticalDensity: 'compact',
    },
    blockVisualPatch: {
      faqStyle: 'divided',
      faqDensity: 'compact',
      iconStyle: 'plus',
    },
  },
  {
    id: 'faq-spacious-reassurance',
    blockType: 'faq',
    name: 'Spacious reassurance',
    description: 'FAQ rassurante avec espacement généreux.',
    previewLabel: '○',
    category: 'style',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'standard',
      tone: 'light',
      alignment: 'center',
      density: 'immersive',
    },
    sectionStylePatch: {
      sectionPaddingY: 'xl',
      containerWidth: 'wide',
      sectionBackground: 'muted',
    },
  },
];

const CTA_BAND_VARIANTS: BlockVariantDefinition[] = [
  {
    id: 'cta-band-brand',
    blockType: 'cta_band',
    name: 'Brand CTA',
    description: 'Bandeau CTA marque Auto Hall — conversion classique.',
    previewLabel: '◆',
    category: 'conversion',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'standard',
      tone: 'brand',
      alignment: 'split',
      ctaStyle: 'white',
      density: 'comfortable',
    },
    sectionStylePatch: {
      sectionBackground: 'brand',
      sectionPaddingY: 'lg',
    },
  },
  {
    id: 'cta-band-dark-conversion',
    blockType: 'cta_band',
    name: 'Dark conversion CTA',
    description: 'Bandeau sombre à fort contraste pour conversion.',
    previewLabel: '●',
    category: 'conversion',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'standard',
      tone: 'dark',
      alignment: 'center',
      ctaStyle: 'white',
      density: 'comfortable',
    },
    sectionStylePatch: {
      sectionBackground: 'dark',
      sectionPaddingY: 'lg',
    },
  },
  {
    id: 'cta-band-minimal',
    blockType: 'cta_band',
    name: 'Minimal CTA',
    description: 'CTA discret et compact — fin de page légère.',
    previewLabel: '▪',
    category: 'compact',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'compact',
      tone: 'neutral',
      alignment: 'center',
      ctaStyle: 'outline',
      density: 'compact',
    },
    sectionStylePatch: {
      sectionPaddingY: 'sm',
      sectionBackground: 'default',
    },
  },
];

const TRUST_BAR_VARIANTS: BlockVariantDefinition[] = [
  {
    id: 'trust-bar-compact-reassurance',
    blockType: 'trust_bar',
    name: 'Compact reassurance',
    description: 'Bandeau de réassurance compact — 4 métriques serrées.',
    previewLabel: '▪',
    category: 'compact',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'standard',
      tone: 'neutral',
      alignment: 'center',
      density: 'compact',
    },
    sectionStylePatch: {
      sectionPaddingY: 'sm',
      verticalDensity: 'compact',
    },
  },
  {
    id: 'trust-bar-premium-service',
    blockType: 'trust_bar',
    name: 'Premium service strip',
    description: 'Bandeau premium marque pour preuves de service.',
    previewLabel: '◆',
    category: 'style',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'standard',
      tone: 'brand',
      alignment: 'center',
      density: 'comfortable',
    },
    sectionStylePatch: {
      sectionBackground: 'muted',
      sectionPaddingY: 'md',
    },
  },
];

const FOOTER_LEGAL_VARIANTS: BlockVariantDefinition[] = [
  {
    id: 'footer-legal-minimal',
    blockType: 'footer_legal',
    name: 'Minimal legal',
    description: 'Pied de page légal épuré et centré.',
    previewLabel: '○',
    category: 'style',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'standard',
      tone: 'neutral',
      alignment: 'center',
      density: 'compact',
    },
    sectionStylePatch: {
      sectionPaddingY: 'sm',
      sectionBackground: 'default',
    },
  },
  {
    id: 'footer-legal-dense',
    blockType: 'footer_legal',
    name: 'Dense legal footer',
    description: 'Footer dense aligné à gauche — mentions complètes.',
    previewLabel: '▪',
    category: 'compact',
    patchStrategy: 'merge_props',
    safeApplyMode: 'visual_only',
    designPatch: {
      variant: 'standard',
      tone: 'dark',
      alignment: 'left',
      density: 'compact',
    },
    sectionStylePatch: {
      sectionPaddingY: 'sm',
      sectionBackground: 'dark',
      contentAlignment: 'left',
    },
  },
];

export const BLOCK_VARIANTS: BlockVariantDefinition[] = [
  ...CAMPAIGN_LEAD_HERO_VARIANTS,
  ...HERO_VEHICLE_OFFER_VARIANTS,
  ...FAQ_VARIANTS,
  ...CTA_BAND_VARIANTS,
  ...TRUST_BAR_VARIANTS,
  ...FOOTER_LEGAL_VARIANTS,
];

const VARIANT_BY_ID = new Map(BLOCK_VARIANTS.map((variant) => [variant.id, variant]));

const VARIANTS_BY_BLOCK_TYPE = BLOCK_VARIANTS.reduce<Map<string, BlockVariantDefinition[]>>(
  (acc, variant) => {
    const list = acc.get(variant.blockType) ?? [];
    list.push(variant);
    acc.set(variant.blockType, list);
    return acc;
  },
  new Map(),
);

export const BLOCK_VARIANT_SUPPORTED_TYPES = [
  'campaign_lead_hero',
  'hero_vehicle_offer',
  'faq',
  'cta_band',
  'trust_bar',
  'footer_legal',
] as const;

export function getBlockVariantById(variantId: string): BlockVariantDefinition | undefined {
  return VARIANT_BY_ID.get(variantId);
}

export function getBlockVariantsForType(blockType: string): BlockVariantDefinition[] {
  return VARIANTS_BY_BLOCK_TYPE.get(blockType) ?? [];
}

export function hasBlockVariants(blockType: string): boolean {
  return getBlockVariantsForType(blockType).length > 0;
}

export function isKnownBlockVariantId(variantId: string): boolean {
  return VARIANT_BY_ID.has(variantId);
}
