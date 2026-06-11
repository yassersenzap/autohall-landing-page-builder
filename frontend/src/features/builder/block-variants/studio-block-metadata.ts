/** Studio-only props — never persisted to export/API payloads. */
export const STUDIO_ONLY_BLOCK_PROP_KEYS = new Set(['_studioAppliedVariantId']);

export function stripStudioOnlyBlockProps(
  propsJson: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(propsJson)) {
    if (STUDIO_ONLY_BLOCK_PROP_KEYS.has(key)) continue;
    if (key.startsWith('_studio')) continue;
    out[key] = value;
  }
  return out;
}

export function readStudioAppliedVariantId(
  propsJson: Record<string, unknown>,
): string | null {
  const raw = propsJson._studioAppliedVariantId;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

export function withStudioAppliedVariantId(
  propsJson: Record<string, unknown>,
  variantId: string,
): Record<string, unknown> {
  return { ...propsJson, _studioAppliedVariantId: variantId };
}
