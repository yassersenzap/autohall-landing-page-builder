export const EXPORT_TARGET_TYPES = [
  'static_html',
  'symfony_twig_page',
  'symfony_twig_fragment',
] as const;

export type ExportTargetType = (typeof EXPORT_TARGET_TYPES)[number];

export type ExportTargetDefinition = {
  type: ExportTargetType;
  label: string;
  description: string;
  /** Future export pipeline hint — not executed in this commit. */
  outputKind: 'zip_html' | 'symfony_page' | 'symfony_partial';
};
