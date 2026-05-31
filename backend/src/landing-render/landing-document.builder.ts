import { Prisma } from '@prisma/client';
import {
  escapeHtml,
  renderBlockHtml,
  renderBlocksHtml,
  renderPageShellFooter,
  renderPageShellHeader,
  type RenderBlockInput,
  type RenderPageShell,
} from './block-renderer';
import { resolveLandingTheme } from './landing-theme';

export type BuildLandingDocumentInput = {
  shell: RenderPageShell;
  blocks: RenderBlockInput[];
  themeJson: Prisma.JsonValue | null;
  includeScripts?: boolean;
  stylesheetHref?: string;
};

export function buildLandingDocumentHtml(input: BuildLandingDocumentInput): string {
  const theme = resolveLandingTheme(input.themeJson);
  const body = renderBlocksHtml(input.blocks);
  const header = renderPageShellHeader(input.shell);
  const footer = renderPageShellFooter();
  const stylesheet = input.stylesheetHref
    ? `<link rel="stylesheet" href="${escapeHtml(input.stylesheetHref)}" />`
    : '';

  const scripts = input.includeScripts
    ? `
  <script src="js/landing-config.js"></script>
  <script src="js/main.js"></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="${theme.mode === 'dark' ? 'dark light' : 'light dark'}" />
  <title>${escapeHtml(input.shell.title)}</title>
  ${stylesheet}
</head>
<body>
  <article class="lp-document" data-theme="${theme.mode}" style="${theme.cssVariables}">
${header}
    <main class="lp-page">
${body}
    </main>
${footer}
  </article>${scripts}
</body>
</html>
`;
}

export function buildLandingPreviewFragment(input: {
  shell: RenderPageShell;
  blocks: RenderBlockInput[];
  themeJson: Prisma.JsonValue | null;
}): {
  themeMode: 'light' | 'dark';
  themeStyle: string;
  headerHtml: string;
  blocksHtml: { id: string; html: string }[];
  footerHtml: string;
  mainHtml: string;
} {
  const theme = resolveLandingTheme(input.themeJson);
  const blocksWithIds = input.blocks as Array<RenderBlockInput & { id?: string }>;

  const blocksHtml = blocksWithIds.map((block, index) => ({
    id: block.id ?? `block-${index}`,
    html: renderBlockHtml(block),
  }));

  const headerHtml = renderPageShellHeader(input.shell);
  const footerHtml = renderPageShellFooter();
  const mainHtml = blocksHtml.map((b) => b.html).join('\n');

  return {
    themeMode: theme.mode,
    themeStyle: theme.cssVariables,
    headerHtml,
    blocksHtml,
    footerHtml,
    mainHtml,
  };
}
