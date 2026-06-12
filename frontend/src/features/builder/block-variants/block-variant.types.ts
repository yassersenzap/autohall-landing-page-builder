export type BlockVariantCategory =
  | 'layout'
  | 'style'
  | 'conversion'
  | 'media'
  | 'compact';

export type BlockVariantSafeApplyMode =
  | 'visual_only'
  | 'layout_and_visual'
  | 'content_optional';

export type BlockVariantPatchStrategy = 'merge_props' | 'replace_visual_subset';

export type BlockVariantDefinition = {
  id: string;
  blockType: string;
  name: string;
  description: string;
  /** Short label for compact cards (emoji or token). */
  previewLabel: string;
  category: BlockVariantCategory;
  patchStrategy: BlockVariantPatchStrategy;
  /** Top-level props — visual/layout keys only by default. */
  propsPatch?: Record<string, unknown>;
  /** Nested design object patch. */
  designPatch?: Record<string, unknown>;
  /** Nested sectionStyle patch — sanitized before apply. */
  sectionStylePatch?: Record<string, unknown>;
  /** Nested blockVisual patch — per-block visual adjustments. */
  blockVisualPatch?: Record<string, unknown>;
  safeApplyMode: BlockVariantSafeApplyMode;
};

/** Optional variant reference on campaign templates (future apply hook). */
export type BlockVariantRef = {
  variantId: string;
};
