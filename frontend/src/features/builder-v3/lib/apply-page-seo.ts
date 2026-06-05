import type { PageSettingsDraft } from '@/features/builder-engine/store/builder-document.store';

function upsertMeta(
  doc: Document,
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`;
  const existing = doc.querySelector(selector);

  if (!content.trim()) {
    existing?.remove();
    return;
  }

  const el = existing ?? doc.createElement('meta');
  el.setAttribute(attr, key);
  el.setAttribute('content', content);
  if (!existing) doc.head.appendChild(el);
}

function upsertLink(doc: Document, rel: string, href: string): void {
  const selector = `link[rel="${rel}"]`;
  const existing = doc.querySelector(selector);

  if (!href.trim()) {
    existing?.remove();
    return;
  }

  const el = existing ?? doc.createElement('link');
  el.setAttribute('rel', rel);
  el.setAttribute('href', href);
  if (!existing) doc.head.appendChild(el);
}

type ApplyPageSeoOptions = {
  fallbackTitle?: string;
};

/** Injecte titre, meta description, Open Graph et favicon dans le <head> d’un document. */
export function applyPageSeoToDocument(
  doc: Document,
  settings: PageSettingsDraft,
  options: ApplyPageSeoOptions = {},
): void {
  const fallbackTitle = options.fallbackTitle ?? 'Campagne Auto Hall';
  const metaTitle = settings.metaTitle.trim();
  const metaDescription = settings.metaDescription.trim();
  const ogImage = settings.ogImageUrl.trim();
  const favicon = settings.faviconUrl.trim();
  const documentTitle = metaTitle || fallbackTitle;

  doc.title = documentTitle;

  upsertMeta(doc, 'name', 'description', metaDescription);
  upsertMeta(doc, 'property', 'og:title', metaTitle || documentTitle);
  upsertMeta(doc, 'property', 'og:description', metaDescription);
  upsertMeta(doc, 'property', 'og:type', 'website');
  upsertMeta(doc, 'name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');
  upsertMeta(doc, 'name', 'twitter:title', metaTitle || documentTitle);
  upsertMeta(doc, 'name', 'twitter:description', metaDescription);

  if (ogImage) {
    upsertMeta(doc, 'property', 'og:image', ogImage);
    upsertMeta(doc, 'name', 'twitter:image', ogImage);
  } else {
    doc.querySelector('meta[property="og:image"]')?.remove();
    doc.querySelector('meta[name="twitter:image"]')?.remove();
  }

  upsertLink(doc, 'icon', favicon);
}
