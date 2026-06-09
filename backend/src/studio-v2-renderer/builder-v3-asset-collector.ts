import { Prisma } from '@prisma/client';
import { extractUsedAssetIdsFromBlocks } from '../page-assets/asset-export.utils';

export type BuilderV3AssetSource = {
  blocks: Array<{ propsJson: Record<string, unknown> }>;
  pageSettings?: Record<string, unknown>;
};

const PAGE_SETTINGS_ASSET_KEYS = ['ogImageAssetId', 'faviconAssetId'] as const;

function collectPageSettingsAssetIds(
  pageSettings: Record<string, unknown> | undefined,
  ids: Set<string>,
): void {
  if (!pageSettings) return;
  for (const key of PAGE_SETTINGS_ASSET_KEYS) {
    const value = pageSettings[key];
    if (typeof value === 'string' && value.trim()) {
      ids.add(value.trim());
    }
  }
}

/**
 * Collects LandingPageAsset IDs referenced by Builder V3 blocks and page settings.
 * Uses the known `imageAssetId` prop shape (including nested gallery/vehicle items).
 */
export function extractBuilderV3AssetIds(source: BuilderV3AssetSource): string[] {
  const pseudoBlocks = source.blocks.map((block) => ({
    propsJson: block.propsJson as Prisma.JsonValue,
  }));
  const ids = new Set(extractUsedAssetIdsFromBlocks(pseudoBlocks));
  collectPageSettingsAssetIds(source.pageSettings, ids);
  return [...ids];
}
