import { asPropString } from '@/features/builder-engine/lib/block-props';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import type { InspectorVisibilityCondition } from '@/features/builder/block-registry/inspector-control.types';
import { isControlVisible } from '../panels/inspector/inspector-control-utils';

export type BlockImageFieldDefinition = {
  id: string;
  assetKey: string;
  urlKey: string;
  altKey?: string;
  label: string;
  description?: string;
  visibleWhen?: InspectorVisibilityCondition;
};

export type BlockMediaProfile = {
  blockType: string;
  blockLabel: string;
  primaryFieldId: string;
  fields: BlockImageFieldDefinition[];
};

const DUAL_CAMPAIGN_LAYOUTS = ['dual_media_form_right', 'dual_media_form_left'];

const BLOCK_MEDIA_PROFILES: Record<string, BlockMediaProfile> = {
  hero_vehicle_offer: {
    blockType: 'hero_vehicle_offer',
    blockLabel: 'Hero offre véhicule',
    primaryFieldId: 'heroImage',
    fields: [
      {
        id: 'heroImage',
        assetKey: 'heroImage',
        urlKey: 'heroImageUrl',
        altKey: 'heroImageAlt',
        label: 'Image principale (desktop)',
      },
      {
        id: 'mobileImage',
        assetKey: 'mobileImage',
        urlKey: 'mobileImageUrl',
        label: 'Image mobile',
      },
    ],
  },
  campaign_lead_hero: {
    blockType: 'campaign_lead_hero',
    blockLabel: 'Hero campagne + lead',
    primaryFieldId: 'primaryImage',
    fields: [
      {
        id: 'primaryImage',
        assetKey: 'primaryImage',
        urlKey: 'primaryImageUrl',
        altKey: 'primaryImageAlt',
        label: 'Image principale',
      },
      {
        id: 'secondaryImage',
        assetKey: 'secondaryImage',
        urlKey: 'secondaryImageUrl',
        altKey: 'secondaryImageAlt',
        label: 'Image secondaire',
        visibleWhen: { prop: 'layoutVariant', oneOf: DUAL_CAMPAIGN_LAYOUTS },
      },
      {
        id: 'mobileImage',
        assetKey: 'mobileImage',
        urlKey: 'mobileImageUrl',
        label: 'Image mobile',
      },
    ],
  },
  media_only: {
    blockType: 'media_only',
    blockLabel: 'Média seul',
    primaryFieldId: 'image',
    fields: [
      {
        id: 'image',
        assetKey: 'imageAssetId',
        urlKey: 'imageUrl',
        altKey: 'imageAlt',
        label: 'Image',
      },
    ],
  },
  promo_autohall: {
    blockType: 'promo_autohall',
    blockLabel: 'Promo Auto Hall',
    primaryFieldId: 'image',
    fields: [
      {
        id: 'image',
        assetKey: 'imageAssetId',
        urlKey: 'imageUrl',
        altKey: 'imageAlt',
        label: 'Visuel promo / fond',
      },
    ],
  },
  hero_campaign: {
    blockType: 'hero_campaign',
    blockLabel: 'Hero campagne',
    primaryFieldId: 'image',
    fields: [
      {
        id: 'image',
        assetKey: 'imageAssetId',
        urlKey: 'imageUrl',
        altKey: 'alt',
        label: 'Visuel hero',
      },
    ],
  },
  hero_form_campaign: {
    blockType: 'hero_form_campaign',
    blockLabel: 'Hero + formulaire',
    primaryFieldId: 'image',
    fields: [
      {
        id: 'image',
        assetKey: 'imageAssetId',
        urlKey: 'imageUrl',
        label: 'Visuel hero',
      },
    ],
  },
};

export function getBlockMediaProfile(blockType: string): BlockMediaProfile | null {
  return BLOCK_MEDIA_PROFILES[blockType] ?? null;
}

export function getBlockImageFields(blockType: string): BlockImageFieldDefinition[] {
  return getBlockMediaProfile(blockType)?.fields ?? [];
}

export function getApplicableImageFieldsForBlock(
  block: BuilderDocumentBlock,
): BlockImageFieldDefinition[] {
  return getBlockImageFields(block.type).filter((field) =>
    isControlVisible(block.propsJson, field.visibleWhen),
  );
}

export function getBlockPrimaryImageFieldKeys(
  blockType: string,
): { assetKey: string; urlKey: string } | null {
  const profile = getBlockMediaProfile(blockType);
  if (!profile) return null;
  const primary =
    profile.fields.find((field) => field.id === profile.primaryFieldId) ?? profile.fields[0];
  if (!primary) return null;
  return { assetKey: primary.assetKey, urlKey: primary.urlKey };
}

export function readBlockImageAssetId(
  propsJson: Record<string, unknown>,
  field: BlockImageFieldDefinition,
): string {
  return asPropString(propsJson[field.assetKey]);
}

export function buildImageFieldPatch(
  field: BlockImageFieldDefinition,
  assetId: string,
): Record<string, unknown> {
  return {
    [field.assetKey]: assetId,
    [field.urlKey]: '',
  };
}

export function collectUsedAssetIdsOnBlock(block: BuilderDocumentBlock): Set<string> {
  const ids = new Set<string>();
  for (const field of getBlockImageFields(block.type)) {
    const assetId = readBlockImageAssetId(block.propsJson, field);
    if (assetId) ids.add(assetId);
  }
  return ids;
}

export function blockSupportsImageFields(blockType: string): boolean {
  return getBlockImageFields(blockType).length > 0;
}
