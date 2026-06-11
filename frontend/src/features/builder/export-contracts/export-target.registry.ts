import {
  EXPORT_TARGET_TYPES,
  type ExportTargetDefinition,
  type ExportTargetType,
} from './export-target.types';

export const DEFAULT_EXPORT_TARGET: ExportTargetType = 'static_html';

export const EXPORT_TARGET_DEFINITIONS: Record<ExportTargetType, ExportTargetDefinition> = {
  static_html: {
    type: 'static_html',
    label: 'HTML statique (ZIP)',
    description:
      'Export autonome du builder — assets embarqués et formulaire via API lead publique si configuré.',
    outputKind: 'zip_html',
  },
  symfony_twig_page: {
    type: 'symfony_twig_page',
    label: 'Page Symfony / Twig',
    description:
      'Page complète intégrée au site Auto Hall — formulaire TestDrive rendu par Symfony (futur).',
    outputKind: 'symfony_page',
  },
  symfony_twig_fragment: {
    type: 'symfony_twig_fragment',
    label: 'Fragment Twig Symfony',
    description:
      'Section réutilisable incluse dans une page Symfony existante (futur).',
    outputKind: 'symfony_partial',
  },
};

export function getExportTargetDefinition(
  type: ExportTargetType,
): ExportTargetDefinition {
  return EXPORT_TARGET_DEFINITIONS[type];
}

export function getExportTargetOptions(): Array<{ value: ExportTargetType; label: string }> {
  return EXPORT_TARGET_TYPES.map((type) => ({
    value: type,
    label: EXPORT_TARGET_DEFINITIONS[type].label,
  }));
}

export function sanitizeExportTarget(value: unknown): ExportTargetType {
  if (typeof value === 'string' && value in EXPORT_TARGET_DEFINITIONS) {
    return value as ExportTargetType;
  }
  return DEFAULT_EXPORT_TARGET;
}
