export type {
  BlockVariantCategory,
  BlockVariantDefinition,
  BlockVariantPatchStrategy,
  BlockVariantRef,
  BlockVariantSafeApplyMode,
} from './block-variant.types';

export {
  applyBlockVariantSafely,
  buildVariantPatchFromDefinition,
  mergeVariantPatchIntoProps,
} from './apply-block-variant';

export {
  BLOCK_VARIANTS,
  BLOCK_VARIANT_SUPPORTED_TYPES,
  getBlockVariantById,
  getBlockVariantsForType,
  hasBlockVariants,
  isKnownBlockVariantId,
} from './block-variant.registry';
