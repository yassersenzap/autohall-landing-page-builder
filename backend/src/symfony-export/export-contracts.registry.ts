import type {
  AutohallSymfonyIncludeKey,
  CampaignLeadHeroFormIntegration,
  ExportTargetType,
  FormProviderType,
} from './export-contracts.types';
import {
  AUTOHALL_SYMFONY_INCLUDE_KEYS,
  EXPORT_TARGET_TYPES,
  FORM_PROVIDER_TYPES,
} from './export-contracts.types';

export const DEFAULT_FORM_PROVIDER_TYPE: FormProviderType = 'builder_lead_api';
export const DEFAULT_EXPORT_TARGET: ExportTargetType = 'static_html';
export const DEFAULT_SYMFONY_INCLUDE_KEY: AutohallSymfonyIncludeKey =
  'testdrive_campaign';

export const SYMFONY_FORM_STATIC_EXPORT_NOTE =
  'Formulaire Symfony Auto Hall — rendu réel côté site Auto Hall.';

export const SYMFONY_REQUIRED_RUNTIME_CONTEXT = [
  'formtestdrive',
  'currentLocale',
  'brand_slug',
  'campaign_slug',
] as const;

export function isAllowedSymfonyIncludeKey(
  value: string,
): value is AutohallSymfonyIncludeKey {
  return (AUTOHALL_SYMFONY_INCLUDE_KEYS as readonly string[]).includes(value);
}

export function sanitizeFormProviderType(value: unknown): FormProviderType {
  if (
    typeof value === 'string' &&
    (FORM_PROVIDER_TYPES as readonly string[]).includes(value)
  ) {
    return value as FormProviderType;
  }
  return DEFAULT_FORM_PROVIDER_TYPE;
}

export function sanitizeExportTarget(value: unknown): ExportTargetType {
  if (
    typeof value === 'string' &&
    (EXPORT_TARGET_TYPES as readonly string[]).includes(value)
  ) {
    return value as ExportTargetType;
  }
  return DEFAULT_EXPORT_TARGET;
}

export function sanitizeSymfonyIncludeKey(
  value: unknown,
): AutohallSymfonyIncludeKey {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (isAllowedSymfonyIncludeKey(trimmed)) {
    return trimmed;
  }
  return DEFAULT_SYMFONY_INCLUDE_KEY;
}

export function parseCampaignLeadHeroFormIntegration(
  propsJson: Record<string, unknown>,
): CampaignLeadHeroFormIntegration {
  const formProviderType = sanitizeFormProviderType(propsJson.formProviderType);
  return {
    formProviderType,
    exportTarget: sanitizeExportTarget(propsJson.exportTarget),
    symfonyFormIncludeKey: sanitizeSymfonyIncludeKey(
      propsJson.symfonyFormIncludeKey,
    ),
  };
}

export function blockRequiresSymfonyArtifacts(
  integration: CampaignLeadHeroFormIntegration,
): boolean {
  return (
    integration.formProviderType === 'autohall_symfony_testdrive' ||
    integration.exportTarget === 'symfony_twig_page' ||
    integration.exportTarget === 'symfony_twig_fragment'
  );
}

export function blockRequiresSymfonyPageExample(
  integration: CampaignLeadHeroFormIntegration,
): boolean {
  return integration.exportTarget === 'symfony_twig_page';
}
