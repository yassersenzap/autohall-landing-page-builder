/** Blocs actifs dans le Builder — catalogue hero-only (Phase 1). */
export const V4_BLOCK_TYPES = ['hero_universal', 'hero_art', 'hero-art', 'carousel'] as const;

/** Legacy encore présents en base (lecture / export). */
export const LEGACY_BLOCK_TYPES = [
  'core_campaign_form_landing',
  'hero_simple',
  'hero_split',
  'hero_background',
] as const;

export const ALLOWED_BLOCK_TYPES = [
  ...V4_BLOCK_TYPES,
  ...LEGACY_BLOCK_TYPES,
] as const;

export type AllowedBlockType = (typeof ALLOWED_BLOCK_TYPES)[number];

const HERO_ALIASES: Record<string, string> = {
  hero_simple: 'hero_universal',
  hero_split: 'hero_universal',
  hero_background: 'hero_universal',
};

export function resolveBlockTypeAlias(type: string): string {
  return HERO_ALIASES[type] ?? type;
}

export function isAllowedBlockType(type: string): boolean {
  return (ALLOWED_BLOCK_TYPES as readonly string[]).includes(type);
}
