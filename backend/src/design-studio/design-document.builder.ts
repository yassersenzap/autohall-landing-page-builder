import { escapeHtml } from '../landing-render/block-renderer';

export type DesignPreviewShell = {
  title: string;
  campaignName: string;
  brand: string;
};

export function buildGrapesPreviewDocument(
  shell: DesignPreviewShell,
  htmlSnapshot: string,
  cssSnapshot: string,
  themeStyle = '',
): string {
  const body = htmlSnapshot.trim() || '<main class="lp-page"></main>';
  const css = cssSnapshot.trim();

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(shell.title)}</title>
  <style>
    :root { --lp-primary: #b91c1c; --lp-font: Inter, system-ui, sans-serif; }
    body { margin: 0; font-family: var(--lp-font); }
    ${css}
  </style>
</head>
<body>
  <article class="lp-document" data-design-engine="grapesjs" style="${escapeHtml(themeStyle)}">
    ${body}
  </article>
</body>
</html>`;
}

export function buildGrapesExportIndexHtml(
  shell: DesignPreviewShell,
  htmlSnapshot: string,
  cssHref = 'assets/style.css',
): string {
  const body = htmlSnapshot.trim() || '<main class="lp-page"></main>';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>${escapeHtml(shell.title)}</title>
  <link rel="stylesheet" href="${escapeHtml(cssHref)}" />
</head>
<body>
  <article class="lp-document" data-design-engine="grapesjs">
    ${body}
  </article>
  <script src="js/landing-config.js"></script>
  <script src="js/lead-form.js"></script>
</body>
</html>`;
}
