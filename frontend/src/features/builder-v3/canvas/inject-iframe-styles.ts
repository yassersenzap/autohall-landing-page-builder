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
    }
    .v3-block-shell:hover:not([data-selected="true"]) {
      outline: 1px dashed rgba(59, 130, 246, 0.45);
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
