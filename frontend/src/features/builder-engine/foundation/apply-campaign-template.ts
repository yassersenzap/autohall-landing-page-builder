import { createSafeRandomId } from '@/lib/create-safe-random-id';
import {
  applyBlockVariantSafely,
  mergeVariantPatchIntoProps,
} from '@/features/builder/block-variants';
import { withStudioAppliedVariantId } from '@/features/builder/block-variants/studio-block-metadata';
import { getDefaultBlockProps } from '../constants/default-block-props';
import { isBackendSupportedBlockType } from '../registry/backend-block-types';
import { getRegistryEntry } from '../registry/block-registry';
import type { BuilderDocumentBlock } from '../types';
import type {
  CampaignPageTemplate,
  CampaignTemplateBlockSpec,
} from './campaign-page-templates.types';

function mergeTemplateProps(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = result[key];
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      current !== null &&
      typeof current === 'object' &&
      !Array.isArray(current)
    ) {
      result[key] = mergeTemplateProps(
        current as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function materializeTemplateBlock(
  spec: CampaignTemplateBlockSpec,
  sortOrder: number,
): BuilderDocumentBlock | null {
  if (!isBackendSupportedBlockType(spec.type)) return null;

  const base = getDefaultBlockProps(spec.type);
  let propsJson = spec.props ? mergeTemplateProps(base, spec.props) : base;

  if (spec.variant?.variantId) {
    const patch = applyBlockVariantSafely(spec.type, propsJson, spec.variant.variantId);
    if (patch) {
      propsJson = mergeVariantPatchIntoProps(propsJson, patch);
      propsJson = withStudioAppliedVariantId(propsJson, spec.variant.variantId);
    }
  }

  const entry = getRegistryEntry(spec.type);

  return {
    id: createSafeRandomId(),
    type: spec.type,
    label: spec.label ?? entry?.label ?? spec.type,
    sortOrder,
    propsJson,
  };
}

export function materializeCampaignTemplate(
  template: CampaignPageTemplate,
): BuilderDocumentBlock[] {
  const blocks: BuilderDocumentBlock[] = [];
  for (const spec of template.blocks) {
    const block = materializeTemplateBlock(spec, blocks.length);
    if (block) blocks.push(block);
  }
  return blocks;
}

const MEANINGFUL_HERO_TYPES = [
  'core_campaign_form_landing',
  'campaign_lead_hero',
  'hero_vehicle_offer',
  'vehicle_showcase_split',
  'promo_autohall',
  'hero_campaign',
  'hero_form_campaign',
] as const;

/** Select hero/first block after template apply — keeps inspector focused on primary content. */
export function selectFirstMeaningfulBlockId(
  blocks: BuilderDocumentBlock[],
): string | null {
  for (const type of MEANINGFUL_HERO_TYPES) {
    const match = blocks.find((block) => block.type === type);
    if (match) return match.id;
  }
  return blocks[0]?.id ?? null;
}

export function getTemplateBlockTypes(template: CampaignPageTemplate): string[] {
  return template.blocks.map((block) => block.type);
}
