/** Auto Hall campaign typography — design-system/autohallstudio/MASTER.md */
export const AUTOHALL_CAMPAIGN_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syncopate:wght@400;700&display=swap';

export const AUTOHALL_HEADING_FONT = "'Syncopate', system-ui, sans-serif";
export const AUTOHALL_BODY_FONT = "'Space Mono', ui-monospace, monospace";

export function renderAutohallCampaignFontsLinkTags(): string {
  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${AUTOHALL_CAMPAIGN_FONTS_URL}" />`;
}
