import type { ExportTargetType } from './export-target.types';

/** How the Studio preview represents the form — never executes Twig or live leads. */
export type FormProviderPreviewMode =
  | 'static_shell'
  | 'symfony_note'
  | 'iframe_placeholder';

export const FORM_PROVIDER_TYPES = [
  'builder_lead_api',
  'autohall_symfony_testdrive',
  'external_iframe',
] as const;

export type FormProviderType = (typeof FORM_PROVIDER_TYPES)[number];

export type FormProviderDefinitionBase = {
  type: FormProviderType;
  label: string;
  description: string;
  previewMode: FormProviderPreviewMode;
  defaultExportTarget: ExportTargetType;
};

export type BuilderLeadApiProviderDefinition = FormProviderDefinitionBase & {
  type: 'builder_lead_api';
  /** Relative public lead endpoint used by static HTML exports. */
  endpointPath: string;
};

export type AutohallSymfonyTestDriveProviderDefinition = FormProviderDefinitionBase & {
  type: 'autohall_symfony_testdrive';
  /** Symfony runtime keys required when the Twig page is rendered (not stored in Twig). */
  requiredRuntimeContext: readonly string[];
  defaultIncludeKey: AutohallSymfonyIncludeKey;
};

export type ExternalIframeProviderDefinition = FormProviderDefinitionBase & {
  type: 'external_iframe';
  iframeSrcPlaceholder: string;
};

export type FormProviderDefinition =
  | BuilderLeadApiProviderDefinition
  | AutohallSymfonyTestDriveProviderDefinition
  | ExternalIframeProviderDefinition;

/** Whitelisted Symfony TestDrive include keys — never a raw Twig path. */
export const AUTOHALL_SYMFONY_INCLUDE_KEYS = [
  { value: 'testdrive_campaign', label: 'Campagne — TestDrive standard' },
  { value: 'testdrive_model', label: 'Modèle — fiche véhicule' },
  { value: 'testdrive_promo', label: 'Promo — offre spéciale' },
] as const;

export type AutohallSymfonyIncludeKey =
  (typeof AUTOHALL_SYMFONY_INCLUDE_KEYS)[number]['value'];
