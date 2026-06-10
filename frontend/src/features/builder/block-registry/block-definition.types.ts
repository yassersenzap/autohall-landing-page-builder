import type { BrandPresetId } from '../brand-presets';
import type { DesignControl } from './design-control.types';
import type { ImageControl } from './image-control.types';

export type PremiumBlockCategory =
  | 'hero'
  | 'conversion'
  | 'content'
  | 'trust'
  | 'footer';

export type BlockAvailability = 'foundation' | 'experimental' | 'stable';

/** Editable text or asset field in the builder inspector. */
export type EditableFieldType = 'text' | 'textarea' | 'asset' | 'brand' | 'cta';

export type EditableField = {
  key: string;
  label: string;
  fieldType: EditableFieldType;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
};

/**
 * Contract for premium brand-aware blocks.
 * Coexists with legacy `builder-engine/registry/block-registry.ts`.
 */
export type BlockDefinition<
  TType extends string = string,
  TContent extends Record<string, unknown> = Record<string, unknown>,
  TDesign extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: TType;
  label: string;
  description: string;
  category: PremiumBlockCategory;
  availability: BlockAvailability;
  defaultContent: TContent;
  defaultDesign: TDesign;
  editableFields: EditableField[];
  designControls: DesignControl[];
  imageControls: ImageControl[];
  compatibleBrands: BrandPresetId[] | 'all';
  /** Key resolved by the private React builder preview layer. */
  builderRenderer: string;
  /** Key resolved by backend `landing-render` for static HTML export. */
  exportRenderer: string;
};
