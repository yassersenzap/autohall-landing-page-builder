import type { BrandPresetId } from '@/features/builder/brand-presets';

import type { BlockVariantRef } from '@/features/builder/block-variants';

/** Block entry inside a campaign page template — merged onto neutral defaults at apply time. */
export type CampaignTemplateBlockSpec = {
  type: string;
  /** Canvas label override */
  label?: string;
  /** Partial props merged onto getDefaultBlockProps(type) */
  props?: Record<string, unknown>;
  /** Optional preset variant — applied after props merge when template apply supports it. */
  variant?: BlockVariantRef;
};

export type CampaignPageTemplateCategory =
  | 'campaign'
  | 'model'
  | 'test-drive'
  | 'generic'
  | 'brand'
  | 'vehicle-offer'
  | 'service';

/** Studio grouping for TemplatesPanel — production page recipes. */
export type CampaignPageTemplateUseCase =
  | 'brand-page'
  | 'vehicle-offer'
  | 'conversion'
  | 'service';

export type CampaignPageTemplateBrandId = BrandPresetId | 'autohall';

/** Data-driven full-page preset for SI Digital campaign landings. */
export type CampaignPageTemplate = {
  id: string;
  name: string;
  description: string;
  brandId: CampaignPageTemplateBrandId;
  category: CampaignPageTemplateCategory;
  /** Panel grouping — marque, offre, conversion, service. */
  useCase: CampaignPageTemplateUseCase;
  /** Short label for cards / future thumbnail slot */
  previewLabel: string;
  recommendedUse: string;
  blocks: CampaignTemplateBlockSpec[];
};
