import type { PuckDocument } from './types';

export function extractUsedAssetIdsFromPuckDocument(
  document: PuckDocument,
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

    if (Array.isArray(record.vehicles)) {
      for (const vehicle of record.vehicles) walk(vehicle);
    }

    for (const nested of Object.values(record)) {
      if (nested !== null && typeof nested === 'object') walk(nested);
    }
  }

  walk(document.content);
  walk(document.root?.props);
  return [...ids];
}

export function containsForbiddenAssetUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const lower = value.toLowerCase();
  return (
    lower.startsWith('data:image') ||
    lower.includes('localhost') ||
    lower.includes('/api/assets/')
  );
}
