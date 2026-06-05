import { Prisma } from '@prisma/client';

/**
 * Chemin relatif dans le ZIP exporté — le frontend ne doit pas le calculer.
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

  function walk(value: unknown): void {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
      return;
    }

    if (typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    const assetId = record.imageAssetId;
    if (typeof assetId === 'string' && assetId.trim().length > 0) {
      ids.add(assetId.trim());
    }

    for (const nested of Object.values(record)) {
      if (nested !== null && typeof nested === 'object') {
        walk(nested);
      }
    }
  }

  for (const block of blocks) {
    if (!block.propsJson || typeof block.propsJson !== 'object') {
      continue;
    }
    if (Array.isArray(block.propsJson)) {
      continue;
    }
    walk(block.propsJson);
  }

  return [...ids];
}

/** Extrait les imageAssetId d'un document Puck Studio V2. */
export function extractUsedAssetIdsFromPuckDocument(
  document: Record<string, unknown>,
): string[] {
  const ids = new Set<string>();

  function walk(value: unknown): void {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    const assetId = record.imageAssetId;
    if (typeof assetId === 'string' && assetId.trim()) {
      ids.add(assetId.trim());
    }
    for (const nested of Object.values(record)) {
      if (nested !== null && typeof nested === 'object') walk(nested);
    }
  }

  walk(document.content);
  walk(document.root);
  return [...ids];
}
