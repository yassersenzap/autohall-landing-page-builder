import { buildTokenCss, resolveDesignTokens } from './design-tokens';
import { escapeHtml } from './escape-html';
import { createRenderContext, renderPuckDocumentHtml } from './render-puck-tree';
import { STUDIO_V2_LANDING_CSS } from './studio-v2-landing.css';
import type { PuckDocument, StudioV2AssetMap, StudioV2RenderMode } from './types';

export type BuildStudioV2HtmlInput = {
  document: PuckDocument;
  pageTitle: string;
  assetMap: StudioV2AssetMap;
  mode: StudioV2RenderMode;
  includeScripts?: boolean;
  stylesheetHref?: string;
};

export function buildStudioV2Html(input: BuildStudioV2HtmlInput): string {
  const tokens = resolveDesignTokens(input.document.root?.props as Record<string, unknown>);
  const tokenCss = buildTokenCss(tokens);
  const ctx = createRenderContext({
    mode: input.mode,
    assetMap: input.assetMap,
    tokens,
  });

  const bodyHtml = renderPuckDocumentHtml(input.document, ctx);
  const seo = input.document.root?.props?.seo;
  const metaTitle =
    (typeof seo?.title === 'string' && seo.title.trim()) ||
    input.document.root?.props?.title ||
    input.pageTitle;
  const metaDescription =
    typeof seo?.description === 'string' && seo.description.trim()
      ? `<meta name="description" content="${escapeHtml(seo.description.trim())}" />`
      : '';

  const stylesheet =
    input.stylesheetHref
      ? `<link rel="stylesheet" href="${escapeHtml(input.stylesheetHref)}" />`
      : `<style>${tokenCss}\n${STUDIO_V2_LANDING_CSS}</style>`;

  const scripts = input.includeScripts
    ? `<script src="js/landing-config.js"></script><script src="js/lead-form.js"></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(String(metaTitle))}</title>
  ${metaDescription}
  ${stylesheet}
</head>
<body>
  <main class="vs2-page">${bodyHtml}</main>
  ${scripts}
</body>
</html>`;
}

export function buildStudioV2ExportStyleCss(document: PuckDocument): string {
  const tokens = resolveDesignTokens(document.root?.props as Record<string, unknown>);
  return `${buildTokenCss(tokens)}\n${STUDIO_V2_LANDING_CSS}`;
}
