import indexCssUrl from '../../../index.css?url';
import landingCssUrl from '../../../../../backend/src/landing-render/styles/landing-page.css?url';

const V3_IFRAME_STYLE_MARKER = 'data-builder-v3-styles';

let warmStyleAssetsPromise: Promise<void> | null = null;

function preloadStylesheet(href: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLLinkElement>(`link[rel="stylesheet"][href="${href}"]`);
    if (existing?.sheet) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    const done = () => resolve();
    link.addEventListener('load', done, { once: true });
    link.addEventListener('error', done, { once: true });
    document.head.appendChild(link);
    window.setTimeout(done, 2_000);
  });
}

/** Warm critical stylesheet URLs while the document hydrates (studio boot). */
export function warmIframeStyleAssets(): Promise<void> {
  if (!warmStyleAssetsPromise) {
    warmStyleAssetsPromise = Promise.all([
      preloadStylesheet(indexCssUrl),
      preloadStylesheet(landingCssUrl),
    ]).then(() => undefined);
  }
  return warmStyleAssetsPromise;
}

function appendStylesheet(doc: Document, href: string, id?: string): HTMLLinkElement {
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  if (id) link.id = id;
  doc.head.appendChild(link);
  return link;
}

function waitForStylesheet(link: HTMLLinkElement): Promise<void> {
  return new Promise((resolve) => {
    if (link.sheet) {
      resolve();
      return;
    }
    const done = () => resolve();
    link.addEventListener('load', done, { once: true });
    link.addEventListener('error', done, { once: true });
    window.setTimeout(done, 4_000);
  });
}

/** Copie Tailwind (app) + landing CSS dans le head de l’iframe — isolation sans bleeding. */
export async function injectIframeStyles(doc: Document): Promise<void> {
  if (doc.head.querySelector(`[${V3_IFRAME_STYLE_MARKER}]`)) {
    return;
  }

  const marker = doc.createElement('meta');
  marker.setAttribute(V3_IFRAME_STYLE_MARKER, 'true');
  doc.head.appendChild(marker);

  const pending: Promise<void>[] = [];

  pending.push(waitForStylesheet(appendStylesheet(doc, indexCssUrl, 'builder-v3-app-css')));
  pending.push(waitForStylesheet(appendStylesheet(doc, landingCssUrl, 'builder-v3-landing-css')));

  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = (link as HTMLLinkElement).href;
    if (!href || href.includes('landing-page') || href.includes('index')) return;
    const clone = appendStylesheet(doc, href);
    pending.push(waitForStylesheet(clone));
  });

  document.querySelectorAll('style').forEach((style) => {
    if (!style.textContent?.trim()) return;
    const clone = doc.createElement('style');
    clone.textContent = style.textContent;
    doc.head.appendChild(clone);
  });

  const shell = doc.createElement('style');
  shell.id = 'builder-v3-shell-css';
  shell.textContent = `
    html, body { margin: 0; min-height: 100%; background: #fff; }
    :root {
      --primary: var(--lp-primary, #b91c1c);
      --primary-hover: var(--lp-primary-hover, #b91c1c);
      --font-heading: var(--lp-display-font, system-ui, sans-serif);
      --font-body: var(--lp-font, system-ui, sans-serif);
    }
    .lp-document { font-family: var(--font-body); }
    .lp-document h1, .lp-document h2, .lp-document h3, .lp-document .lp-hero__title {
      font-family: var(--font-heading);
    }
    #root, [data-builder-v3-root] { min-height: 100%; }
    .v3-block-shell { position: relative; cursor: pointer; }
    .v3-block-shell[data-selected="true"] {
      outline: 2px solid #3b82f6;
      outline-offset: -2px;
      box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.15);
    }
    .v3-block-shell:hover:not([data-selected="true"]) {
      outline: 1px dashed rgba(59, 130, 246, 0.5);
      outline-offset: -1px;
    }
    .v3-block-shell--over { outline: 1px solid rgba(59, 130, 246, 0.6); outline-offset: -1px; }
    .v3-block-drop-indicator {
      position: absolute;
      top: -2px;
      left: 0;
      right: 0;
      z-index: 30;
      height: 3px;
      border-radius: 999px;
      background: #3b82f6;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.55);
      pointer-events: none;
    }
    .v3-block-grip {
      position: absolute;
      top: 0.75rem;
      left: 50%;
      z-index: 25;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 1.75rem;
      transform: translateX(-50%);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 0.375rem;
      background: rgba(15, 23, 42, 0.85);
      color: #e2e8f0;
      cursor: grab;
      opacity: 0;
      transition: opacity 0.15s ease, transform 0.15s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
    .v3-block-shell:hover .v3-block-grip,
    .v3-block-shell[data-dragging="true"] .v3-block-grip,
    .v3-block-shell[data-selected="true"] .v3-block-grip {
      opacity: 1;
    }
    .v3-block-grip:active { cursor: grabbing; transform: translateX(-50%) scale(1.05); }
    .v3-block-content { position: relative; width: 100%; pointer-events: auto; }
    .v3-block-toolbar {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 40;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.375rem;
      max-width: min(100% - 1rem, 22rem);
      pointer-events: auto;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .v3-block-toolbar__label {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
    .v3-block-toolbar__name {
      font-size: 0.6875rem;
      font-weight: 600;
      color: #f8fafc;
      line-height: 1.2;
    }
    .v3-block-toolbar__type {
      font-size: 0.5625rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #94a3b8;
    }
    .v3-block-toolbar__actions {
      display: flex;
      align-items: center;
      gap: 0.125rem;
      padding: 0.125rem;
      border-radius: 0.5rem;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.25);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(8px);
    }
    .v3-block-toolbar__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border: none;
      border-radius: 0.375rem;
      background: transparent;
      color: #e2e8f0;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .v3-block-toolbar__btn:hover:not(:disabled) {
      background: rgba(59, 130, 246, 0.2);
      color: #fff;
    }
    .v3-block-toolbar__btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .v3-block-toolbar__btn--danger:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      color: #fecaca;
    }
    .v3-block-toolbar__insert-menu {
      width: 12rem;
      padding: 0.375rem;
      border-radius: 0.5rem;
      background: rgba(15, 23, 42, 0.96);
      border: 1px solid rgba(148, 163, 184, 0.25);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    }
    .v3-block-toolbar__insert-title {
      margin: 0 0 0.25rem;
      padding: 0.25rem 0.375rem;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }
    .v3-block-toolbar__insert-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .v3-block-toolbar__insert-item,
    .v3-block-toolbar__insert-cancel {
      display: block;
      width: 100%;
      padding: 0.375rem 0.5rem;
      border: none;
      border-radius: 0.375rem;
      background: transparent;
      color: #e2e8f0;
      font-size: 0.75rem;
      text-align: left;
      cursor: pointer;
    }
    .v3-block-toolbar__insert-item:hover {
      background: rgba(59, 130, 246, 0.15);
    }
    .v3-block-toolbar__insert-cancel {
      margin-top: 0.25rem;
      color: #94a3b8;
      font-size: 0.6875rem;
    }
    .v3-block-insert-slot {
      position: relative;
      display: flex;
      justify-content: center;
      height: 0;
      margin: 0;
      z-index: 15;
      pointer-events: none;
    }
    .v3-block-insert-slot:hover,
    .v3-block-insert-slot:focus-within {
      height: auto;
      padding: 0.25rem 0;
      pointer-events: auto;
    }
    .v3-block-insert-slot__trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border: 1px dashed rgba(59, 130, 246, 0.35);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.95);
      color: #3b82f6;
      font-size: 0.6875rem;
      font-weight: 500;
      cursor: pointer;
      opacity: 0;
      transform: translateY(-2px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
      pointer-events: auto;
    }
    .v3-block-insert-slot:hover .v3-block-insert-slot__trigger,
    .v3-block-insert-slot:focus-within .v3-block-insert-slot__trigger {
      opacity: 1;
      transform: translateY(0);
    }
    .v3-block-insert-slot__menu {
      position: absolute;
      top: 100%;
      left: 50%;
      z-index: 50;
      width: 11rem;
      margin-top: 0.25rem;
      padding: 0.25rem;
      transform: translateX(-50%);
      border-radius: 0.5rem;
      background: rgba(15, 23, 42, 0.96);
      border: 1px solid rgba(148, 163, 184, 0.25);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
    }
    .v3-block-insert-slot__menu ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .v3-block-insert-slot__item {
      display: block;
      width: 100%;
      padding: 0.375rem 0.5rem;
      border: none;
      border-radius: 0.375rem;
      background: transparent;
      color: #e2e8f0;
      font-size: 0.75rem;
      text-align: left;
      cursor: pointer;
    }
    .v3-block-insert-slot__item:hover {
      background: rgba(59, 130, 246, 0.15);
    }
    .v3-canvas-empty-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      height: 100%;
      margin: 2rem;
      padding: 2rem;
      text-align: center;
      background: #fafafa;
      border: 2px dashed #d4d4d4;
      border-radius: 0.75rem;
      font-family: system-ui, sans-serif;
      color: #525252;
    }
    .v3-canvas-empty-wrap h2 {
      margin: 0 0 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #171717;
    }
    .v3-canvas-empty-wrap p {
      margin: 0;
      max-width: 28rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #737373;
    }
  `;
  doc.head.appendChild(shell);

  await Promise.all(pending);
}

/** Charge les Google Fonts choisies dans le thème global (appelé depuis CanvasDocument). */
export { injectGoogleFonts } from './inject-google-fonts';
