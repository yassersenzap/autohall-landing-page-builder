const FULL_BLEED_TYPES = new Set(['hero', 'features']);

export function isFullBleedBlockType(type: string): boolean {
  return FULL_BLEED_TYPES.has(type.toLowerCase());
}
