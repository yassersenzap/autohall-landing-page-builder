export const MEDIA_ASPECT_RATIO_OPTIONS = [
  { value: '16:9', label: '16:9 — Vidéo (standard)' },
  { value: '4:3', label: '4:3 — Classique' },
  { value: '21:9', label: '21:9 — Cinéma ultra-large' },
] as const;

export const MEDIA_ASPECT_RATIO_CLASS: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '21:9': 'aspect-[21/9]',
};

export function resolveMediaAspectClass(ratio: string | undefined): string {
  return MEDIA_ASPECT_RATIO_CLASS[ratio ?? '16:9'] ?? MEDIA_ASPECT_RATIO_CLASS['16:9'];
}

export const SPACER_HEIGHT_CLASS: Record<string, string> = {
  S: 'min-h-[32px]',
  M: 'min-h-[64px]',
  L: 'min-h-[128px]',
};

export const SPACER_TYPE_OPTIONS = [
  { value: 'solid', label: 'Ligne pleine' },
  { value: 'dashed', label: 'Ligne pointillée' },
  { value: 'space', label: 'Espace vide' },
] as const;

export const RICH_TEXT_ALIGN_CLASS: Record<string, string> = {
  left: 'text-left mx-0 mr-auto',
  center: 'text-center mx-auto',
  right: 'text-right ml-auto mr-0',
};

export function resolveRichTextAlign(alignement: string | undefined): string {
  return RICH_TEXT_ALIGN_CLASS[alignement ?? 'center'] ?? RICH_TEXT_ALIGN_CLASS.center;
}
