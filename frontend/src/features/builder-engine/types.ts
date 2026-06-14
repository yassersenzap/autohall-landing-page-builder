/** Bloc du document constructeur (lab → futur branchement API). */
export type BuilderDocumentBlock = {
  id: string;
  type: string;
  label: string;
  sortOrder: number;
  propsJson: Record<string, unknown>;
};

export type { BaseBlockProps, BlockSectionStyleProps } from './types/block-props.types';

export type BuilderPaletteItem = {
  type: string;
  label: string;
  description: string;
};

export type HeroBlockProps = import('./types/block-props.types').BaseBlockProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonTarget?: string;
  secondaryButtonText?: string;
  secondaryButtonTarget?: string;
  imageUrl?: string;
  /** UUID d'un asset uploadé (LandingPageAsset) — pas de base64. */
  imageAssetId?: string;
  alt?: string;
};

export type LeadFormBlockProps = import('./types/block-props.types').BaseBlockProps & {
  title?: string;
  subtitle?: string;
  submitText?: string;
  privacyNote?: string;
  reassurance?: string[];
  fields?: import('@/lib/lead-form-block').LeadFormField[];
};
