/**
 * export-zip.ts — Client-side ZIP export for the current canvas state.
 *
 * Output:
 *   index.html        pages with CSS class-based markup
 *   css/style.css     all block styles (responsive)
 *   js/app.js         vanilla JS: FAQ, form multistep, lead submission
 *   assets/           downloaded images
 *   config/page.json  metadata
 */
import { strToU8, zipSync } from 'fflate';
import type { BuilderDocument } from '../types/nodes.types';
import { generateExportCss } from './export-css';
import { generateExportJs } from './export-js';
import {
  brandNavbarBlockHtml,
  heroShowroomBlockHtml,
  heroMosaicBlockHtml,
  heroCinematicBlockHtml,
  heroImmersiveFormBlockHtml,
  specsGridBlockHtml,
  modelShowcaseGalleryBlockHtml,
  conversionFormSplitBlockHtml,
  modelsGridBlockHtml,
  specsShowroomBlockHtml,
  contactSectionBlockHtml,
  campaignGammeThermiqueBlockHtml,
  footerBlockHtml,
  fordPromoBlockHtml,
  alternatingShowcaseBlockHtml,
  tacticalFlashCampaignBlockHtml,
  multiStepTestDriveBlockHtml,
} from './generate-export-html';

// ── Types ──────────────────────────────────────────────────────────────────

export type ZipExportContext = {
  apiBaseUrl: string;
  campaignId?: string;
  landingPageId?: string;
  pageVersionId?: string;
  /** Contexte de landing page (miroir de `document.meta`) — pilote le nombre d'étapes du formulaire Hero à l'export. */
  landingPageType?: 'brand' | 'model';
  selectedBrandId?: string | null;
  selectedModelName?: string | null;
};

type AssetStore = {
  files: Record<string, Uint8Array>;
  /** originalUrl → './assets/filename.ext' or original URL if download failed */
  urlToPath: Map<string, string>;
};

// ── Entry point ────────────────────────────────────────────────────────────

export async function exportPageAsZip(
  doc: BuilderDocument,
  rawCtx: ZipExportContext,
): Promise<void> {
  // Le contexte de landing page (marque/modèle actif) vit sur le document — fusionné ici pour
  // que tous les blocs de l'export ZIP (Hero, Specs Showroom...) y aient accès automatiquement.
  const ctx: ZipExportContext = {
    ...rawCtx,
    landingPageType: doc.meta.landingPageType ?? rawCtx.landingPageType,
    selectedBrandId: doc.meta.selectedBrandId ?? rawCtx.selectedBrandId,
    selectedModelName: doc.meta.selectedModelName ?? rawCtx.selectedModelName,
  };
  const title = doc.meta.title || 'Landing Page';
  const slug = (title.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')) || 'landing-page';

  const imageUrls = extractImageUrls(doc);
  const assets = await downloadAssets(imageUrls);

  const html = buildIndexHtml(doc, ctx, assets, title);
  if (typeof window !== 'undefined') {
    (window as any).__LAST_EXPORTED_HTML = html;
  }
  const css = generateExportCss();
  const js = generateExportJs(ctx);
  const cfg = JSON.stringify({
    title,
    exportedAt: new Date().toISOString(),
    campaignId: ctx.campaignId ?? null,
    landingPageId: ctx.landingPageId ?? null,
    apiBaseUrl: ctx.apiBaseUrl,
  }, null, 2);

  const zipFiles: Record<string, Uint8Array> = {
    'index.html': strToU8(html),
    'css/style.css': strToU8(css),
    'js/app.js': strToU8(js),
    'config/page.json': strToU8(cfg),
  };

  for (const [path, bytes] of Object.entries(assets.files)) {
    zipFiles[path] = bytes;
  }

  const zipped = zipSync(zipFiles, { level: 6 });
  const blob = new Blob([zipped], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = slug + '-landing-page.zip';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Image extraction ───────────────────────────────────────────────────────

const IMG_KEYS = new Set([
  'imageSrc', 'backgroundImage', 'videoCover', 'src', 'logoSrc', 'logoUrl', 'vehicleImage',
  'brandLogoUrl', // marque dynamique injectée par preset ou upload manuel (blocs Hero)
  'campaignImage', // ford-promo primary visual
]);

function isRemoteImg(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('blob:')) return true;
  if (url.includes('/api/public/assets/')) return true;
  return /^https?:\/\//i.test(url) && /\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(url);
}

function extractImageUrls(doc: BuilderDocument): string[] {
  const urls = new Set<string>();
  for (const node of Object.values(doc.nodes)) {
    const p = node.props as Record<string, unknown>;
    if (p) scanObject(p, urls);
  }
  return [...urls].filter(isRemoteImg);
}

function scanObject(obj: Record<string, unknown>, out: Set<string>): void {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      if ((IMG_KEYS.has(k) || /image|src/i.test(k)) && isRemoteImg(v)) out.add(v);
    } else if (Array.isArray(v)) {
      for (const item of v) {
        if (item && typeof item === 'object') scanObject(item as Record<string, unknown>, out);
        else if (typeof item === 'string' && isRemoteImg(item)) out.add(item);
      }
    } else if (v && typeof v === 'object') {
      scanObject(v as Record<string, unknown>, out);
    }
  }
}

function urlToFilename(url: string): string {
  try {
    const absoluteUrl = url.startsWith('/') ? 'http://localhost' + url : url;
    const u = new URL(absoluteUrl);
    const assetMatch = u.pathname.match(/\/api\/public\/assets\/([^/]+)/);
    if (assetMatch && assetMatch[1]) {
      return `asset_${assetMatch[1]}`;
    }
    const base = u.pathname.split('/').pop() || 'image';
    const name = base.split('?')[0].replace(/[^a-zA-Z0-9._-]/g, '_');
    return name;
  } catch {
    return 'image_' + Math.random().toString(36).slice(2, 8);
  }
}

async function downloadAssets(urls: string[]): Promise<AssetStore> {
  const files: Record<string, Uint8Array> = {};
  const urlToPath = new Map<string, string>();
  const seenNames = new Set<string>();

  for (const url of urls) {
    try {
      const absoluteUrl = url.startsWith('/') ? window.location.origin + url : url;
      // Asset URLs returned by the backend (assetPublicFileUrl) point at the
      // API origin, which differs from the Studio's own origin in dev (e.g.
      // Vite on :5173 vs Nest on :3000). Forcing `mode: 'same-origin'` here
      // made the browser reject the request before it even left the page —
      // it must use the default 'cors' mode like any other cross-origin fetch.
      const res = await fetch(absoluteUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = await res.arrayBuffer();

      const contentType = res.headers.get('content-type') || '';
      let ext = '.jpg';
      if (contentType.includes('image/png')) ext = '.png';
      else if (contentType.includes('image/webp')) ext = '.webp';
      else if (contentType.includes('image/gif')) ext = '.gif';
      else if (contentType.includes('image/svg')) ext = '.svg';
      else if (contentType.includes('image/jpeg')) ext = '.jpg';

      let filename = urlToFilename(url);
      if (!filename.includes('.')) {
        filename = filename + ext;
      }

      let n = 1;
      while (seenNames.has(filename)) {
        const dot = filename.lastIndexOf('.');
        filename = dot >= 0
          ? filename.slice(0, dot) + '_' + n + filename.slice(dot)
          : filename + '_' + n;
        n++;
      }
      seenNames.add(filename);

      const path = 'images/' + filename;
      files[path] = new Uint8Array(buf);
      urlToPath.set(url, 'images/' + filename);
    } catch (err) {
      // Leave unmapped on failure — mapPropsForZip's sanitizeImageUrl() then
      // decides the right fallback. Silently mapping url -> url here used to
      // mask real download failures and let dead localhost/blob URLs (or the
      // hardcoded campaign default) slip into the exported HTML unnoticed.
      console.warn('[export-zip] Failed to download asset for ZIP export:', url, err);
    }
  }
  return { files, urlToPath };
}

function asset(url: string, store: AssetStore): string {
  return store.urlToPath.get(url) ?? url;
}

// ── URL sanitiser — strips ephemeral / local URLs ──────────────────────────
//
// Blob URLs (blob:http://localhost/...), localhost URLs, relative paths, and
// empty strings are never valid inside a static ZIP opened via file:///.
// This helper replaces them with the given absoluteFallback.

const FORD_PROMO_FALLBACK = 'https://fordpromo.myautohall.ma/images/fordvisuelnv.png';

function sanitizeImageUrl(
  url: string | undefined | null,
  absoluteFallback: string,
): string {
  if (!url || url.trim() === '') return absoluteFallback;
  const u = url.trim();
  // Blob URLs are session-scoped — useless in a saved file
  if (u.startsWith('blob:')) return absoluteFallback;
  // data: URIs are fine (they are self-contained)
  if (u.startsWith('data:')) return u;
  // Localhost / dev-server URLs won't resolve from file:///
  if (/^https?:\/\/localhost(:\d+)?/i.test(u)) {
    if (u.includes('/api/public/assets/')) return u;
    return absoluteFallback;
  }
  if (/^https?:\/\/127\.0\.0\.1/i.test(u)) {
    if (u.includes('/api/public/assets/')) return u;
    return absoluteFallback;
  }
  // Relative paths won't resolve from file:/// without a server
  if (u.startsWith('/api/public/assets/')) return u;
  if (u.startsWith('assets/')) return u;
  if (u.startsWith('images/')) return u;
  if (u.startsWith('/') || u.startsWith('./') || u.startsWith('../')) return absoluteFallback;
  return u;
}

// ── HTML helpers ───────────────────────────────────────────────────────────

function e(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Main HTML builder ──────────────────────────────────────────────────────

function buildIndexHtml(
  doc: BuilderDocument,
  ctx: ZipExportContext,
  store: AssetStore,
  title: string,
): string {
  const root = doc.nodes[doc.rootId];
  if (!root) return '<!DOCTYPE html><html><body></body></html>';

  const body = root.children
    .map(id => doc.nodes[id])
    .filter(Boolean)
    .map(n => blockHtml(n, doc.nodes, store, ctx))
    .join('\n');

  // ── Critical CSS: layout structure that must render before any network ──
  const criticalCss = `
    /* AutoHall LP Critical CSS — inline, renders <100ms */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: 'Outfit', system-ui, sans-serif; }
    .fp-root {
      width: 100%; background: #e8ecf0;
      padding: 40px 16px; font-family: inherit;
    }
    .fp-block {
      display: flex; flex-direction: column;
      max-width: 1320px; margin: 0 auto;
      border-radius: 8px; overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.10);
    }
    @media (min-width: 768px) {
      .fp-block { flex-direction: row; align-items: stretch; }
    }
    .fp-img-col {
      flex: 0 0 auto; width: 100%; min-height: 280px;
      overflow: hidden; background: #021833;
    }
    @media (min-width: 768px) {
      .fp-img-col { width: 60%; min-height: unset; }
    }
    .fp-img-col img {
      width: 100%; height: 100%;
      object-fit: cover; display: block;
    }
    .fp-form-col {
      flex: 1 1 auto; display: flex;
      flex-direction: column;
      padding: 24px 20px 20px; min-width: 0;
    }
    @media (min-width: 768px) {
      .fp-form-col { flex: 0 0 40%; width: 40%; padding: 24px; }
    }
  `.replace(/\s+/g, ' ').trim();

  return [
    '<!DOCTYPE html>',
    '<html lang="fr">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>' + e(title) + '</title>',
    '  <!-- Critical CSS: structure visible instantly, before any network call -->',
    '  <style>' + criticalCss + '</style>',
    '  <!-- Google Fonts: non-blocking via media=print trick -->',
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" />',
    '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" media="print" onload="this.media=\'all\'" />',
    '  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" /></noscript>',
    '  <!-- Main stylesheet -->',
    '  <link rel="stylesheet" href="./css/style.css" />',
    '</head>',
    '<body>',
    body,
    '  <!-- Lead capture script: placed at bottom so it never blocks rendering -->',
    '  <script src="./js/app.js" defer></script>',
    '</body>',
    '</html>',
  ].join('\n');
}

function mapPropsForZip(props: any, store: AssetStore): any {
  if (!props) return props;
  const clone = JSON.parse(JSON.stringify(props));

  const IMAGE_KEY_RE = /^(imageSrc|backgroundImage|videoCover|src|logoSrc|logoUrl|brandLogoUrl|vehicleImage|campaignImage|bannerImage|imageUrl|logoImage|mainImage|thumbImage1|thumbImage2|thumbImage3|thumbImage4)$/;

  const mapValue = (val: any, key?: string): any => {
    if (typeof val === 'string') {
      // 1. Already downloaded → use local asset path
      if (store.urlToPath.has(val)) {
        return store.urlToPath.get(val);
      }
      // 2. Image key that contains an unsafe URL → sanitize
      if (key && IMAGE_KEY_RE.test(key)) {
        const CGT_BANNER_FALLBACK = 'https://www.autohall.ma/assets/campagne/Gamme-Thermique-1200x628.jpg';
        const fallback = key === 'campaignImage'
          ? FORD_PROMO_FALLBACK
          : key === 'bannerImage'
            ? CGT_BANNER_FALLBACK
            : val;
        return sanitizeImageUrl(val, fallback);
      }
      return val;
    } else if (Array.isArray(val)) {
      return val.map(item => mapValue(item));
    } else if (val && typeof val === 'object') {
      const nextObj: any = {};
      for (const [k, v] of Object.entries(val)) {
        nextObj[k] = mapValue(v, k);
      }
      return nextObj;
    }
    return val;
  };

  return mapValue(clone);
}

function blockHtml(
  node: import('../types/nodes.types').BuilderNode,
  _nodes: Record<string, import('../types/nodes.types').BuilderNode>,
  store: AssetStore,
  ctx: ZipExportContext,
): string {
  if (node.visibility?.hidden) return '';
  const p = node.props as any;
  const bt = p?.blockType as string | undefined;
  if (!bt) return '';

  switch (bt) {
    case 'hero': return blockHero(p, store);
    case 'hero-form': return blockHeroForm(p, store, ctx);
    case 'text-block': return blockText(p);
    case 'image-block': return blockImage(p, store);
    case 'image-content': return blockImageContent(p, store);
    case 'stats-banner': return blockStats(p);
    case 'features-grid': return blockFeatures(p);
    case 'gallery-block': return blockGallery(p, store);
    case 'testimonials-block': return blockTestimonials(p);
    case 'faq-block': return blockFAQ(p);
    case 'cta-banner': return blockCTA(p, store);
    case 'form-block': return blockFormSection(p, ctx);

    // Pro Blocks
    case 'brand-navbar': return brandNavbarBlockHtml(mapPropsForZip(p, store));
    case 'footer-block': return footerBlockHtml(mapPropsForZip(p, store));
    case 'hero-showroom':
      return heroShowroomBlockHtml(mapPropsForZip(p, store), ctx, {});
    case 'hero-mosaic':
      return heroMosaicBlockHtml(mapPropsForZip(p, store), ctx, {});
    case 'hero-cinematic':
      return heroCinematicBlockHtml(mapPropsForZip(p, store), ctx, {});
    case 'hero-immersive-form':
      return heroImmersiveFormBlockHtml(mapPropsForZip(p, store), ctx, {});
    case 'hero-split-classic':
      return heroShowroomBlockHtml(mapPropsForZip(p, store), ctx, {}); // fallback
    case 'hero-immersive-overlay':
      return heroCinematicBlockHtml(mapPropsForZip(p, store), ctx, {}); // fallback
    case 'specs-grid': return specsGridBlockHtml(mapPropsForZip(p, store));
    case 'model-showcase-gallery': return modelShowcaseGalleryBlockHtml(mapPropsForZip(p, store));
    case 'conversion-form-split': return conversionFormSplitBlockHtml(mapPropsForZip(p, store), ctx);
    case 'models-grid': return modelsGridBlockHtml(mapPropsForZip(p, store));
    case 'specs-showroom': return specsShowroomBlockHtml(mapPropsForZip(p, store), ctx);
    case 'contact-section': return contactSectionBlockHtml(mapPropsForZip(p, store), ctx);
    case 'campaign-gamme-thermique':
      return campaignGammeThermiqueBlockHtml(mapPropsForZip(p, store), ctx);
    case 'ford-promo':
      return fordPromoBlockHtml(mapPropsForZip(p, store), ctx);
    case 'alternating-showcase':
      return alternatingShowcaseBlockHtml(mapPropsForZip(p, store), {});
    case 'tactical-flash-campaign':
      return tacticalFlashCampaignBlockHtml(mapPropsForZip(p, store), ctx, {});
    case 'multi-step-test-drive':
      return multiStepTestDriveBlockHtml(mapPropsForZip(p, store), ctx, {});
    default:
      return '';
  }
}

// ── 1. Hero ────────────────────────────────────────────────────────────────

function blockHero(p: any, store: AssetStore): string {
  const bg = p.backgroundImage
    ? 'linear-gradient(135deg,' + (p.gradientFrom || 'rgba(0,28,61,0.82)') + ' 0%,' + (p.gradientTo || 'rgba(0,0,0,0.65)') + ' 100%),url(' + e(asset(p.backgroundImage, store)) + ')'
    : 'linear-gradient(135deg,' + (p.gradientFrom || '#002c5f') + ' 0%,' + (p.gradientTo || '#000') + ' 100%)';

  return '<header class="lp-hero" style="background-image:' + e(bg) + ';background-size:cover;background-position:center;grid-template-columns:1fr;">' +
    '<div class="lp-hero__content">' +
    (p.badge ? '<span class="lp-hero__badge">' + e(p.badge) + '</span>' : '') +
    (p.title ? '<h1 class="lp-hero__title">' + e(p.title) + '</h1>' : '') +
    (p.subtitle ? '<p class="lp-hero__subtitle">' + e(p.subtitle) + '</p>' : '') +
    (p.ctaText ? '<div><a href="' + e(p.ctaUrl || '#') + '" class="lp-btn lp-btn--primary">' + e(p.ctaText) + '</a></div>' : '') +
    '</div>' +
    '</header>';
}

// ── 1b. Hero + Form ────────────────────────────────────────────────────────

function blockHeroForm(p: any, store: AssetStore, ctx: ZipExportContext): string {
  const bgImg = p.backgroundImage ? asset(p.backgroundImage, store) : null;
  const bgZoom = p.backgroundZoom ?? 110;
  const bgX = p.backgroundPositionX ?? 50;
  const bgY = p.backgroundPositionY ?? 50;
  const bgBrightness = (p.backgroundBrightness ?? 85) / 100;
  const overlayOpacity = (p.overlayOpacity ?? 60) / 100;
  const gradientFrom = p.gradientFrom ?? 'rgba(0,28,61,0.82)';
  const gradientTo = p.gradientTo ?? 'rgba(0,0,0,0.65)';
  const backgroundFit = p.backgroundFit ?? 'cover';
  const backgroundBlur = p.backgroundBlur ?? 0;

  let bgImgTag = '';
  if (bgImg) {
    let filterStr = 'brightness(' + bgBrightness + ')';
    if (backgroundBlur) {
      filterStr += ' blur(' + backgroundBlur + 'px)';
    }
    let transformStr = '';
    if (bgZoom !== 100) {
      transformStr = 'transform:scale(' + (bgZoom / 100) + ');';
    }
    bgImgTag = '<img src="' + e(bgImg) + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:' + e(backgroundFit) + ';object-position:' + bgX + '% ' + bgY + '%;' + transformStr + 'filter:' + filterStr + ';z-index:0;pointer-events:none;" />';
  }

  const overlayStyle = bgImg
    ? 'background:linear-gradient(135deg,' + gradientFrom + ' 0%,' + gradientTo + ' 100%);opacity:' + overlayOpacity + ';z-index:1;'
    : 'background:linear-gradient(135deg,' + (p.gradientFrom || '#002c5f') + ' 0%,' + (p.gradientTo || '#000') + ' 100%);z-index:1;';

  const bgOverlayTag = '<div style="position:absolute;inset:0;' + overlayStyle + '"></div>';

  const bullets = (p.bullets as string[] | undefined) ?? [];

  const leftContent =
    '<div class="lp-hero__content" style="position:relative;z-index:2;">' +
    (p.badge ? '<span class="lp-hero__badge">' + e(p.badge) + '</span>' : '') +
    (p.title ? '<h1 class="lp-hero__title">' + e(p.title) + '</h1>' : '') +
    (p.subtitle ? '<p class="lp-hero__subtitle">' + e(p.subtitle) + '</p>' : '') +
    (bullets.length
      ? '<ul class="lp-hero__bullets">' + bullets.map(b =>
        '<li class="lp-hero__bullet"><span class="lp-hero__bullet-icon">&#10003;</span>' + e(b) + '</li>'
      ).join('') + '</ul>'
      : '') +
    '</div>';

  const heightMap: Record<string, string> = { S: '60vh', M: '75vh', L: '90vh', full: '100vh' };
  const sectionHeight = heightMap[p.sectionHeight as string] ?? (p.minHeight || '75vh');

  return '<header class="lp-hero" style="position:relative;overflow:hidden;min-height:' + e(sectionHeight) + ';">' +
    bgImgTag +
    bgOverlayTag +
    leftContent +
    '<div style="position:relative;z-index:2;display:flex;justify-content:center;">' + formCard(p, ctx) + '</div>' +
    '</header>';
}

// ── Form card (multi-step) ─────────────────────────────────────────────────

function formCard(p: any, ctx: ZipExportContext): string {
  const steps: any[] = p.steps ?? [];
  const fields: any[] = p.fields ?? [];
  const accent = p.accentColor ?? '#e85d04';
  const submissionMode = p.submissionMode ?? 'DATABASE';
  const webhookUrl = p.webhookUrl ?? '';
  const successMsg = p.successMessage ?? 'Merci ! Notre équipe vous contactera dans les 24h.';
  const errorMsg = p.errorMessage ?? "Erreur lors de l'envoi. Veuillez réessayer.";
  const redirectUrl = p.redirectUrl ?? '';

  // data-attrs transmis à l'app.js pour le mode de soumission et les métadonnées
  const dataAttrs = [
    `data-accent="${e(accent)}"`,
    `data-submission-mode="${e(submissionMode)}"`,
    ctx.campaignId ? `data-campaign-id="${e(ctx.campaignId)}"` : '',
    ctx.landingPageId ? `data-landing-page-id="${e(ctx.landingPageId)}"` : '',
    webhookUrl ? `data-webhook-url="${e(webhookUrl)}"` : '',
    successMsg ? `data-success-message="${e(successMsg)}"` : '',
    errorMsg ? `data-error-message="${e(errorMsg)}"` : '',
    redirectUrl ? `data-redirect-url="${e(redirectUrl)}"` : '',
  ].filter(Boolean).join(' ');

  const cardStyle = [
    'max-width:440px;width:100%;',
    'background:' + e(p.cardBackground ?? '#ffffff') + ';',
    'border-radius:' + (p.cardRadius ?? 20) + 'px;',
    'padding:' + (p.cardSpacing ?? 28) + 'px;',
    p.cardShadow !== false ? 'box-shadow:0 8px 40px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.06);' : '',
  ].join('');

  if (!steps.length) {
    const active = fields.filter((f: any) => f.enabled !== false);
    return `<div class="lp-form-card" data-single-form ${dataAttrs} style="${cardStyle}">` +
      '<h2 class="lp-form__title">' + e(p.formTitle ?? p.title ?? 'Formulaire') + '</h2>' +
      (p.formSubtitle ? '<p class="lp-form__subtitle">' + e(p.formSubtitle) + '</p>' : '') +
      '<div class="lp-form__fields">' + active.map(fieldHtml).join('') + '</div>' +
      '<div class="lp-form__error" data-error style="display:none;color:#ef4444;font-size:13px;margin-top:8px;padding:8px 12px;background:#fff7f7;border-radius:6px;border:1px solid #fecaca;"></div>' +
      '<div class="lp-form__actions"><span></span>' +
      '<button type="button" class="lp-form__btn-next" data-submit style="background:' + e(accent) + ';border-radius:' + (p.buttonRadius ?? 12) + 'px;">' + e(p.submitLabel ?? 'Envoyer') + '</button>' +
      '</div></div>';
  }

  const dotsHtml = steps.length > 1
    ? '<div class="lp-form-stepper" data-stepper style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">' +
    steps.map((_: any, i: number) =>
      '<span data-step-dot style="width:' + (i === 0 ? '12px' : '8px') + ';height:' + (i === 0 ? '12px' : '8px') + ';border-radius:50%;background:' +
      (i === 0 ? e(accent) : '#e5e7eb') + ';display:inline-block;transition:all 200ms ease;' +
      (i === 0 ? 'box-shadow:0 0 0 3px ' + e(accent) + '33;' : '') + '"></span>'
    ).join('') + '</div>'
    : '';

  const stepsHtml = steps.map((step: any, i: number) => {
    const stepFields = ((step.fieldIds ?? []) as string[])
      .map((id: string) => fields.find((f: any) => f.id === id))
      .filter(Boolean);
    const isLast = i === steps.length - 1;
    const nextLabel = step.nextLabel ?? (isLast ? (p.submitLabel ?? 'Envoyer') : 'Suivant &rarr;');
    const backLabel = step.backLabel ?? p.backLabel ?? 'Retour';

    return '<div data-step="' + i + '"' + (i > 0 ? ' hidden style="display:none;"' : '') + '>' +
      (steps.length > 1 ? '<p class="lp-form__step-label" style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;">&#201;tape ' + (i + 1) + ' / ' + steps.length + '</p>' : '') +
      (step.title ? '<h2 class="lp-form__title">' + e(step.title) + '</h2>' : '') +
      (step.description ? '<p class="lp-form__subtitle">' + e(step.description) + '</p>' : '') +
      '<div class="lp-form__fields">' + stepFields.map(fieldHtml).join('') + '</div>' +
      '<div class="lp-form__actions">' +
      (i > 0
        ? '<button type="button" class="lp-form__btn-back" data-back>' + e(backLabel) + '</button>'
        : '<span></span>') +
      '<button type="button" class="lp-form__btn-next" ' + (isLast ? 'data-submit' : 'data-next') +
      ' style="background:' + e(accent) + ';border-radius:' + (p.buttonRadius ?? 12) + 'px;">' + nextLabel + '</button>' +
      '</div></div>';
  }).join('');

  return `<div class="lp-form-card" data-multi-form ${dataAttrs} style="${cardStyle}">` +
    dotsHtml + stepsHtml +
    '<div class="lp-form__error" data-error style="display:none;color:#ef4444;font-size:13px;margin-top:8px;padding:8px 12px;background:#fff7f7;border-radius:6px;border:1px solid #fecaca;"></div>' +
    '</div>';
}

function fieldHtml(f: any): string {
  const type = f.type ?? 'text';
  const isConsent = type === 'checkbox' || f.id === 'consent';
  const req = f.required ? ' required' : '';
  const reqStar = f.required ? '<span class="lp-field__required">*</span>' : '';

  if (isConsent) {
    return '<label class="lp-field__consent" style="width:100%;">' +
      '<input type="checkbox" name="' + e(f.id) + '"' + req + ' />' +
      e(f.label) + reqStar + '</label>';
  }

  const wCls = f.width === '50%' ? 'lp-field lp-field--half' : 'lp-field';

  if (type === 'select') {
    const opts = (f.options ?? []).map((o: string) => '<option value="' + e(o) + '">' + e(o) + '</option>').join('');
    return '<div class="' + wCls + '">' +
      '<label class="lp-field__label">' + e(f.label) + reqStar + '</label>' +
      '<select name="' + e(f.id) + '"' + req + ' class="lp-field__input lp-field__select">' +
      '<option value="">' + e(f.placeholder ?? 'S&#233;lectionner&hellip;') + '</option>' +
      opts + '</select></div>';
  }

  if (type === 'textarea') {
    return '<div class="' + wCls + '">' +
      '<label class="lp-field__label">' + e(f.label) + reqStar + '</label>' +
      '<textarea name="' + e(f.id) + '" placeholder="' + e(f.placeholder ?? '') + '"' + req + ' class="lp-field__input" style="height:80px;padding:10px 12px;resize:vertical;"></textarea>' +
      '</div>';
  }

  const htmlType = type === 'phone' ? 'tel' : type === 'email' ? 'email' : type === 'date' ? 'date' : 'text';
  return '<div class="' + wCls + '">' +
    '<label class="lp-field__label">' + e(f.label) + reqStar + '</label>' +
    '<input type="' + htmlType + '" name="' + e(f.id) + '" placeholder="' + e(f.placeholder ?? '') + '"' + req + ' class="lp-field__input" />' +
    '</div>';
}

// ── Text block ─────────────────────────────────────────────────────────────

function blockText(p: any): string {
  const align = p.alignment ?? 'left';
  const accent = p.accentColor ?? '#e85d04';
  const ptop = p.paddingTop ?? 80;
  const pbot = p.paddingBottom ?? 80;

  return '<section class="lp-section" style="background:' + e(p.background ?? '#fff') + ';padding-top:' + ptop + 'px;padding-bottom:' + pbot + 'px;">' +
    '<div style="max-width:' + (p.maxWidth ?? 780) + 'px;margin:0 auto;text-align:' + e(align) + ';display:flex;flex-direction:column;gap:20px;">' +
    (p.eyebrow ? '<p class="lp-eyebrow" style="color:' + e(accent) + ';">' + e(p.eyebrow) + '</p>' : '') +
    (p.heading ? '<h2 style="color:' + e(p.textColor ?? '#111827') + ';">' + e(p.heading) + '</h2>' : '') +
    (p.subheading ? '<h3 style="color:' + e(p.textColor ?? '#111827') + ';opacity:0.75;">' + e(p.subheading) + '</h3>' : '') +
    (p.body ? '<p style="font-size:' + (p.fontSize ?? 17) + 'px;color:' + e(p.bodyColor ?? '#4b5563') + ';">' + e(p.body) + '</p>' : '') +
    (p.ctaLabel ? '<div><a href="' + e(p.ctaUrl ?? '#') + '" class="lp-btn lp-btn--primary" style="background:' + e(accent) + ';">' + e(p.ctaLabel) + '</a></div>' : '') +
    '</div></section>';
}

// ── Image block ────────────────────────────────────────────────────────────

function blockImage(p: any, store: AssetStore): string {
  const src = asset(p.imageSrc ?? '', store);
  return '<section style="background:' + e(p.background ?? '#f9fafb') + ';padding:' + (p.paddingY ?? 48) + 'px ' + e(p.paddingX ?? '5%') + ';width:100%;box-sizing:border-box;">' +
    '<div style="max-width:' + (p.maxWidth ?? 1200) + 'px;margin:0 auto;border-radius:' + (p.borderRadius ?? 0) + 'px;overflow:hidden;' + (p.shadow ? 'box-shadow:0 4px 6px rgba(0,0,0,.04),0 24px 64px rgba(0,0,0,.12);' : '') + 'aspect-ratio:' + e(p.imageAspectRatio ?? '16/9') + ';position:relative;">' +
    '<img src="' + e(src) + '" alt="' + e(p.imageAlt ?? '') + '" loading="lazy" style="width:100%;height:100%;object-fit:' + e(p.imageFit ?? 'cover') + ';display:block;" />' +
    (p.caption ? '<figcaption style="position:absolute;bottom:0;left:0;right:0;padding:10px 16px;background:linear-gradient(to top,rgba(0,0,0,.55),transparent);color:#fff;font-size:13px;font-weight:600;">' + e(p.caption) + '</figcaption>' : '') +
    '</div></section>';
}

// ── Image + Content ────────────────────────────────────────────────────────

function blockImageContent(p: any, store: AssetStore): string {
  const src = asset(p.imageSrc ?? '', store);
  const accent = p.accentColor ?? '#e85d04';
  const bullets: string[] = p.bullets ?? [];
  const rev = p.imageSide === 'right';

  const imgDiv = '<div class="lp-image-content__image" style="border-radius:' + (p.imageBorderRadius ?? 20) + 'px;' + (p.imageShadow ? 'box-shadow:0 4px 6px rgba(0,0,0,.04),0 24px 64px rgba(0,0,0,.12);' : '') + 'aspect-ratio:' + e(p.imageAspectRatio ?? '4/3') + ';">' +
    '<img src="' + e(src) + '" alt="' + e(p.imageAlt ?? '') + '" loading="lazy" style="width:100%;height:100%;object-fit:' + e(p.imageFit ?? 'cover') + ';display:block;" />' +
    '</div>';

  const bodyDiv = '<div class="lp-image-content__body">' +
    (p.eyebrow ? '<p class="lp-eyebrow" style="color:' + e(accent) + ';">' + e(p.eyebrow) + '</p>' : '') +
    (p.heading ? '<h2 style="color:' + e(p.textColor ?? '#111827') + ';">' + e(p.heading) + '</h2>' : '') +
    (p.body ? '<p>' + e(p.body) + '</p>' : '') +
    (bullets.length ? '<ul class="lp-image-content__bullets">' + bullets.map(b =>
      '<li class="lp-image-content__bullet"><span class="lp-image-content__bullet-check" style="background:' + e(accent) + '18;color:' + e(accent) + ';">&#10003;</span>' + e(b) + '</li>'
    ).join('') + '</ul>' : '') +
    (p.ctaLabel ? '<div><a href="' + e(p.ctaUrl ?? '#') + '" class="lp-btn lp-btn--primary" style="background:' + e(accent) + ';">' + e(p.ctaLabel) + ' &rarr;</a></div>' : '') +
    '</div>';

  return '<section class="lp-image-content" style="background:' + e(p.background ?? '#fff') + ';">' +
    '<div class="lp-image-content__inner" style="flex-direction:' + (rev ? 'row-reverse' : 'row') + ';">' +
    (rev ? bodyDiv + imgDiv : imgDiv + bodyDiv) +
    '</div></section>';
}

// ── Stats ──────────────────────────────────────────────────────────────────

function blockStats(p: any): string {
  const stats: any[] = p.stats ?? [];
  const cols = Math.min(stats.length, 4);
  return '<section class="lp-stats" style="background:' + e(p.background ?? '#0f172a') + ';">' +
    '<div class="lp-stats__grid" style="grid-template-columns:repeat(' + cols + ',1fr);">' +
    stats.map(s =>
      '<div class="lp-stats__item">' +
      '<span class="lp-stats__value">' + e(s.value ?? '') + '</span>' +
      '<span class="lp-stats__label">' + e(s.label ?? '') + '</span>' +
      (s.note ? '<span class="lp-stats__note">' + e(s.note) + '</span>' : '') +
      '</div>'
    ).join('') +
    '</div></section>';
}

// ── Features ───────────────────────────────────────────────────────────────

function blockFeatures(p: any): string {
  const accent = p.accentColor ?? '#e85d04';
  const cols = p.columns ?? 3;
  const items: any[] = p.items ?? [];

  return '<section class="lp-features" style="background:' + e(p.background ?? '#fff') + ';">' +
    '<div class="lp-inner">' +
    (p.title || p.subtitle ? '<div class="lp-section-header">' + (p.title ? '<h2>' + e(p.title) + '</h2>' : '') + (p.subtitle ? '<p>' + e(p.subtitle) + '</p>' : '') + '</div>' : '') +
    '<div class="lp-features__grid" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr));">' +
    items.map(item =>
      '<div class="lp-features__card">' +
      '<div class="lp-features__icon" style="background:' + e(accent) + '14;">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + e(accent) + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' +
      '</div><div>' +
      '<p class="lp-features__card-title">' + e(item.title ?? '') + '</p>' +
      '<p class="lp-features__card-text">' + e(item.text ?? '') + '</p>' +
      '</div></div>'
    ).join('') +
    '</div></div></section>';
}

// ── Gallery ────────────────────────────────────────────────────────────────

function blockGallery(p: any, store: AssetStore): string {
  const cols = p.columns ?? 3;
  const images: any[] = p.images ?? [];

  return '<section class="lp-gallery" style="background:' + e(p.background ?? '#f9fafb') + ';">' +
    '<div class="lp-inner">' +
    (p.title || p.subtitle ? '<div class="lp-section-header">' + (p.title ? '<h2>' + e(p.title) + '</h2>' : '') + (p.subtitle ? '<p>' + e(p.subtitle) + '</p>' : '') + '</div>' : '') +
    '<div class="lp-gallery__grid" style="grid-template-columns:repeat(' + cols + ',1fr);gap:' + (p.gap ?? 16) + 'px;">' +
    images.map(img =>
      '<div class="lp-gallery__item" style="border-radius:' + (p.borderRadius ?? 14) + 'px;">' +
      '<img src="' + e(asset(img.src ?? '', store)) + '" alt="' + e(img.alt ?? '') + '" loading="lazy" />' +
      (img.caption ? '<div class="lp-gallery__caption">' + e(img.caption) + '</div>' : '') +
      '</div>'
    ).join('') +
    '</div></div></section>';
}

// ── Testimonials ───────────────────────────────────────────────────────────

function blockTestimonials(p: any): string {
  const cols = p.columns ?? 2;
  const accent = p.accentColor ?? '#e85d04';
  const items: any[] = p.items ?? [];

  return '<section class="lp-testimonials" style="background:' + e(p.background ?? '#f9fafb') + ';">' +
    '<div class="lp-inner">' +
    (p.title || p.subtitle ? '<div class="lp-section-header">' + (p.title ? '<h2>' + e(p.title) + '</h2>' : '') + (p.subtitle ? '<p>' + e(p.subtitle) + '</p>' : '') + '</div>' : '') +
    '<div class="lp-testimonials__grid" style="grid-template-columns:repeat(' + cols + ',1fr);">' +
    items.map(t => {
      const init = (t.author ?? 'A').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
      const stars = Array.from({ length: 5 }).map((_, i) => {
        const filled = i < (t.rating ?? 5);
        return '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + (filled ? '#f59e0b' : '#e5e7eb') + '" stroke="' + (filled ? '#f59e0b' : '#e5e7eb') + '" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      }).join('');
      return '<div class="lp-testimonial-card">' +
        '<div class="lp-testimonial-card__quote">&ldquo;</div>' +
        '<div class="lp-testimonial-card__stars">' + stars + '</div>' +
        '<p class="lp-testimonial-card__text">&ldquo;' + e(t.text ?? '') + '&rdquo;</p>' +
        '<div class="lp-testimonial-card__author">' +
        '<div class="lp-testimonial-card__avatar" style="background:linear-gradient(135deg,' + e(accent) + ',#f97316);">' + e(init) + '</div>' +
        '<div>' +
        '<p class="lp-testimonial-card__name">' + e(t.author ?? '') + '</p>' +
        (t.vehicleModel ? '<p class="lp-testimonial-card__model" style="color:' + e(accent) + ';">' + e(t.vehicleModel) + '</p>' : '') +
        (t.role ? '<p class="lp-testimonial-card__role">' + e(t.role) + '</p>' : '') +
        '</div></div></div>';
    }).join('') +
    '</div></div></section>';
}

// ── FAQ ────────────────────────────────────────────────────────────────────

function blockFAQ(p: any): string {
  const items: any[] = p.items ?? [];
  return '<section class="lp-faq" style="background:' + e(p.background ?? '#fff') + ';">' +
    '<div class="lp-inner">' +
    (p.title || p.subtitle ? '<div class="lp-section-header">' + (p.title ? '<h2>' + e(p.title) + '</h2>' : '') + (p.subtitle ? '<p>' + e(p.subtitle) + '</p>' : '') + '</div>' : '') +
    '<ul class="lp-faq__list">' +
    items.map((item, i) =>
      '<li class="lp-faq__item"' + (i === 0 ? ' data-open' : '') + ' data-faq-item>' +
      '<button type="button" class="lp-faq__toggle" data-faq-toggle>' +
      '<span class="lp-faq__question">' + e(item.question ?? '') + '</span>' +
      '<span class="lp-faq__icon" data-faq-icon>' + (i === 0 ? '&minus;' : '+') + '</span>' +
      '</button>' +
      '<div class="lp-faq__answer" data-faq-answer' + (i === 0 ? '' : ' style="display:none;"') + '>' +
      '<p>' + e(item.answer ?? '') + '</p>' +
      '</div></li>'
    ).join('') +
    '</ul></div></section>';
}

// ── CTA Banner ─────────────────────────────────────────────────────────────

function blockCTA(p: any, store: AssetStore): string {
  const accent = p.accentColor ?? '#e85d04';
  const bgImg = p.backgroundImage ? asset(p.backgroundImage, store) : null;
  const bgStyle = bgImg
    ? 'background-image:linear-gradient(135deg,rgba(194,65,12,0.92) 0%,rgba(232,93,4,0.88) 100%),url(' + e(bgImg) + ');background-size:cover;background-position:center;'
    : 'background:' + e(p.background ?? 'linear-gradient(135deg,#c2410c 0%,' + accent + ' 50%,#f97316 100%)') + ';';
  const badges: string[] = p.trustBadges ?? [];

  return '<section class="lp-cta" style="' + bgStyle + '">' +
    '<div class="lp-cta__inner">' +
    (p.title ? '<h2 class="lp-cta__title">' + e(p.title) + '</h2>' : '') +
    (p.subtitle ? '<p class="lp-cta__subtitle">' + e(p.subtitle) + '</p>' : '') +
    (p.buttonLabel ? '<a href="' + e(p.buttonUrl ?? '#') + '" class="lp-cta__btn" style="color:' + e(accent) + ';">' + e(p.buttonLabel) + '</a>' : '') +
    (badges.length ? '<div class="lp-cta__badges">' + badges.map(b => '<span class="lp-cta__badge"><span class="lp-cta__badge-check">&#10003;</span>' + e(b) + '</span>').join('') + '</div>' : '') +
    '</div></section>';
}

// ── Standalone Form section ────────────────────────────────────────────────

function blockFormSection(p: any, ctx: ZipExportContext): string {
  const title = p.formTitle || p.heading || '';
  const subtitle = p.formSubtitle || p.headingSubtitle || '';
  return '<section class="lp-section" style="background:' + e(p.background ?? '#f9fafb') + ';padding:60px 5%;box-sizing:border-box;">' +
    '<div class="lp-inner" style="max-width:520px;margin:0 auto;">' +
    (title ? '<h2 style="text-align:center;margin-bottom:' + (subtitle ? '10px' : '32px') + ';">' + e(title) + '</h2>' : '') +
    (subtitle ? '<p style="text-align:center;color:#6b7280;margin-bottom:32px;">' + e(subtitle) + '</p>' : '') +
    formCard(p, ctx) +
    '</div></section>';
}
