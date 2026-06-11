import { sanitizeExportTarget } from './export-target.registry';
import type { ExportTargetType } from './export-target.types';
import type {
  AutohallSymfonyIncludeKey,
  FormProviderDefinition,
  FormProviderPreviewMode,
  FormProviderType,
} from './form-provider.types';
import {
  AUTOHALL_SYMFONY_INCLUDE_KEYS,
  FORM_PROVIDER_TYPES,
} from './form-provider.types';

export const DEFAULT_FORM_PROVIDER_TYPE: FormProviderType = 'builder_lead_api';

export const DEFAULT_SYMFONY_INCLUDE_KEY: AutohallSymfonyIncludeKey = 'testdrive_campaign';

export const FORM_PROVIDER_DEFINITIONS: Record<FormProviderType, FormProviderDefinition> = {
  builder_lead_api: {
    type: 'builder_lead_api',
    label: 'API Lead Builder',
    description:
      'Export HTML statique — soumission vers l’endpoint public NestJS du builder (pas de Symfony).',
    previewMode: 'static_shell',
    defaultExportTarget: 'static_html',
    endpointPath: '/api/public/leads',
  },
  autohall_symfony_testdrive: {
    type: 'autohall_symfony_testdrive',
    label: 'Symfony TestDrive Auto Hall',
    description:
      'Formulaire existant du site Auto Hall — modèles chargés via Symfony/Doctrine (export Twig futur).',
    previewMode: 'symfony_note',
    defaultExportTarget: 'symfony_twig_page',
    requiredRuntimeContext: ['brand_slug', 'campaign_slug', 'locale'],
    defaultIncludeKey: DEFAULT_SYMFONY_INCLUDE_KEY,
  },
  external_iframe: {
    type: 'external_iframe',
    label: 'Formulaire externe (iframe)',
    description:
      'Intègre un formulaire hébergé sur un domaine tiers — URL contrôlée, pas de Twig.',
    previewMode: 'iframe_placeholder',
    defaultExportTarget: 'static_html',
    iframeSrcPlaceholder: 'https://formulaires.exemple-auto.ma/embed/campagne',
  },
};

export function getFormProviderDefinition(type: FormProviderType): FormProviderDefinition {
  return FORM_PROVIDER_DEFINITIONS[type];
}

export function getFormProviderOptions(): Array<{ value: FormProviderType; label: string }> {
  return FORM_PROVIDER_TYPES.map((type) => ({
    value: type,
    label: FORM_PROVIDER_DEFINITIONS[type].label,
  }));
}

export function getSymfonyIncludeKeyOptions(): Array<{
  value: AutohallSymfonyIncludeKey;
  label: string;
}> {
  return AUTOHALL_SYMFONY_INCLUDE_KEYS.map((entry) => ({
    value: entry.value,
    label: entry.label,
  }));
}

export function isAllowedSymfonyIncludeKey(value: string): value is AutohallSymfonyIncludeKey {
  return AUTOHALL_SYMFONY_INCLUDE_KEYS.some((entry) => entry.value === value);
}

export function sanitizeFormProviderType(value: unknown): FormProviderType {
  if (typeof value === 'string' && FORM_PROVIDER_TYPES.includes(value as FormProviderType)) {
    return value as FormProviderType;
  }
  return DEFAULT_FORM_PROVIDER_TYPE;
}

export function sanitizeSymfonyIncludeKey(value: unknown): AutohallSymfonyIncludeKey {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return isAllowedSymfonyIncludeKey(trimmed) ? trimmed : DEFAULT_SYMFONY_INCLUDE_KEY;
}

export function sanitizeFormProviderPreviewMode(value: unknown): FormProviderPreviewMode {
  const modes: FormProviderPreviewMode[] = [
    'static_shell',
    'symfony_note',
    'iframe_placeholder',
  ];
  if (typeof value === 'string' && modes.includes(value as FormProviderPreviewMode)) {
    return value as FormProviderPreviewMode;
  }
  return 'static_shell';
}

export function resolvePreviewModeForProvider(
  providerType: FormProviderType,
): FormProviderPreviewMode {
  return FORM_PROVIDER_DEFINITIONS[providerType].previewMode;
}

export function resolveDefaultExportTargetForProvider(
  providerType: FormProviderType,
): ExportTargetType {
  return FORM_PROVIDER_DEFINITIONS[providerType].defaultExportTarget;
}

/** Rejects javascript/data/blob URLs — iframe src is display-only in Studio. */
export function sanitizeExternalIframeSrc(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(javascript|data|blob):/i.test(trimmed)) return '';
  if (trimmed.includes('{%') || trimmed.includes('%}')) return '';
  return trimmed;
}

export function parseCampaignLeadHeroFormIntegration(propsJson: Record<string, unknown>): {
  formProviderType: FormProviderType;
  exportTarget: ExportTargetType;
  formProviderPreviewMode: FormProviderPreviewMode;
  formExternalIframeSrc: string;
  symfonyFormIncludeKey: AutohallSymfonyIncludeKey;
} {
  const formProviderType = sanitizeFormProviderType(propsJson.formProviderType);
  return {
    formProviderType,
    exportTarget: sanitizeExportTarget(
      propsJson.exportTarget ?? resolveDefaultExportTargetForProvider(formProviderType),
    ),
    formProviderPreviewMode: sanitizeFormProviderPreviewMode(
      propsJson.formProviderPreviewMode ??
        resolvePreviewModeForProvider(formProviderType),
    ),
    formExternalIframeSrc: sanitizeExternalIframeSrc(propsJson.formExternalIframeSrc),
    symfonyFormIncludeKey: sanitizeSymfonyIncludeKey(propsJson.symfonyFormIncludeKey),
  };
}

export const SYMFONY_FORM_PREVIEW_NOTE =
  'Formulaire Symfony Auto Hall — rendu réel côté site Auto Hall.';
