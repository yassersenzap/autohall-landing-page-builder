import { Prisma } from '@prisma/client';

export type ExportBlock = {
  blockType: string;
  sortOrder: number;
  propsJson: Prisma.JsonValue;
};

export type ExportPageContext = {
  title: string;
  campaignName: string;
  brand: string;
};

function propsAsRecord(propsJson: Prisma.JsonValue): Record<string, unknown> {
  if (propsJson && typeof propsJson === 'object' && !Array.isArray(propsJson)) {
    return propsJson as Record<string, unknown>;
  }
  return {};
}

function propString(
  props: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBlockHtml(block: ExportBlock): string {
  const props = propsAsRecord(block.propsJson);
  const type = block.blockType.toLowerCase();

  if (type === 'hero') {
    const title = propString(props, 'title');
    const subtitle = propString(props, 'subtitle');
    const buttonText = propString(props, 'buttonText');
    const buttonTarget = propString(props, 'buttonTarget', 'href') ?? '#';

    return `
    <section class="block block-hero">
      ${title ? `<h1 class="block-hero__title">${escapeHtml(title)}</h1>` : ''}
      ${subtitle ? `<p class="block-hero__subtitle">${escapeHtml(subtitle)}</p>` : ''}
      ${
        buttonText
          ? `<a class="block-hero__cta" href="${escapeHtml(buttonTarget)}">${escapeHtml(buttonText)}</a>`
          : ''
      }
    </section>`;
  }

  if (type === 'text') {
    const content = propString(props, 'content', 'text', 'body') ?? '';
    return `
    <section class="block block-text">
      <p>${escapeHtml(content)}</p>
    </section>`;
  }

  if (type === 'image') {
    const imageUrl = propString(props, 'imageUrl', 'src', 'url');
    const alt = propString(props, 'alt') ?? 'Image';

    if (imageUrl) {
      return `
    <section class="block block-image">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" loading="lazy" />
    </section>`;
    }

    return `
    <section class="block block-image block-image--placeholder">
      <p>Image non définie</p>
    </section>`;
  }

  if (type === 'button') {
    const label = propString(props, 'label', 'text', 'buttonText') ?? 'En savoir plus';
    const target = propString(props, 'target', 'href', 'buttonTarget') ?? '#';

    return `
    <section class="block block-button">
      <a class="block-button__link" href="${escapeHtml(target)}">${escapeHtml(label)}</a>
    </section>`;
  }

  return `
    <section class="block block-unknown">
      <p>Type de bloc non supporté : ${escapeHtml(block.blockType)}</p>
    </section>`;
}

export function buildIndexHtml(
  context: ExportPageContext,
  blocks: ExportBlock[],
): string {
  const body = blocks.map((block) => renderBlockHtml(block)).join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(context.title)}</title>
  <link rel="stylesheet" href="assets/style.css" />
</head>
<body>
  <header class="site-header">
    <p class="site-header__brand">${escapeHtml(context.brand)}</p>
    <p class="site-header__campaign">${escapeHtml(context.campaignName)}</p>
  </header>
  <main class="page">
${body}
  </main>
  <footer class="site-footer">
    <p>&copy; ${new Date().getFullYear()} Auto Hall</p>
  </footer>
  <script src="js/main.js"></script>
</body>
</html>
`;
}

export const STATIC_STYLE_CSS = `*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  color: #0f172a;
  background: #f8fafc;
}

.site-header,
.site-footer {
  padding: 1rem 1.5rem;
  background: #003b73;
  color: #ffffff;
  text-align: center;
}

.site-header__brand {
  margin: 0;
  font-weight: 700;
}

.site-header__campaign {
  margin: 0.25rem 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.block {
  margin-top: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.block-hero {
  padding: 3rem 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #003b73 0%, #005a9e 100%);
  color: #ffffff;
}

.block-hero__title {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

.block-hero__subtitle {
  margin: 0 0 1.25rem;
  opacity: 0.92;
}

.block-hero__cta {
  display: inline-block;
  padding: 0.65rem 1.25rem;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #003b73;
  font-weight: 600;
  text-decoration: none;
}

.block-text {
  padding: 1.25rem 1.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.block-text p {
  margin: 0;
}

.block-image {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.block-image img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

.block-image--placeholder {
  padding: 2rem;
  color: #64748b;
}

.block-button {
  padding: 1.5rem;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.block-button__link {
  display: inline-block;
  padding: 0.65rem 1.25rem;
  border-radius: 0.5rem;
  background: #003b73;
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
}
`;

export const STATIC_MAIN_JS = `document.addEventListener('DOMContentLoaded', function () {
  console.log('[AutoHall] Landing page statique chargée');
});
`;

export function buildExportFilename(slug: string, versionNumber: number): string {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `landing-${safeSlug || 'page'}-v${versionNumber}.zip`;
}
