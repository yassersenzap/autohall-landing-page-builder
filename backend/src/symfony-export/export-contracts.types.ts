export const FORM_PROVIDER_TYPES = [
  'builder_lead_api',
  'autohall_symfony_testdrive',
  'external_iframe',
] as const;

export type FormProviderType = (typeof FORM_PROVIDER_TYPES)[number];

export const EXPORT_TARGET_TYPES = [
  'static_html',
  'symfony_twig_page',
  'symfony_twig_fragment',
] as const;

export type ExportTargetType = (typeof EXPORT_TARGET_TYPES)[number];

/** Whitelisted Symfony TestDrive include keys — never a raw Twig path. */
export const AUTOHALL_SYMFONY_INCLUDE_KEYS = [
  'testdrive_campaign',
  'testdrive_model',
  'testdrive_promo',
] as const;

export type AutohallSymfonyIncludeKey = (typeof AUTOHALL_SYMFONY_INCLUDE_KEYS)[number];

export type CampaignLeadHeroFormIntegration = {
  formProviderType: FormProviderType;
  exportTarget: ExportTargetType;
  symfonyFormIncludeKey: AutohallSymfonyIncludeKey;
};
