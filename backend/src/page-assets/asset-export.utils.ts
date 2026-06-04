import { Prisma } from '@prisma/client';

/**
 * Chemin relatif dans le ZIP exporté (futur) — le frontend ne doit pas le calculer.
 */
export function resolveAssetPublicPath(storedName: string): string {
  return `assets/images/${storedName}`;
}

/**
 * Extrait les IDs d'assets référencés dans layout_json (props des blocs).
 * À utiliser lors de l'export ZIP pour copier uniquement les fichiers utilisés.
 */
export function extractUsedAssetIdsFromBlocks(
  blocks: Array<{ propsJson: Prisma.JsonValue }>,
): string[] {
  const ids = new Set<string>();

  for (const block of blocks) {
    if (!block.propsJson || typeof block.propsJson !== 'object') {
      continue;
    }
    if (Array.isArray(block.propsJson)) {
      continue;
    }

    const record = block.propsJson as Record<string, unknown>;
    const assetId = record.imageAssetId;
    if (typeof assetId === 'string' && assetId.trim().length > 0) {
      ids.add(assetId.trim());
    }
  }

  return [...ids];
}
