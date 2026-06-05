export const SECTION_PADDING_OPTIONS = [
  { value: 'S', label: 'S — Compact (32px)' },
  { value: 'M', label: 'M — Standard (48px)' },
  { value: 'L', label: 'L — Aéré (64px)' },
  { value: 'XL', label: 'XL — Hero (96px)' },
] as const;

export const SECTION_PADDING_CLASS: Record<string, string> = {
  S: 'py-8',
  M: 'py-12',
  L: 'py-16',
  XL: 'py-24',
};

export const TEXT_ALIGNMENT_CLASS: Record<string, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

export function resolveSectionPadding(value: string | undefined): string {
  return SECTION_PADDING_CLASS[value ?? 'M'] ?? SECTION_PADDING_CLASS.M;
}

export function resolveTextAlignment(value: string | undefined): string {
  return TEXT_ALIGNMENT_CLASS[value ?? 'left'] ?? TEXT_ALIGNMENT_CLASS.left;
}
