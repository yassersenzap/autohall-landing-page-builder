/**
 * Client-side HTML export — renders V4 document (node-tree + ProBlocks) to a
 * standalone, production-ready HTML file. Forms include inline JS for lead
 * submission to the backend API.
 */
import type { BuilderDocument, BuilderNode, NodeLayout, NodeStyle } from '../types/nodes.types';
import {
  CGT_COPY,
  CGT_DEFAULT_BANNER,
  resolveCgtProps,
  DEFAULT_CHERY_MODELS,
} from '../canvas/blocks/campaign-gamme-thermique.shared';
import { DEFAULT_FORD_FIELDS, AUTOHALL_OFFICIAL_CITIES, DEFAULT_CONTACT_FIELDS, NEUTRAL_VEHICLE_PLACEHOLDER, AUTOHALL_RGPD_CLAUSE } from './pro-blocks';
import { getAutoHallBrand } from '@/config/brands';

export type ExportContext = {
  /** Backend API base URL, baked in at export time */
  apiBaseUrl?: string;
  campaignId?: string;
  landingPageId?: string;
  pageVersionId?: string;
  /** Contexte de landing page (miroir de `document.meta`) — pilote le nombre d'étapes du formulaire Hero à l'export. */
  landingPageType?: 'brand' | 'model';
  selectedBrandId?: string | null;
  selectedModelName?: string | null;
};

// ── CSS helpers ───────────────────────────────────────────────────────────────

function px(v: number | string | undefined): string {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') return v;
  return `${v}px`;
}

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const mdMatch = trimmed.match(/^\[.*\]\((.*)\)$/);
  if (mdMatch) {
    return mdMatch[1].trim();
  }
  return trimmed;
}

function layoutToStyle(layout: NodeLayout): string {
  const p: string[] = [];
  if (layout.display === 'flex') {
    p.push('display:flex');
    if (layout.direction === 'row') p.push('flex-direction:row');
    else if (layout.direction === 'column') p.push('flex-direction:column');
    if (layout.align) p.push(`align-items:${layout.align === 'start' ? 'flex-start' : layout.align === 'end' ? 'flex-end' : layout.align}`);
    if (layout.justify) p.push(`justify-content:${layout.justify === 'start' ? 'flex-start' : layout.justify === 'end' ? 'flex-end' : layout.justify}`);
    if (layout.gap !== undefined) p.push(`gap:${px(layout.gap)}`);
    if (layout.flexWrap === 'wrap') p.push('flex-wrap:wrap');
  } else if (layout.display === 'grid') {
    p.push('display:grid');
    if (layout.columns) p.push(`grid-template-columns:${layout.columns}`);
    if (layout.gap !== undefined) p.push(`gap:${px(layout.gap)}`);
  }
  if (layout.width) p.push(`width:${px(layout.width)}`);
  if (layout.height) p.push(`height:${px(layout.height)}`);
  if (layout.maxWidth) p.push(`max-width:${px(layout.maxWidth)}`);
  if (layout.minWidth) p.push(`min-width:${px(layout.minWidth)}`);
  if (layout.minHeight) p.push(`min-height:${px(layout.minHeight)}`);
  if (layout.padding !== undefined) p.push(`padding:${px(layout.padding)}`);
  return p.join(';');
}

function styleToStyle(style: NodeStyle): string {
  const p: string[] = [];
  if (style.background) p.push(`background:${style.background}`);
  if (style.color) p.push(`color:${style.color}`);
  if (style.fontSize !== undefined) p.push(`font-size:${px(style.fontSize)}`);
  if (style.fontWeight !== undefined) p.push(`font-weight:${style.fontWeight}`);
  if (style.lineHeight !== undefined) p.push(`line-height:${style.lineHeight}`);
  if (style.letterSpacing !== undefined) p.push(`letter-spacing:${style.letterSpacing}`);
  if (style.borderRadius !== undefined) p.push(`border-radius:${px(style.borderRadius)}`);
  if (style.borderWidth !== undefined) p.push(`border:${px(style.borderWidth)} solid ${style.borderColor ?? '#e5e7eb'}`);
  if (style.opacity !== undefined && style.opacity !== 100) p.push(`opacity:${style.opacity / 100}`);
  if (style.shadow) p.push('box-shadow:0 4px 16px rgba(0,0,0,.12)');
  if (style.objectFit) p.push(`object-fit:${style.objectFit}`);
  return p.join(';');
}

function merge(...parts: string[]): string { return parts.filter(Boolean).join(';'); }

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Wordmark de secours (SVG inline, aucune requête réseau) utilisé via `onerror` tant que le
 * fichier logo réel de la marque n'a pas été déposé dans `public/assets/logos` — jamais d'URL
 * de CDN externe devinée. Miroir de `brandWordmarkPlaceholder` (canevas) pour l'export statique.
 */
function brandWordmarkPlaceholderHtml(name: string, color: string): string {
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#111111';
  const label = (name || 'Marque').replace(/[<>&]/g, '');
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="48" viewBox="0 0 220 48">` +
        `<text x="0" y="33" font-family="Arial, sans-serif" font-size="26" font-weight="800" fill="${safeColor}">${label}</text>` +
        `</svg>`,
    )
  );
}

function getActiveTheme(document: BuilderDocument) {
  const BRAND_THEME_PRESETS: Record<string, {
    brand: string;
    primaryColor: string;
    secondaryColor: string;
    buttonRadius: string;
    fontFamily: string;
    luxMode?: boolean;
  }> = {
    ford: {
      brand: 'Ford',
      primaryColor: '#002C6C',
      secondaryColor: '#1b7ac8',
      buttonRadius: '9999px',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    },
    opel: {
      brand: 'Opel',
      primaryColor: '#E1F000',
      secondaryColor: '#101010',
      buttonRadius: '0px',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    },
    chery: {
      brand: 'Chery',
      primaryColor: '#8C1D40',
      secondaryColor: '#6b122e',
      buttonRadius: '12px',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    },
    maserati: {
      brand: 'Maserati',
      primaryColor: '#101010',
      secondaryColor: '#52525b',
      buttonRadius: '4px',
      fontFamily: "'Georgia', 'Playfair Display', serif",
      luxMode: true,
    },
    byd: {
      brand: 'BYD',
      primaryColor: '#00529b',
      secondaryColor: '#0072c6',
      buttonRadius: '8px',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    },
    custom: {
      brand: 'Custom',
      primaryColor: '#288fe3',
      secondaryColor: '#1b7ac8',
      buttonRadius: '8px',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    },
  };

  const brand = document.meta?.brandTheme || 'custom';
  const preset = BRAND_THEME_PRESETS[brand] || BRAND_THEME_PRESETS.custom;

  return {
    brand,
    primaryColor: document.meta?.customPrimaryColor || preset.primaryColor,
    secondaryColor: document.meta?.customSecondaryColor || preset.secondaryColor,
    buttonRadius: document.meta?.customButtonRadius || preset.buttonRadius,
    fontFamily: document.meta?.customFontFamily || preset.fontFamily,
    luxMode: preset.luxMode || false,
  };
}

// ── ProBlock section renderers (HTML templates) ───────────────────────────────



export function carouselBlockHtml(props: any): string {
  const items = props.items ?? [];
  const blockId = props.id || 'carousel';

  const slidesHtml = items.map((item: any, idx: number) => {
    const activeClass = idx === 0 ? ' active' : '';
    const categoryHtml = item.category ? `<p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #d1d5db; margin-bottom: 8px; font-weight: 500; font-family: inherit;">${esc(item.category)}</p>` : '';
    const buttonLabel = item.button || 'Découvrir';
    
    return `
      <li class="carousel-slide-${blockId}${activeClass}">
        <img src="${esc(item.src)}" alt="${esc(item.title)}" style="transition: transform 0.1s ease;" />
        <div class="content">
          ${categoryHtml}
          <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 16px; font-family: inherit;">${esc(item.title)}</h2>
          <div style="display: flex; justify-content: center;">
            <button style="border: none; padding: 10px 20px; background: #ffffff; color: #000000; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: inherit;">
              ${esc(buttonLabel)}
            </button>
          </div>
        </div>
      </li>
    `;
  }).join('');

  return `
<style>
  .carousel-wrapper-${blockId} {
    width: 100%;
    padding: 80px 5%;
    background: #090d16;
    font-family: var(--brand-font, 'Outfit', 'Inter', sans-serif);
    color: #ffffff;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }
  .carousel-container-${blockId} {
    position: relative;
    width: 280px;
    height: 280px;
    margin: 0 auto;
    overflow: visible;
  }
  @media (min-width: 480px) {
    .carousel-container-${blockId} {
      width: 320px;
      height: 320px;
    }
  }
  @media (min-width: 768px) {
    .carousel-container-${blockId} {
      width: 400px;
      height: 400px;
    }
  }
  .carousel-track-${blockId} {
    position: absolute;
    display: flex;
    margin: 0 -16px;
    padding: 0;
    list-style: none;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .carousel-slide-${blockId} {
    width: 280px;
    height: 280px;
    margin: 0 16px;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: #1e293b;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    text-align: center;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: bottom;
    flex-shrink: 0;
  }
  @media (min-width: 480px) {
    .carousel-slide-${blockId} {
      width: 320px;
      height: 320px;
    }
  }
  @media (min-width: 768px) {
    .carousel-slide-${blockId} {
      width: 400px;
      height: 400px;
    }
  }
  .carousel-slide-${blockId} img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5;
    transition: opacity 0.5s ease;
  }
  .carousel-slide-${blockId}.active img {
    opacity: 1;
  }
  .carousel-slide-${blockId} .content {
    position: relative;
    padding: 24px;
    z-index: 10;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.5s ease;
  }
  .carousel-slide-${blockId}.active .content {
    opacity: 1;
    visibility: visible;
  }
  .carousel-control-btn-${blockId} {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 50%;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0 8px;
  }
  .carousel-control-btn-${blockId}:hover {
    background: rgba(255,255,255,0.25);
    transform: translateY(-2px);
  }
</style>
<section class="carousel-wrapper-${blockId}">
  <h2 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:800;margin-bottom:32px;letter-spacing:-0.02em;color:#ffffff;text-align:center;font-family:inherit;margin-top:0;">
    Découvrez notre Sélection
  </h2>
  
  <div class="carousel-container-${blockId}" id="carousel-container-${blockId}">
    <ul class="carousel-track-${blockId}" id="carousel-track-${blockId}">
      ${slidesHtml}
    </ul>
    
    <div style="position:absolute;display:flex;justify-content:center;width:100%;top:calc(100% + 16px);left:0;right:0;z-index:20;">
      <button class="carousel-control-btn-${blockId}" id="carousel-prev-${blockId}" title="Précédent">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(180deg);"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
      <button class="carousel-control-btn-${blockId}" id="carousel-next-${blockId}" title="Suivant">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</section>
<script>
(function() {
  var container = document.getElementById('carousel-container-${blockId}');
  if (!container) return;
  var track = document.getElementById('carousel-track-${blockId}');
  var prevBtn = document.getElementById('carousel-prev-${blockId}');
  var nextBtn = document.getElementById('carousel-next-${blockId}');
  var slides = Array.from(track.children);
  var currentIdx = 0;
  
  function update() {
    var slideWidth = slides[0].getBoundingClientRect().width + 32; // width + gap
    track.style.transform = 'translateX(' + (-currentIdx * slideWidth) + 'px)';
    slides.forEach(function(slide, idx) {
      if (idx === currentIdx) {
        slide.classList.add('active');
        slide.style.transform = 'scale(1) rotateX(0deg)';
      } else {
        slide.classList.remove('active');
        slide.style.transform = 'scale(0.95) rotateX(8deg)';
      }
    });
  }
  
  prevBtn.addEventListener('click', function() {
    currentIdx = (currentIdx - 1 + slides.length) % slides.length;
    update();
  });
  
  nextBtn.addEventListener('click', function() {
    currentIdx = (currentIdx + 1) % slides.length;
    update();
  });
  
  // Slide click behavior
  slides.forEach(function(slide, idx) {
    slide.addEventListener('click', function() {
      if (currentIdx !== idx) {
        currentIdx = idx;
        update();
      }
    });
  });
  
  // Parallax tilt effect on mousemove for active slide
  slides.forEach(function(slide) {
    slide.addEventListener('mousemove', function(e) {
      if (!slide.classList.contains('active')) return;
      var r = slide.getBoundingClientRect();
      var x = e.clientX - (r.left + r.width / 2);
      var y = e.clientY - (r.top + r.height / 2);
      var img = slide.querySelector('img');
      if (img) {
        img.style.transform = 'translate3d(' + (x / 30) + 'px, ' + (y / 30) + 'px, 0) scale(1.1)';
      }
    });
    slide.addEventListener('mouseleave', function() {
      var img = slide.querySelector('img');
      if (img) {
        img.style.transform = 'none';
      }
    });
  });
  
  window.addEventListener('resize', update);
  setTimeout(update, 100);
})();
</script>
`;
}


/** Icônes vectorielles prêtes à l'emploi (paths lucide-react) — mêmes clés que FinitionIconPresetKey. */
const FINITION_ICON_PRESET_SVG: Record<string, string> = {
  Zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  ShipWheel: '<circle cx="12" cy="12" r="8"/><path d="M12 2v7.5"/><path d="m19 5-5.23 5.23"/><path d="M22 12h-7.5"/><path d="m19 19-5.23-5.23"/><path d="M12 14.5V22"/><path d="M10.23 13.77 5 19"/><path d="M9.5 12H2"/><path d="M10.23 10.23 5 5"/><circle cx="12" cy="12" r="2.5"/>',
  Shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  Monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  Armchair: '<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>',
  Leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10z"/><path d="M9 21c0-5 2-8 7-10"/>',
  Gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  Calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  Cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 15h3"/><path d="M1 9h3"/><path d="M1 15h3"/>',
  Battery: '<path d="M 22 14 L 22 10"/><rect x="2" y="6" width="16" height="12" rx="2"/>',
  Thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
};

export function specsShowroomBlockHtml(props: any, ctx: ExportContext = {}): string {
  const activeBrandExport = getAutoHallBrand(ctx.selectedBrandId);
  const primaryColor = activeBrandExport?.primaryColor || props.colorPrimary || '#002C6C';
  
  // Tant que l'asset réel n'est pas déposé dans /public/assets/logos, l'attribut onerror bascule
  // sur un wordmark généré localement (nom de la marque) plutôt que de deviner une URL de CDN
  // externe non vérifiée — évite un logo cassé ou invisible dans l'export statique.
  const rawLogo = activeBrandExport?.logo || props.logoUrl || '';
  const logoUrl = rawLogo;
  const logoFallback = activeBrandExport ? brandWordmarkPlaceholderHtml(activeBrandExport.name, primaryColor) : '';

  const title = ctx.landingPageType === 'model' && ctx.selectedModelName ? ctx.selectedModelName : (props.title || '[Marque] [Modèle]');
  const description = props.description ?? '';
  const priceAppel = props.priceAppel ?? '[Prix] DH*';
  const ctaLabel = props.ctaLabel ?? 'Me faire rappeler';
  const finitions = props.finitions ?? [];
  const keyFeatures: any[] = Array.isArray(props.keyFeatures) ? props.keyFeatures : [];
  const legalMentions: string[] = Array.isArray(props.legalMentions) ? props.legalMentions : [];
  const blockId = props.id || 'specs-showroom';
  const showPriceCard = props.showPriceCard !== false;

  const keyFeaturesHtml = keyFeatures.length > 0 ? `
    <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 24px;">
      ${keyFeatures.map((feature: any) => {
        const presetSvgBody = FINITION_ICON_PRESET_SVG[feature.iconPreset ?? ''];
        const iconHtml = feature.icon
          ? `<img src="${esc(feature.icon)}" alt="" style="width: 14px; height: 14px; object-fit: contain;" />`
          : presetSvgBody
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">${presetSvgBody}</svg>`
            : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="20 6 9 17 4 12"/></svg>`;
        return `<li style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#4b5563;background:transparent;padding:0;">
          <span style="color:${primaryColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${iconHtml}</span>
          ${esc(feature.text ?? '')}
        </li>`;
      }).join('')}
    </ul>
  ` : '';

  const tabsHtml = finitions.map((fin: any, idx: number) => {
    const activeClass = idx === 0 ? 'active' : '';
    const borderStyle = idx === 0 ? `border-bottom: 3px solid ${primaryColor}; color: ${primaryColor};` : 'border-bottom: 3px solid transparent; color: #94a3b8;';
    return `<button type="button" class="finition-tab-${blockId} ${activeClass}" data-tab-idx="${idx}" style="padding: 10px 0; background: transparent; border: none; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 200ms ease; font-family: inherit; ${borderStyle}">${esc(fin.name)}</button>`;
  }).join('');

  const contentsHtml = finitions.map((fin: any, idx: number) => {
    const displayStyle = idx === 0 ? 'display: flex;' : 'display: none;';
    const optionsHtml = (fin.options ?? []).map((opt: any) => {
      const label = typeof opt === 'string' ? opt : (opt.label ?? '');
      const customImage = typeof opt === 'string' ? '' : (opt.icon ?? '');
      const iconPreset = typeof opt === 'string' ? '' : (opt.iconPreset ?? '');
      const presetSvgBody = FINITION_ICON_PRESET_SVG[iconPreset];
      const iconHtml = customImage
        ? `<img src="${esc(customImage)}" alt="" style="width: 12px; height: 12px; object-fit: contain;" />`
        : presetSvgBody
          ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">${presetSvgBody}</svg>`
          : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="20 6 9 17 4 12"/></svg>`;
      return `<li style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1f2937; font-weight: 600;">
        <span style="width: 18px; height: 18px; border-radius: 50%; background: ${primaryColor}14; display: flex; align-items: center; justify-content: center; color: ${primaryColor}; flex-shrink: 0; overflow: hidden;">
          ${iconHtml}
        </span>
        ${esc(label)}
      </li>`;
    }).join('');

    const pdfHtml = fin.pdfUrl ? `<div style="margin-top: 4px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      <a href="${esc(fin.pdfUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: ${primaryColor}; text-decoration: none;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Télécharger la fiche technique
      </a>
    </div>` : '';

    return `<div class="finition-content-${blockId}" data-content-idx="${idx}" style="${displayStyle} flex-direction: column; gap: 16px; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; box-sizing: border-box;">
      <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0;">${esc(fin.desc)}</p>
      <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
        ${optionsHtml}
      </ul>
      ${pdfHtml}
    </div>`;
  }).join('');

  return `
<style>
  .showroom-grid-${blockId} {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: start;
  }
  @media (min-width: 1024px) {
    .showroom-grid-${blockId} {
      grid-template-columns: ${showPriceCard ? '7fr 5fr' : '1fr'};
    }
  }
</style>
<section style="width: 100%; background: #ffffff; font-family: var(--brand-font, 'Outfit', sans-serif); padding: 80px 5%; box-sizing: border-box;">
  <div class="showroom-grid-${blockId}" style="max-width: 1200px; margin: 0 auto;">
    
    <!-- Left Column -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 16px;">
        ${logoUrl ? `<img src="${esc(logoUrl)}" alt="Logo" style="height: 48px; max-width: 160px; object-fit: contain; align-self: flex-start; margin-bottom: 8px;" ${logoFallback ? `onerror="this.onerror=null;this.src='${logoFallback}'"` : `onerror="this.onerror=null;this.style.display='none'"`} />` : ''}
        <h2 style="font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; color: #18181b; margin: 0; letter-spacing: -0.02em;">${esc(title)}</h2>
      </div>
      <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0;">${esc(description)}</p>
      ${keyFeaturesHtml}

      <!-- Finitions tabs & content -->
      <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
        <div style="display: flex; border-bottom: 2px solid #f1f5f9; gap: 24px; margin-bottom: 8px;">
          ${tabsHtml}
        </div>
        ${contentsHtml}
      </div>
    </div>

    ${showPriceCard ? `
    <!-- Right Column -->
    <div style="display: flex; align-items: center; justify-content: center;">
      <div style="width: 100%; max-width: 400px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 36px 32px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01); box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">À partir de</span>
          <span style="font-size: clamp(2rem, 3vw, 2.5rem); font-weight: 900; color: ${primaryColor}; letter-spacing: -0.02em; line-height: 1;">${esc(priceAppel)}</span>
        </div>
        <div style="font-size: 11px; color: #94a3b8; line-height: 1.4; display: flex; flex-direction: column; gap: 2px;">
          ${legalMentions.map((m) => `<span>${esc(m)}</span>`).join('')}
        </div>
        <button type="button" class="showroom-cta-btn-${blockId}" style="height: 48px; background: ${primaryColor}; color: #ffffff; border: none; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 200ms ease; box-shadow: 0 4px 14px ${primaryColor}33; font-family: inherit; width: 100%; box-sizing: border-box;">
          ${esc(ctaLabel)}
        </button>
      </div>
    </div>
    ` : ''}

  </div>
</section>

<script>
(function() {
  var wrapper = document.currentScript ? document.currentScript.previousElementSibling : null;
  if (!wrapper) return;
  var tabs = wrapper.querySelectorAll('.finition-tab-${blockId}');
  var contents = wrapper.querySelectorAll('.finition-content-${blockId}');
  
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var targetIdx = parseInt(tab.getAttribute('data-tab-idx'));
      tabs.forEach(function(t, idx) {
        if (idx === targetIdx) {
          t.style.borderBottom = '3px solid ${primaryColor}';
          t.style.color = '${primaryColor}';
          t.classList.add('active');
        } else {
          t.style.borderBottom = '3px solid transparent';
          t.style.color = '#94a3b8';
          t.classList.remove('active');
        }
      });
      contents.forEach(function(c, idx) {
        c.style.display = idx === targetIdx ? 'flex' : 'none';
      });
    });
  });

  // CTA — ancre vers la section Hero + Formulaire d'essai routier
  var cta = wrapper.querySelector('.showroom-cta-btn-${blockId}');
  if (cta) {
    cta.addEventListener('click', function() {
      var target = document.querySelector('#form_test_drive_modele') || document.querySelector('#form_test_drive') || document.querySelector('#hero-lead-form');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
})();
</script>
`;
}

export function contactSectionBlockHtml(props: any, ctx: ExportContext): string {
  const title = props.title ?? 'Nous Contacter';
  const subtitle = props.subtitle ?? 'Nous sommes là pour répondre à vos questions.';
  const imageUrl = props.imageUrl ?? '';
  const submitLabel = props.submitLabel ?? 'Soumettre';
  const villesList = props.villesList ?? [];
  const accent = props.accentColor ?? '#002C6C';
  const bg = props.bgColor ?? '#ffffff';
  const blockId = props.id || 'contact';
  const localApiUrl = ctx.apiBaseUrl ?? 'http://localhost:3000';

  const citiesOptions = villesList.map((v: string) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');

  const fields: Array<{ id: string; label: string; enabled: boolean; required: boolean; placeholder: string }> =
    Array.isArray(props.fields) ? props.fields : DEFAULT_CONTACT_FIELDS;
  const getField = (id: string) => fields.find(f => f.id === id) ?? DEFAULT_CONTACT_FIELDS.find(f => f.id === id)!;
  const fNom = getField('nom');
  const fEmail = getField('email');
  const fTelephone = getField('telephone');
  const fVille = getField('ville');
  const fMessage = getField('message');
  const req = (f: { required: boolean }) => f.required ? 'required' : '';
  const star = (f: { required: boolean }) => f.required ? ' <span style="color:#ef4444;">*</span>' : '';

  return `
<style>
  .footer-link-custom-\${blockId} {
    font-size: 13px;
    color: #f8fafc;
    opacity: 0.9;
    text-decoration: none;
    transition: all 200ms ease;
  }
  .footer-link-custom-\${blockId}:hover {
    color: #38bdf8;
    opacity: 1;
  }
  @media (min-width: 1024px) {
    .grid-layout-${blockId} {
      grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    }
    .form-column-${blockId} {
      grid-column: span 7 / span 7 !important;
    }
    .image-column-${blockId} {
      grid-column: span 5 / span 5 !important;
    }
  }
  
  /* Preferences radios custom styling */
  .contact-method-badges-${blockId} {
    display: flex;
    gap: 12px;
    margin-top: 4px;
  }
  .contact-method-badge-${blockId} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    background-color: #f8fafc;
    color: #64748b;
    transition: all 200ms ease;
  }
  .contact-method-badge-${blockId}:hover {
    background-color: #f1f5f9;
  }
  .contact-method-radio-${blockId} {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
  }
  .contact-method-radio-${blockId}:checked + .contact-method-badge-${blockId} {
    background-color: ${esc(accent)} !important;
    color: #ffffff !important;
    border-color: ${esc(accent)} !important;
  }
</style>
<section class="contact-form-home-section" style="width: 100%; background: ${esc(bg)}; font-family: var(--brand-font, 'Outfit', sans-serif); padding: 80px 5%; box-sizing: border-box; color: #0f172a;">
  <div class="grid-layout-${blockId}" style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center;">
    
    <!-- Left Column: Form -->
    <div class="form-column-${blockId}" style="display: flex; flex-direction: column; gap: 24px; justify-content: center; width: 100%;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <h2 style="font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 900; color: #002C6C; margin: 0; letter-spacing: -0.02em;">${esc(title)}</h2>
        <p style="font-size: 15px; color: #64748b; margin: 0;">${esc(subtitle)}</p>
      </div>

      <div class="contact-form-card-${blockId}" data-accent="${esc(accent)}" data-local-api="${esc(localApiUrl)}" data-campaign="${esc(ctx.campaignId ?? '')}" data-lp="${esc(ctx.landingPageId ?? '')}">
        <form class="contact-section-form-${blockId}" style="display: flex; flex-direction: column; gap: 16px; margin: 0;">
          ${(fNom.enabled || fEmail.enabled) ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${fNom.enabled ? `
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${esc(fNom.label)}${star(fNom)}</label>
              <input type="text" name="name" ${req(fNom)} placeholder="${esc(fNom.placeholder)}" style="height: 44px; padding: 0 12px; border: 1px solid #e4e4e7; border-radius: 8px; outline: none; font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box; background: #ffffff;" />
            </div>` : ''}
            ${fEmail.enabled ? `
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${esc(fEmail.label)}${star(fEmail)}</label>
              <input type="email" name="email" ${req(fEmail)} placeholder="${esc(fEmail.placeholder)}" style="height: 44px; padding: 0 12px; border: 1px solid #e4e4e7; border-radius: 8px; outline: none; font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box; background: #ffffff;" />
            </div>` : ''}
          </div>` : ''}

          ${(fTelephone.enabled || fVille.enabled) ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${fTelephone.enabled ? `
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${esc(fTelephone.label)}${star(fTelephone)}</label>
              <input type="tel" name="phone" ${req(fTelephone)} placeholder="${esc(fTelephone.placeholder)}" style="height: 44px; padding: 0 12px; border: 1px solid #e4e4e7; border-radius: 8px; outline: none; font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box; background: #ffffff;" />
            </div>` : ''}
            ${fVille.enabled ? `
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${esc(fVille.label)}${star(fVille)}</label>
              <select name="city" ${req(fVille)} style="height: 44px; padding: 0 12px; border: 1px solid #e4e4e7; border-radius: 8px; outline: none; font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box; background: #ffffff; cursor: pointer;">
                ${citiesOptions}
              </select>
            </div>` : ''}
          </div>` : ''}

          ${fMessage.enabled ? `
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${esc(fMessage.label)}${star(fMessage)}</label>
            <textarea name="message" ${req(fMessage)} placeholder="${esc(fMessage.placeholder)}" style="height: 90px; padding: 10px 12px; border: 1px solid #e4e4e7; border-radius: 8px; outline: none; font-size: 14px; font-family: inherit; resize: vertical; width: 100%; box-sizing: border-box; background: #ffffff;"></textarea>
          </div>` : ''}

          <!-- Contact preference -->
          <div style="display: flex; flex-direction: column; gap: 6px; margin: 4px 0;">
            <span style="font-size: 12px; font-weight: 700; color: #4b5563;">Comment souhaitez-vous être contacté ?</span>
            <div class="contact-method-badges-${blockId}">
              <label style="position: relative; margin: 0;">
                <input type="radio" name="contactMethod" value="Par téléphone" checked class="contact-method-radio-${blockId}" />
                <span class="contact-method-badge-${blockId}">Par téléphone</span>
              </label>
              <label style="position: relative; margin: 0;">
                <input type="radio" name="contactMethod" value="Par email" class="contact-method-radio-${blockId}" />
                <span class="contact-method-badge-${blockId}">Par email</span>
              </label>
            </div>
          </div>

          <div style="display: flex; gap: 8px; align-items: flex-start; margin-top: 4px;">
            <input type="checkbox" required style="margin-top: 2px; accent-color: ${esc(accent)}; cursor: pointer;" />
            <span style="font-size: 11px; color: #64748b; line-height: 1.4;">J'accepte les Conditions de Service et Politique de Confidentialité.</span>
          </div>

          <button type="submit" class="submit-btn-${blockId}" style="height: 44px; background: ${esc(accent)}; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 10px; font-family: inherit; transition: opacity 200ms;">
            ${esc(submitLabel)}
          </button>
        </form>

        <div class="success-message-${blockId}" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px 20px; color: #166534;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: #d1fae5; display: flex; align-items: center; justify-content: center; color: #15803d; font-weight: bold; font-size: 12px;">✓</span>
            <strong style="font-size: 16px;">Message envoyé !</strong>
          </div>
          <p style="font-size: 14px; margin: 0; color: #166534; opacity: 0.9;">Merci pour votre message. Notre équipe prendra contact avec vous dans les plus brefs délais.</p>
        </div>

        <div class="error-message-${blockId}" style="display: none; margin-top: 10px; padding: 12px; background: #fee2e2; color: #b91c1c; border-radius: 8px; font-size: 13px; font-weight: 500; text-align: center;">
          Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.
        </div>
      </div>
    </div>

    <!-- Right Column: Image aligned to form height -->
    ${imageUrl ? `
    <div class="image-column-${blockId}" style="display: flex; justify-content: center; box-sizing: border-box; height: 100%; min-height: 450px;">
      <img src="${esc(imageUrl)}" alt="Illustration" style="width: 100%; height: 400px; object-fit: cover; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);" />
    </div>
    ` : ''}

  </div>
</section>

<script>
(function() {
  var contactSection = document.currentScript ? document.currentScript.previousElementSibling : null;
  if (!contactSection) return;
  var formEl = contactSection.querySelector('form');
  var successEl = contactSection.querySelector('.success-message-${blockId}');
  var errorEl = contactSection.querySelector('.error-message-${blockId}');
  var submitBtn = contactSection.querySelector('.submit-btn-${blockId}');
  var A = typeof __EXPORT_API_URL__ !== 'undefined' ? __EXPORT_API_URL__ : '';

  if (formEl) {
    formEl.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (!formEl.checkValidity()) {
        if (typeof formEl.reportValidity === 'function') formEl.reportValidity();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi...';
      }
      errorEl.style.display = 'none';

      var localApi = (contactSection.querySelector('.contact-form-card-${blockId}').dataset.localApi || A || '').replace(/\\/$/, '');
      if (!localApi || localApi.indexOf('http') !== 0) localApi = 'http://localhost:3000';
      var finalLocalUrl = 'http://localhost:3000/api/public/leads';
      try {
        var parsed = new URL(localApi);
        finalLocalUrl = parsed.origin + '/api/public/leads';
      } catch(err) {}

      var d = {};
      formEl.querySelectorAll('input,select,textarea').forEach(function(el) {
        if (el.name) {
          if (el.type === 'radio') {
            if (el.checked) d[el.name] = el.value;
          } else {
            d[el.name] = el.type === 'checkbox' ? (el.checked ? 'true' : '') : el.value;
          }
        }
      });

      var payload = {
        fullName: d.name || '',
        phone: d.phone || '',
        email: d.email || '',
        vehicleModel: 'Ford Territory',
        city: d.city || '',
        message: d.message || '',
        requestType: 'CONTACT',
        sourceUrl: (function(){ var h=window.location.href||''; return (!h||h.indexOf('file://')===0)?'http://offline-export.autohall.local':h; })(),
        rawPayload: d,
        campaignId: contactSection.querySelector('.contact-form-card-${blockId}').dataset.campaign || undefined,
        landingPageId: contactSection.querySelector('.contact-form-card-${blockId}').dataset.lp || undefined
      };

      try {
        var res = await fetch(finalLocalUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          formEl.style.display = 'none';
          successEl.style.display = 'block';
        } else {
          throw new Error('Status ' + res.status);
        }
      } catch (err) {
        console.error('Lead submit error:', err);
        errorEl.style.display = 'block';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '${esc(submitLabel)}';
        }
      }
    });
  }
})();
</script>
`;
}

export function footerBlockHtml(props: any): string {
  const bg = props.bgColor ?? '#002C6C';
  const watermarkText = esc(props.watermarkText || 'Auto Hall');
  const social = props.socialLinks ?? {};
  const legal = props.legalLinks ?? {};
  const blockId = props.id || 'footer';
  const copyrightTemplate = esc(props.copyrightText || '© {year} Auto Hall. Tous droits réservés.');

  const showBrands = props.showBrandsColumn !== false;
  const showCareers = props.showCareersColumn !== false;
  const activeCols = 2 + (showBrands ? 1 : 0) + (showCareers ? 1 : 0);

  const groupTitle = esc(props.groupTitle || 'Groupe Auto Hall');
  const groupL1L = esc(props.groupLink1Label || 'À propos de nous');
  const groupL1U = esc(props.groupLink1Url || 'https://www.autohall.ma/fr/page/a-propos-de-nous');
  const groupL2L = esc(props.groupLink2Label || 'Actualités');
  const groupL2U = esc(props.groupLink2Url || 'https://www.autohall.ma/fr/actualites');
  const groupL3L = esc(props.groupLink3Label || 'Réseau');
  const groupL3U = esc(props.groupLink3Url || 'https://www.autohall.ma/fr/reseau');

  const servicesTitle = esc(props.servicesTitle || 'Nos Services');
  const servicesL1L = esc(props.servicesLink1Label || 'Vente de véhicules');
  const servicesL1U = esc(props.servicesLink1Url || 'https://www.autohall.ma/fr/reseau');
  const servicesL2L = esc(props.servicesLink2Label || 'Service Après-Vente');
  const servicesL2U = esc(props.servicesLink2Url || 'https://www.autohall.ma/fr/services/apres-vente');
  const servicesL3L = esc(props.servicesLink3Label || 'Pièces de rechange');
  const servicesL3U = esc(props.servicesLink3Url || 'https://www.autohall.ma/fr/services/pieces-de-rechange');

  const careersTitle = esc(props.careersTitle || 'Carrières');
  const careersL1L = esc(props.careersLink1Label || 'Offres d’emploi');
  const careersL1U = esc(props.careersLink1Url || 'https://www.autohall.ma/fr/carrieres');
  const careersL2L = esc(props.careersLink2Label || 'Candidature spontanée');
  const careersL2U = esc(props.careersLink2Url || 'https://www.autohall.ma/fr/carrieres/candidature-spontanee');
  const careersL3L = esc(props.careersLink3Label || 'Pourquoi nous rejoindre');
  const careersL3U = esc(props.careersLink3Url || 'https://www.autohall.ma/fr/carrieres/pourquoi-nous-rejoindre');

  const SOCIAL_ICONS: Record<string, string> = {
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  };

  const socialHtml = (['facebook', 'instagram', 'linkedin', 'youtube'] as const)
    .filter(key => social[key])
    .map(key => `
      <a href="${esc(social[key])}" target="_blank" rel="noopener noreferrer" class="footer-social-icon-${blockId}" aria-label="${key}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SOCIAL_ICONS[key]}</svg>
      </a>`)
    .join('');

  const legalLinksHtml = [
    legal.politiqueConfidentialite ? `<a href="${esc(legal.politiqueConfidentialite)}" target="_blank" rel="noopener noreferrer" class="footer-link-custom-${blockId}">Politique de Confidentialité</a>` : '',
    legal.conditionsService ? `<a href="${esc(legal.conditionsService)}" target="_blank" rel="noopener noreferrer" class="footer-link-custom-${blockId}">Conditions de Service</a>` : '',
    legal.parametresCookies ? `<a href="${esc(legal.parametresCookies)}" target="_blank" rel="noopener noreferrer" class="footer-link-custom-${blockId}">Paramètres des Cookies</a>` : '',
    legal.mentionsLegales ? `<a href="${esc(legal.mentionsLegales)}" target="_blank" rel="noopener noreferrer" class="footer-link-custom-${blockId}">Mentions légales</a>` : '',
  ].join('');

  const navLink = (label: string, href: string) =>
    `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="footer-link-custom-${blockId}">${esc(label)}</a>`;

  const lgColsStyle = activeCols === 4 
    ? 'repeat(4, minmax(0, 1fr))' 
    : activeCols === 3 
      ? 'repeat(3, minmax(0, 1fr))' 
      : 'repeat(2, minmax(0, 1fr))';

  return `
<style>
  .footer-link-custom-${blockId} {
    font-size: 13px;
    color: #f8fafc;
    opacity: 0.9;
    text-decoration: none;
    transition: all 200ms ease;
  }
  .footer-link-custom-${blockId}:hover {
    color: #38bdf8;
    opacity: 1;
  }
  .footer-social-icon-${blockId} {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    transition: all 200ms ease;
  }
  .footer-social-icon-${blockId}:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateY(-2px);
  }
  @media (min-width: 768px) {
    .grid-cols-md-${blockId} {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
  @media (min-width: 1024px) {
    .grid-cols-lg-${blockId} {
      grid-template-columns: ${lgColsStyle} !important;
    }
  }
</style>
<footer style="width: 100%; background: ${esc(bg)}; color: #ffffff; font-family: var(--brand-font, 'Outfit', sans-serif); padding: 64px 5% 0; box-sizing: border-box; position: relative; overflow: hidden; border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;">
  <div class="grid-cols-md-${blockId} grid-cols-lg-${blockId}" style="max-width: 1200px; margin: 0 auto; width: 100%; position: relative; z-index: 1; display: grid; grid-template-columns: 1fr; gap: 40px; margin-bottom: 48px;">
    <!-- Column 1: Groupe Auto Hall -->
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 13px; font-weight: 600; color: #ffffff; letter-spacing: 0.01em;">${groupTitle}</span>
        <span style="width: 28px; height: 1px; background: rgba(255, 255, 255, 0.35); display: block;"></span>
      </div>
      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
        <li>${navLink(groupL1L, groupL1U)}</li>
        <li>${navLink(groupL2L, groupL2U)}</li>
        <li>${navLink(groupL3L, groupL3U)}</li>
      </ul>
    </div>

    <!-- Column 2: Services -->
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 13px; font-weight: 600; color: #ffffff; letter-spacing: 0.01em;">${servicesTitle}</span>
        <span style="width: 28px; height: 1px; background: rgba(255, 255, 255, 0.35); display: block;"></span>
      </div>
      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
        <li>${navLink(servicesL1L, servicesL1U)}</li>
        <li>${navLink(servicesL2L, servicesL2U)}</li>
        <li>${navLink(servicesL3L, servicesL3U)}</li>
      </ul>
    </div>

    <!-- Column 3: Marques (grid compact 2 colonnes interne) -->
    ${showBrands ? `
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 220px;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 13px; font-weight: 600; color: #ffffff; letter-spacing: 0.01em;">Marques</span>
        <span style="width: 28px; height: 1px; background: rgba(255, 255, 255, 0.35); display: block;"></span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px;">
        ${navLink('Opel', 'https://www.autohall.ma/fr/marque/opel')}
        ${navLink('Ford', 'https://www.autohall.ma/fr/marque/ford')}
        ${navLink('DFSK', 'https://www.autohall.ma/fr/marque/dfsk')}
        ${navLink('Nissan', 'https://www.autohall.ma/fr/marque/nissan')}
        ${navLink('Mitsubishi', 'https://www.autohall.ma/fr/marque/mitsubishi')}
        ${navLink('Fiat', 'https://www.autohall.ma/fr/marque/fiat')}
        ${navLink('Fuso', 'https://www.autohall.ma/fr/marque/fuso')}
        ${navLink('Chery', 'https://www.autohall.ma/fr/marque/chery')}
        ${navLink('Foton', 'https://www.autohall.ma/fr/marque/foton')}
        ${navLink('Seres', 'https://www.autohall.ma/fr/marque/seres')}
        ${navLink('Jeep', 'https://www.autohall.ma/fr/marque/jeep')}
        ${navLink('Gaz', 'https://www.autohall.ma/fr/marque/gaz')}
        ${navLink('Alfa Romeo', 'https://www.autohall.ma/fr/marque/alfa-romeo')}
        ${navLink('Maserati', 'https://www.maserati.com/ma/fr')}
        ${navLink('Ford Trucks', 'https://www.autohall.ma/fr/marque/ford-trucks')}
        ${navLink('Industriel & Agricole', 'https://www.case.ma/')}
      </div>
    </div>
    ` : ''}

    <!-- Column 4: Carrières + Réseaux sociaux -->
    ${showCareers ? `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 13px; font-weight: 600; color: #ffffff; letter-spacing: 0.01em;">${careersTitle}</span>
        <span style="width: 28px; height: 1px; background: rgba(255, 255, 255, 0.35); display: block;"></span>
      </div>
      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
        <li>${navLink(careersL1L, careersL1U)}</li>
        <li>${navLink(careersL2L, careersL2U)}</li>
        <li>${navLink(careersL3L, careersL3U)}</li>
      </ul>
      <div style="display: flex; gap: 10px; margin-top: 8px;">
        ${socialHtml}
      </div>
    </div>
    ` : ''}
  </div>

  <!-- Filigrane "Auto Hall" — zone dédiée en flux normal, centrée horizontalement et verticalement avec opacité de 3% -->
  <div style="width: 100%; min-height: 96px; display: flex; align-items: center; justify-content: center; overflow: hidden; pointer-events: none; position: relative; z-index: 0;">
    <span style="font-size: clamp(40px, 7vw, 140px); font-weight: 800; color: rgba(255, 255, 255, 0.03); user-select: none; line-height: 1.1; letter-spacing: 0.15em; white-space: nowrap; text-align: center;">${watermarkText}</span>
  </div>

  <!-- Bottom footer bar -->
  <div style="max-width: 1200px; margin: 0 auto; width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 24px 0 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; position: relative; z-index: 1; box-sizing: border-box;">
    <span id="footer-copyright-${blockId}" style="font-size: 12px; color: #cbd5e1; opacity: 0.8;">${copyrightTemplate}</span>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      ${legalLinksHtml}
    </div>
  </div>
</footer>
<script>
(function() {
  var el = document.getElementById('footer-copyright-${blockId}');
  if (el) el.textContent = el.textContent.replace('{year}', new Date().getFullYear());
})();
</script>
`;
}

export function brandNavbarBlockHtml(props: any): string {
  const navLinks = props.navLinks ?? props.links ?? [];
  const logoSrc = props.logoUrl ?? props.logoSrc ?? null;
  const isSticky = props.sticky ?? false;
  const altText = props.altText || props.brand || 'Logo';

  const stickyStyle = isSticky ? 'position:sticky;top:0;z-index:9999;' : 'position:relative;';

  const linksHtml = navLinks.map((l: any) => `
    <a href="${esc(l.href)}" class="nav-link-custom" style="font-size:13px;font-weight:500;color:#334155;text-decoration:none;margin-left:24px;position:relative;padding:6px 0;display:inline-block;">${esc(l.label)}</a>
  `).join('');

  return `
<style>
  .nav-link-custom {
    transition: color 300ms ease;
  }
  .nav-link-custom:hover {
    color: var(--brand-primary, #002C6C) !important;
  }
  .nav-link-custom::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 1.5px;
    bottom: 0;
    left: 0;
    background-color: var(--brand-primary, #002C6C);
    transform-origin: bottom right;
    transition: transform 300ms ease;
  }
  .nav-link-custom:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
</style>
<header style="width:100%;height:70px;background:rgba(255,255,255,0.90);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(241,245,249,0.8);font-family:Outfit,Inter,sans-serif;padding:0 5%;box-sizing:border-box;display:flex;align-items:center;transition:all 0.3s ease;${stickyStyle}">
  <div style="width:100%;max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:100%;">
    <div style="display:flex;align-items:center;gap:20px;">
      ${logoSrc ? `<img src="${esc(logoSrc)}" alt="${esc(altText)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display='none';this.insertAdjacentHTML('afterend','<span style=\\'font-size:18px;font-weight:900;color:#0f172a;letter-spacing:-0.03em;\\'>${esc(altText)}</span>')" style="height:32px;max-height:36px;object-fit:contain;" />` : `<span style="font-size:18px;font-weight:900;color:#0f172a;letter-spacing:-0.03em;">${esc(altText)}</span>`}
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#64748b;font-weight:500;">
        <span>Accueil</span> <span style="font-size:10px;">&gt;</span>
        <span>Marques</span> <span style="font-size:10px;">&gt;</span>
        <span style="color:#0f172a;font-weight:600;">${esc(props.brand || 'Modèle')}</span>
      </div>
    </div>
    <nav style="display:flex;align-items:center;">
      ${linksHtml}
    </nav>
  </div>
</header>`;
}

function renderFormCardHtml(props: any, ctx: ExportContext, darkTheme: boolean): string {
  const colorPrimary = props.colorPrimary ?? '#005bc4';
  const autoHallApiUrl = props.autoHallApiUrl ?? '';
  const syncToAutoHallBase = props.syncToAutoHallBase ?? false;
  const localApiUrl = ctx.apiBaseUrl ?? 'http://localhost:3000';
  const exportCampaignId    = esc(ctx.campaignId    ?? '');
  const exportLandingPageId = esc(ctx.landingPageId ?? '');
  const exportPageVersionId = esc(ctx.pageVersionId ?? '');
  const villesList = props.villesList ?? [];
  const borderRadiusButtons = props.borderRadiusButtons ?? 8;
  const cardBorderRadius = Math.min(32, borderRadiusButtons + 12);

  const isModelLanding = ctx.landingPageType === 'model';
  const activeBrandExport = getAutoHallBrand(ctx.selectedBrandId);
  /** En mode "Landing de Marque", l'Étape 1 propose la gamme de la marque active plutôt que la liste statique du bloc. */
  const modelsList = !isModelLanding && activeBrandExport?.models?.length ? activeBrandExport.models : (props.modelsList ?? []);

  const step1Title = props.step1Title ?? 'Sélectionnez le véhicule';
  const step2Title = props.step2Title ?? 'Disponibilité';
  const step3Title = props.step3Title ?? 'Coordonnées';
  const btnNextLabel = props.btnNextLabel ?? 'Suivant';
  const btnBackLabel = props.btnBackLabel ?? 'Retour';
  const btnSubmitLabel = props.btnSubmitLabel ?? 'Valider';
  const singleStepTitle = props.singleStepTitle ?? 'Demande de rappel rapide';

  const dotColor = darkTheme ? '#ffffff' : colorPrimary;
  const borderRadiusStyle = `${borderRadiusButtons}px`;

  const totalSteps = isModelLanding ? 2 : 3;
  const dotsHtml = Array.from({ length: totalSteps }, (_, idx) => {
    const activeBg = idx === 0 ? dotColor : (darkTheme ? 'rgba(255,255,255,0.2)' : '#e5e7eb');
    return `<span data-step-dot style="width:${idx === 0 ? '12px' : '8px'};height:${idx === 0 ? '12px' : '8px'};border-radius:50%;background:${activeBg};display:inline-block;transition:all 200ms ease;${idx === 0 ? `box-shadow:0 0 0 3px ${dotColor}33;` : ''}"></span>`;
  }).join('');

  const step1OptionsHtml = modelsList.map((m: string) => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
  const step2CitiesHtml = villesList.map((v: string) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');

  const isMultiStep = (props.formMode ?? 'multi-step') === 'multi-step';

  // En mode "Landing de Modèle", l'Étape 1 (choix du véhicule) est omise du DOM : le script
  // générique `initMulti()` compte les éléments `[data-step]` restants et adapte automatiquement
  // l'indicateur, la barre de progression et la navigation — aucune logique JS dédiée requise.
  const step1Html = isModelLanding ? '' : `
    <div data-step="0" style="display:block;">
      <h3 style="font-size:16px;font-weight:800;color:${darkTheme ? '#ffffff' : '#0f172a'};text-align:center;margin:0 0 18px;line-height:1.3;font-family:var(--brand-font, inherit);">${esc(step1Title)}</h3>
      <div style="display:flex;flex-direction:column;gap:6px;width:100%;margin-bottom:16px;">
        <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Modèle</label>
        <div class="luxury-select-wrapper-${props.id || 'hero'}">
          <select name="testdrive[modele]" class="luxury-select-${props.id || 'hero'}">
            ${step1OptionsHtml}
          </select>
          <div class="luxury-select-arrow-${props.id || 'hero'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>
      <button type="button" data-next class="luxury-btn-primary-${props.id || 'hero'}" style="margin-top:10px;background:${dotColor};box-shadow:0 4px 14px ${dotColor}40;">${esc(btnNextLabel)}</button>
    </div>
  `;

  const stepsHtml = `
    ${step1Html}
    <div data-step="1" style="display:none;" hidden>
      <h3 style="font-size:16px;font-weight:800;color:${darkTheme ? '#ffffff' : '#0f172a'};text-align:center;margin:0 0 18px;line-height:1.3;font-family:var(--brand-font, inherit);">${esc(step2Title)}</h3>
      <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:16px;">
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Ville</label>
          <div class="luxury-select-wrapper-${props.id || 'hero'}">
            <select name="testdrive[ville]" class="luxury-select-${props.id || 'hero'}">
              ${step2CitiesHtml}
            </select>
            <div class="luxury-select-arrow-${props.id || 'hero'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Date préférée pour l'essai</label>
          <input type="date" name="testdrive[dateessai]" class="luxury-input-${props.id || 'hero'}" />
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:10px;">
        <button type="button" data-back class="luxury-btn-secondary-${props.id || 'hero'}">${esc(btnBackLabel)}</button>
        <button type="button" data-next class="luxury-btn-primary-${props.id || 'hero'}" style="flex:1;background:${dotColor};box-shadow:0 4px 14px ${dotColor}40;">${esc(btnNextLabel)}</button>
      </div>
    </div>
    
    <div data-step="2" style="display:none;" hidden>
      <h3 style="font-size:16px;font-weight:800;color:${darkTheme ? '#ffffff' : '#0f172a'};text-align:center;margin:0 0 18px;line-height:1.3;font-family:var(--brand-font, inherit);">${esc(step3Title)}</h3>
      <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:16px;">
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Nom Complet *</label>
          <input type="text" name="testdrive[nomprenom]" required placeholder="Entrez votre nom" class="luxury-input-${props.id || 'hero'}" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Téléphone *</label>
          <input type="tel" name="testdrive[telephone]" required placeholder="Ex: 06 00 00 00 00" class="luxury-input-${props.id || 'hero'}" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Email *</label>
          <input type="email" name="testdrive[email]" required placeholder="vous@exemple.com" class="luxury-input-${props.id || 'hero'}" />
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-start;margin:4px 0 16px;">
        <input type="checkbox" required name="testdrive[consent]" id="consent_${props.id || 'hero'}" style="margin-top:2px;accent-color:${dotColor};cursor:pointer;flex-shrink:0;" />
        <span style="font-size:9.5px;color:${darkTheme ? 'rgba(255,255,255,0.6)' : '#64748b'};line-height:1.5;">J\'ai lu et j\'accepte les conditions générales d\'utilisations, notamment la mention relative à la protection des données personnelles. Conformément à la loi 09-08, vous disposez d\'un droit d\'accès, de rectification et d\'opposition au traitement de vos données personnelles.</span>
      </div>
      <div style="display:flex;gap:10px;margin-top:10px;">
        <button type="button" data-back class="luxury-btn-secondary-${props.id || 'hero'}">${esc(btnBackLabel)}</button>
        <button type="button" data-submit class="luxury-btn-primary-${props.id || 'hero'}" style="flex:1;background:${dotColor};box-shadow:0 4px 14px ${dotColor}40;opacity:0.45;pointer-events:none;transition:opacity 200ms;" disabled aria-disabled="true">${esc(btnSubmitLabel)}</button>
      </div>
    </div>
  `;

  const singleStepHtml = `
    <div style="display:block;">
      <h3 style="font-size:16px;font-weight:800;color:${darkTheme ? '#ffffff' : '#0f172a'};text-align:center;margin:0 0 18px;line-height:1.3;font-family:var(--brand-font, inherit);">${esc(singleStepTitle)}</h3>
      <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:16px;">
        <div style="display:flex;gap:10px;width:100%;">
          <div style="display:flex;flex-direction:column;gap:6px;width:80px;flex-shrink:0;">
            <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Civilité</label>
            <div class="luxury-select-wrapper-${props.id || 'hero'}">
              <select name="civility" class="luxury-select-${props.id || 'hero'}">
                <option value="M.">M.</option>
                <option value="Mme">Mme</option>
                <option value="Mlle">Mlle</option>
              </select>
              <div class="luxury-select-arrow-${props.id || 'hero'}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex:1;">
            <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Prénom *</label>
            <input type="text" name="firstname" required placeholder="Votre prénom" class="luxury-input-${props.id || 'hero'}" />
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Nom *</label>
          <input type="text" name="lastname" required placeholder="Votre nom" class="luxury-input-${props.id || 'hero'}" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Email *</label>
          <input type="email" name="email" required placeholder="vous@exemple.com" class="luxury-input-${props.id || 'hero'}" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Téléphone *</label>
          <input type="tel" name="phone" required pattern="0[1-9][0-9]{8}" placeholder="Ex: 06 00 00 00 00" class="luxury-input-${props.id || 'hero'}" title="Format valide: 0612345678 (10 chiffres)" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;">Ville *</label>
          <div class="luxury-select-wrapper-${props.id || 'hero'}">
            <select name="city" class="luxury-select-${props.id || 'hero'}">
              ${step2CitiesHtml}
            </select>
            <div class="luxury-select-arrow-${props.id || 'hero'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-start;margin:4px 0 16px;">
        <input type="checkbox" required name="privacy" id="consent_s_${props.id || 'hero'}" style="margin-top:2px;accent-color:${dotColor};cursor:pointer;flex-shrink:0;" />
        <span style="font-size:9.5px;color:${darkTheme ? 'rgba(255,255,255,0.6)' : '#64748b'};line-height:1.5;">J\'ai lu et j\'accepte les conditions g\u00e9n\u00e9rales d\'utilisations, notamment la mention relative \u00e0 la protection des donn\u00e9es personnelles. Conform\u00e9ment \u00e0 la loi 09-08, vous disposez d\'un droit d\'acc\u00e8s, de rectification et d\'opposition au traitement de vos donn\u00e9es personnelles.</span>
      </div>
      <button type="submit" class="luxury-btn-primary-${props.id || 'hero'}" style="margin-top:10px;background:${dotColor};box-shadow:0 4px 14px ${dotColor}40;transition:opacity 200ms;">${esc(btnSubmitLabel)}</button>
    </div>
  `;

  const cardStyleAttr = darkTheme
    ? `width:100%;max-width:448px;background:rgba(15,23,42,0.65);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:${cardBorderRadius}px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.4),0 10px 10px -5px rgba(0,0,0,0.4);overflow:visible;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.1);z-index:1;box-sizing:border-box;`
    : `width:100%;max-width:448px;background:#ffffff;border-radius:${cardBorderRadius}px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05),0 10px 15px -3px rgba(0,0,0,0.1);overflow:visible;display:flex;flex-direction:column;border:1px solid rgba(15,23,42,0.08);z-index:1;box-sizing:border-box;`;

  // Attributs de câblage JS (fetch/validation) — uniquement pertinents pour le pipeline
  // multi-étapes ; le formulaire mono-étape (Flash Promo) soumet nativement vers save_lead.php
  // et ne doit porter aucun hook lu par le bundle JS partagé.
  const dataAttrs = isMultiStep
    ? [
        `data-accent="${esc(colorPrimary)}"`,
        `data-submission-mode="DATABASE"`,
        exportCampaignId ? `data-campaign-id="${exportCampaignId}"` : '',
        exportLandingPageId ? `data-landing-page-id="${exportLandingPageId}"` : '',
        `data-local-api="${esc(localApiUrl)}"`,
        `data-sync-autohall="${syncToAutoHallBase ? 'true' : 'false'}"`,
        autoHallApiUrl ? `data-autohall-api="${esc(autoHallApiUrl)}"` : '',
        exportCampaignId ? `data-campaign="${exportCampaignId}"` : '',
        exportLandingPageId ? `data-lp="${exportLandingPageId}"` : '',
        exportPageVersionId ? `data-pv="${exportPageVersionId}"` : '',
      ].filter(Boolean).join(' ')
    : '';

  const formModeAttr = isMultiStep ? 'data-multi-form' : '';

  const styleBlock = `
<style>
  .luxury-form-content-${props.id || 'hero'} {
    padding: 24px !important;
  }
  @media (min-width: 768px) {
    .luxury-form-content-${props.id || 'hero'} {
      padding: 32px !important;
    }
  }
  .luxury-input-${props.id || 'hero'} {
    height: 36px;
    padding: 0 12px;
    border: 1px solid ${darkTheme ? 'rgba(255,255,255,0.2)' : '#cbd5e1'};
    border-radius: ${borderRadiusStyle};
    font-size: 14px;
    color: ${darkTheme ? '#ffffff' : '#09090b'};
    background-color: ${darkTheme ? 'rgba(255,255,255,0.08)' : '#ffffff'};
    outline: none;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .luxury-input-${props.id || 'hero'}::placeholder {
    color: ${darkTheme ? 'rgba(255,255,255,0.4)' : '#94a3b8'};
  }
  .luxury-input-${props.id || 'hero'}:focus {
    border-color: ${darkTheme ? '#ffffff' : colorPrimary};
    background-color: ${darkTheme ? 'rgba(255,255,255,0.15)' : '#ffffff'};
    box-shadow: 0 0 0 2px ${darkTheme ? 'rgba(255,255,255,0.1)' : `${colorPrimary}20`};
  }
  .luxury-select-wrapper-${props.id || 'hero'} {
    position: relative;
    width: 100%;
    box-sizing: border-box;
  }
  .luxury-select-${props.id || 'hero'} {
    appearance: none;
    -webkit-appearance: none;
    height: 36px;
    padding: 0 12px;
    padding-right: 40px;
    border: 1px solid ${darkTheme ? 'rgba(255,255,255,0.2)' : '#cbd5e1'};
    border-radius: ${borderRadiusStyle};
    font-size: 14px;
    color: ${darkTheme ? '#ffffff' : '#09090b'};
    background-color: ${darkTheme ? 'rgba(255,255,255,0.08)' : '#ffffff'};
    outline: none;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    cursor: pointer;
  }
  .luxury-select-${props.id || 'hero'} option {
    color: #000000;
    background: #ffffff;
  }
  .luxury-select-${props.id || 'hero'}:focus {
    border-color: ${darkTheme ? '#ffffff' : colorPrimary};
    background-color: ${darkTheme ? 'rgba(255,255,255,0.15)' : '#ffffff'};
    box-shadow: 0 0 0 2px ${darkTheme ? 'rgba(255,255,255,0.1)' : `${colorPrimary}20`};
  }
  .luxury-select-arrow-${props.id || 'hero'} {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${darkTheme ? 'rgba(255,255,255,0.4)' : '#cbd5e1'};
  }
  .luxury-btn-primary-${props.id || 'hero'} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    background: ${colorPrimary};
    color: #ffffff;
    border: none;
    border-radius: ${borderRadiusStyle};
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 14px ${colorPrimary}30;
    font-family: inherit;
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
    width: 100%;
  }
  .luxury-btn-primary-${props.id || 'hero'}:hover {
    opacity: 0.95;
  }
  .luxury-btn-primary-${props.id || 'hero'}:active {
    transform: scale(0.98);
  }
  .luxury-btn-secondary-${props.id || 'hero'} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    background: ${darkTheme ? 'rgba(255,255,255,0.12)' : '#e2e8f0'};
    color: ${darkTheme ? '#ffffff' : '#475569'};
    border: none;
    border-radius: ${borderRadiusStyle};
    font-weight: 600;
    font-size: 14px;
    padding: 0 20px;
    cursor: pointer;
    font-family: inherit;
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .luxury-btn-secondary-${props.id || 'hero'}:hover {
    background-color: ${darkTheme ? 'rgba(255,255,255,0.2)' : '#cbd5e1'};
    color: ${darkTheme ? '#ffffff' : '#1e293b'};
  }
  .luxury-btn-secondary-${props.id || 'hero'}:active {
    transform: scale(0.98);
  }
</style>`;

  const stepperBarHtml = isMultiStep ? `
    <!-- Stepper progress bar -->
    <div style="width: 100%; height: 5px; background: ${darkTheme ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}; position: relative;">
      <div data-progress style="width: 33.33%; height: 100%; background: ${esc(colorPrimary)}; transition: width 250ms ease;"></div>
    </div>
  ` : '';

  return styleBlock + `
    <div class="lp-form-card" ${formModeAttr} ${dataAttrs} style="${cardStyleAttr}">
      ${stepperBarHtml}

      <!-- Form Content -->
      <div class="luxury-form-content-${props.id || 'hero'}" style="display:flex;flex-direction:column;gap:14px;box-sizing:border-box;">
        <div data-form-container>
          ${isMultiStep ? `
            <!-- Stepper Header -->
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:20px;">
              <span data-step-indicator style="font-size:12px;font-weight:800;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#475569'};text-transform:uppercase;letter-spacing:0.08em;">
                ÉTAPE 1/3
              </span>
              
              <!-- Stepper Dots -->
              <div data-stepper style="display:flex;gap:8px;">
                ${dotsHtml}
              </div>
            </div>
          ` : ''}

          ${isMultiStep
            ? `<form style="margin:0;">${stepsHtml}</form>`
            : `<form id="tfc-form-main" action="save_lead.php" method="POST" style="display: flex; flex-direction: column; width: 100%;">${singleStepHtml}</form>`}
        </div>

        ${isMultiStep ? `
        <!-- Success message -->
        <div data-success style="display:none;text-align:center;padding:24px 0;">
          <div style="width:56px;height:56px;border-radius:50%;background:#d1fae5;color:#059669;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">✓</div>
          <h3 style="font-size:20px;font-weight:800;color:${darkTheme ? '#ffffff' : '#0f172a'};margin:0 0 8px;font-family:var(--brand-font, inherit);">Demande Envoyée !</h3>
          <p style="font-size:14px;color:${darkTheme ? 'rgba(255,255,255,0.7)' : '#64748b'};margin:0;line-height:1.5;">Merci pour votre demande. Un conseiller vous contactera sous 24 heures.</p>
        </div>

        <!-- Error message -->
        <div data-error style="display:none;text-align:center;padding:12px;background:#fee2e2;color:#b91c1c;border-radius:8px;font-size:13px;font-weight:500;">
          Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Zone visuelle générique des 3 blocs Hero à l'export — bascule entre image unique, galerie
 * mosaïque (4 images) ou vidéo d'arrière-plan selon `props.mediaType`, quel que soit le blockType.
 * Miroir exact de `HeroMediaVisual` (canvas) pour garantir la cohérence export/canevas.
 */
function heroMediaVisualHtml(props: any, variant: 'inline' | 'background' = 'inline'): string {
  const mediaType = props.mediaType ?? 'image';
  const cleanVehicleImage = sanitizeUrl(props.vehicleImage) || NEUTRAL_VEHICLE_PLACEHOLDER;

  if (mediaType === 'video' && props.bgVideoUrl) {
    const videoClass = variant === 'background'
      ? 'width:100%;height:100%;object-fit:cover;display:block;'
      : 'width:100%;height:auto;object-fit:cover;display:block;';
    return `<video autoplay loop muted playsinline style="${videoClass}"><source src="${esc(props.bgVideoUrl)}" type="video/mp4"></video>`;
  }

  if (mediaType === 'gallery') {
    const cleanDetail1 = sanitizeUrl(props.detailImage1) || NEUTRAL_VEHICLE_PLACEHOLDER;
    const cleanDetail2 = sanitizeUrl(props.detailImage2) || NEUTRAL_VEHICLE_PLACEHOLDER;
    const cleanDetail3 = sanitizeUrl(props.detailImage3) || NEUTRAL_VEHICLE_PLACEHOLDER;
    return `
      <div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:12px;width:100%;height:450px;border-radius:16px;overflow:hidden;box-sizing:border-box;" class="gallery-container gallery-grid mosaic-image-container">
        <div class="item-media-first" style="grid-column: span 8; height:100%;min-height:0;position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05); border-top-left-radius:16px; border-bottom-left-radius:16px;">
          <img src="${esc(cleanVehicleImage)}" alt="Vue Principale" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;" />
        </div>
        <div class="item-media-last" style="grid-column: span 4; display:grid; grid-template-rows: repeat(3, 1fr); gap:12px; height:100%;min-height:0;">
          <div class="item-media-thumb" style="height:100%;min-height:0;position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05); border-top-right-radius:16px;">
            <img src="${esc(cleanDetail1)}" alt="Détail 1" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;" />
          </div>
          <div class="item-media-thumb" style="height:100%;min-height:0;position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
            <img src="${esc(cleanDetail2)}" alt="Détail 2" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;" />
          </div>
          <div class="item-media-thumb" style="height:100%;min-height:0;position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05); border-bottom-right-radius:16px;">
            <img src="${esc(cleanDetail3)}" alt="Détail 3" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;" />
          </div>
        </div>
      </div>`;
  }

  if (variant === 'background') {
    return `<img src="${esc(cleanVehicleImage)}" alt="Arrière-plan" style="width:100%;height:100%;object-fit:cover;display:block;" />`;
  }

  return `<img src="${esc(cleanVehicleImage)}" alt="Véhicule" style="width:100%;height:auto;object-fit:contain;display:block;max-height:380px;margin:0 auto;padding:16px;box-sizing:border-box;" />`;
}

function brandLogoHtml(props: any): string {
  if (!props.brandLogoUrl) return '';
  return `<img src="${esc(props.brandLogoUrl)}" alt="Logo de la marque" style="height:32px;max-width:160px;width:auto;object-fit:contain;display:block;" />`;
}

export function heroImmersiveFormBlockHtml(props: any, ctx: ExportContext, _theme: any): string {
  const bgImage = props.bgImage ?? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80';
  const title = props.title ?? 'Découvrez une nouvelle dimension de conduite.';
  
  const step1Title = props.step1Title ?? 'Commençons par confirmer votre disponibilité';
  const step1Subtitle = props.step1Subtitle ?? 'Sélectionnez votre modèle et votre succursale';
  const step2Title = props.step2Title ?? 'Enfin, Fournir votre nom et téléphone';
  const step2Subtitle = props.step2Subtitle ?? 'Entrez vos coordonnées pour finaliser la demande';
  const step3Title = props.step3Title ?? 'Demande Enregistrée !';
  const step3Subtitle = props.step3Subtitle ?? 'Notre équipe Auto Hall prendra contact avec vous dans les plus brefs délais.';

  const btnNextLabel = props.btnNextLabel ?? 'Suivant';
  const btnBackLabel = props.btnBackLabel ?? 'Retour';
  const btnSubmitLabel = props.btnSubmitLabel ?? 'Valider';

  const activeBrand = getAutoHallBrand(ctx.selectedBrandId || props.brandKey);
  const primaryColor = activeBrand?.primaryColor ?? props.colorPrimary ?? '#002C6C';
  
  const modelsList = activeBrand?.models?.length ? activeBrand.models : (props.modelsList ?? []);
  const villesList = props.villesList ?? [];

  const todayStr = new Date().toISOString().split('T')[0];

  const modelOptionsHtml = modelsList.map((m: string) => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
  const cityOptionsHtml = villesList.map((v: string) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');

  return `
    <section 
      style="background-image:url('${esc(bgImage)}');background-size:cover;background-position:center;min-height:600px;position:relative;width:100%;display:flex;align-items:center;padding:80px 0;box-sizing:border-box;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);"
      class="hero-immersive-section"
    >
      <!-- Dark overlay -->
      <div style="position:absolute;inset:0;background-color:rgba(0,0,0,0.5);z-index:0;"></div>

      <div style="position:relative;z-index:10;max-width:1280px;margin:0 auto;width:100%;padding:0 5%;box-sizing:border-box;display:grid;grid-template-columns:1fr;gap:48px;align-items:center;" class="immersive-grid">
        
        <!-- Left side: H1 slogan -->
        <div style="display:flex;flex-direction:column;box-sizing:border-box;text-align:left;" class="hero-content">
          <h1 style="color:#ffffff;font-weight:800;font-size:clamp(2rem, 4.5vw, 3rem);line-height:1.2;margin:0;max-width:600px;letter-spacing:-0.02em;">
            ${esc(title)}
          </h1>
        </div>

        <!-- Right side: White premium multi-step card -->
        <div style="width:100%;max-width:448px;box-sizing:border-box;margin:0 auto;" class="immersive-form-col">
          <div 
            class="lp-multi-form"
            data-multi-form
            data-accent="${esc(primaryColor)}"
            data-campaign="${esc(ctx.campaignId ?? '')}"
            data-lp="${esc(ctx.landingPageId ?? '')}"
            data-pv="${esc(ctx.pageVersionId ?? '')}"
            data-sync-autohall="${props.syncToAutoHallBase ? 'true' : 'false'}"
            data-autohall-api="${esc(props.autoHallApiUrl ?? '')}"
            data-local-api="${esc(ctx.apiBaseUrl ?? 'http://localhost:3000')}"
            style="background:#ffffff;box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25);border-radius:16px;padding:24px;border:1px solid #e4e4e7;box-sizing:border-box;color:#18181b;"
          >
            <!-- Hidden inputs for mapping -->
            <input type="hidden" name="testdrive[brand]" value="${esc(activeBrand?.name || 'Auto Hall')}" />
            <input type="hidden" name="testdrive[type]" value="TEST_DRIVE" />

            <!-- Custom Progress Bar -->
            <div style="width:100%;height:6px;background:#f4f4f5;border-radius:9999px;overflow:hidden;margin-bottom:24px;position:relative;">
              <div data-progress style="height:100%;width:33.3%;background-color:${esc(primaryColor)};transition:width 300ms ease-out;"></div>
            </div>

            <!-- Form steps container -->
            <div data-form-container>
              <!-- Step 1: Availability -->
              <div data-step style="display:block;">
                <h3 style="font-size:18px;font-weight:700;color:#18181b;text-align:center;margin:0 0 8px;line-height:1.3;">
                  ${esc(step1Title)}
                </h3>
                <p style="font-size:12px;color:#71717a;text-align:center;margin:0 0 20px;">
                  ${esc(step1Subtitle)}
                </p>

                <!-- Model selection -->
                <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
                  <label style="font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Modèle</label>
                  <div style="position:relative;box-sizing:border-box;">
                    <select name="testdrive[modele]" style="width:100%;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:500;color:#18181b;outline:none;appearance:none;cursor:pointer;">
                      ${modelOptionsHtml}
                    </select>
                    <div style="position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:#71717a;display:flex;align-items:center;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <!-- City selection -->
                <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
                  <label style="font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Ville</label>
                  <div style="position:relative;box-sizing:border-box;">
                    <select name="testdrive[ville]" style="width:100%;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:500;color:#18181b;outline:none;appearance:none;cursor:pointer;">
                      ${cityOptionsHtml}
                    </select>
                    <div style="position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:#71717a;display:flex;align-items:center;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <!-- Date input -->
                <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px;">
                  <label style="font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Date d'essai souhaitée</label>
                  <input 
                    type="date" 
                    id="testdrivemodele_dateessai" 
                    name="testdrivemodele_dateessai" 
                    min="${todayStr}"
                    required
                    style="width:100%;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:500;color:#18181b;outline:none;box-sizing:border-box;" 
                  />
                </div>

                <button 
                  type="button" 
                  data-next 
                  style="width:100%;background-color:${esc(primaryColor)};color:#ffffff;font-weight:700;padding:12px 20px;border-radius:12px;border:none;cursor:pointer;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,0.1);transition:transform 0.2s;"
                  onmouseover="this.style.opacity='0.9'"
                  onmouseout="this.style.opacity='1'"
                >
                  ${esc(btnNextLabel)}
                </button>
              </div>

              <!-- Step 2: Personal Info -->
              <div data-step style="display:none;" hidden>
                <h3 style="font-size:18px;font-weight:700;color:#18181b;text-align:center;margin:0 0 8px;line-height:1.3;">
                  ${esc(step2Title)}
                </h3>
                <p style="font-size:12px;color:#71717a;text-align:center;margin:0 0 20px;">
                  ${esc(step2Subtitle)}
                </p>

                <!-- Full Name -->
                <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
                  <label style="font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Nom complet *</label>
                  <input 
                    type="text" 
                    name="testdrive[nom]" 
                    required 
                    placeholder="Entrez votre nom" 
                    style="width:100%;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:500;color:#18181b;outline:none;box-sizing:border-box;" 
                  />
                </div>

                <!-- Phone -->
                <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
                  <label style="font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Téléphone *</label>
                  <input 
                    type="tel" 
                    name="testdrive[telephone]" 
                    required 
                    placeholder="06 00 00 00 00" 
                    style="width:100%;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:500;color:#18181b;outline:none;box-sizing:border-box;" 
                  />
                </div>

                <!-- Consent checkbox -->
                <div style="display:flex;gap:10px;align-items:flex-start;margin:8px 0 20px;">
                  <input type="checkbox" required name="testdrive[consent]" style="margin-top:2px;accent-color:${esc(primaryColor)};cursor:pointer;" />
                  <span style="font-size:11px;color:#71717a;line-height:1.4;">J'accepte que mes données personnelles soient exploitées par Auto Hall.</span>
                </div>

                <!-- Action buttons -->
                <div style="display:flex;gap:12px;">
                  <button 
                    type="button" 
                    data-back 
                    style="flex:1;background:#f4f4f5;color:#4b5563;font-weight:700;padding:12px 20px;border-radius:12px;border:none;cursor:pointer;font-size:14px;transition:background 0.2s;"
                    onmouseover="this.style.background='#e4e4e7'"
                    onmouseout="this.style.background='#f4f4f5'"
                  >
                    ${esc(btnBackLabel)}
                  </button>
                  <button 
                    type="button" 
                    data-submit 
                    style="flex:1;background-color:${esc(primaryColor)};color:#ffffff;font-weight:700;padding:12px 20px;border-radius:12px;border:none;cursor:pointer;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,0.1);transition:transform 0.2s;"
                    onmouseover="this.style.opacity='0.9'"
                    onmouseout="this.style.opacity='1'"
                  >
                    ${esc(btnSubmitLabel)}
                  </button>
                </div>
              </div>
            </div>

            <!-- Error Notification -->
            <div data-error style="display:none;color:#ef4444;font-size:13px;font-weight:600;text-align:center;margin-top:16px;">
              Une erreur s'est produite. Veuillez réessayer.
            </div>

            <!-- Success Confirmation Screen -->
            <div data-success style="display:none;flex-direction:column;align-items:center;text-align:center;padding:16px 0;" hidden>
              <div style="width:56px;height:56px;border-radius:50%;background-color:${esc(primaryColor)}15;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              </div>

              <h3 style="font-size:20px;font-weight:700;color:#18181b;margin:0 0 8px;">
                ${esc(step3Title)}
              </h3>
              <p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0 0 24px;max-width:280px;">
                ${esc(step3Subtitle)}
              </p>

              <!-- Dynamic recap card -->
              <div style="width:100%;background:#fafafa;border-radius:12px;padding:16px;border:1px solid #f4f4f5;text-align:left;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;">
                <span style="font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #f4f4f5;padding-bottom:6px;display:block;">Récapitulatif</span>
                
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
                  <span style="color:#71717a;font-weight:500;">Marque</span>
                  <span data-recap-brand style="font-weight:600;color:#18181b;">${esc(activeBrand?.name || '')}</span>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
                  <span style="color:#71717a;font-weight:500;">Modèle</span>
                  <span data-recap-model style="font-weight:600;color:#18181b;">-</span>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
                  <span style="color:#71717a;font-weight:500;">Date d'essai</span>
                  <span data-recap-date style="font-weight:600;color:#18181b;">-</span>
                </div>
              </div>

              <p style="font-size:10px;color:#a1a1aa;margin:24px 0 0;">© ${new Date().getFullYear()} Auto Hall. Tous droits réservés.</p>
            </div>

          </div>
        </div>

      </div>

      <style>
        @media (min-width: 1024px) {
          .immersive-grid {
            grid-template-columns: 7fr 5fr !important;
          }
        }
      </style>
    </section>
  `;
}

export function heroShowroomBlockHtml(props: any, ctx: ExportContext, _theme: any): string {
  const badgeText = props.badgeText ?? '';
  const title = props.title ?? '';
  const description = props.description ?? '';
  const priceAppel = props.priceAppel ?? '';
  const paddingTop = props.paddingTop ?? 96;
  const paddingBottom = props.paddingBottom ?? 96;
  const colorBgSection = props.colorBgSection ?? '#ffffff';
  const colorPrimary = props.colorPrimary ?? '#002C6C';
  const reversed = !!props.layoutReversed;

  const badgeHtml = badgeText ? `
    <span style="color:${esc(colorPrimary)};border:1px solid ${esc(colorPrimary)}30;background:${esc(colorPrimary)}08;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.08em;width:fit-content;display:inline-block;text-transform:uppercase;">
      ${esc(badgeText)}
    </span>
  ` : '';

  const priceHtml = priceAppel ? `
    <div style="display:flex;flex-direction:column;gap:2px;box-sizing:border-box;">
      <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">À partir de</span>
      <span style="font-size:28px;font-weight:900;color:${esc(colorPrimary)};letter-spacing:-0.02em;">${esc(priceAppel)}</span>
    </div>
  ` : '';

  const formCard = renderFormCardHtml(props, ctx, false);

  return `
    <section
      id="showroom_hero"
      style="width:100%;box-sizing:border-box;background-color:${esc(colorBgSection)};font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);padding-top:${paddingTop}px;padding-bottom:${paddingBottom}px;position:relative;overflow:hidden;"
    >
      <div style="max-width:1280px;margin:0 auto;width:100%;padding:0 5%;box-sizing:border-box;display:grid;grid-template-columns:1fr;gap:48px;align-items:center;" class="showroom-grid">
        <!-- Text & Media Column -->
        <div style="display:flex;flex-direction:column;gap:24px;text-align:left;box-sizing:border-box;order:${reversed ? 2 : 1};">
          ${brandLogoHtml(props)}
          ${badgeHtml}
          <h1 style="font-size:clamp(2.2rem, 5vw, 3.2rem);font-weight:900;line-height:1.15;margin:0;letter-spacing:-0.025em;color:#0f172a;">
            ${esc(title)}
          </h1>
          <p style="font-size:16px;color:#475569;line-height:1.6;margin:0;max-width:650px;">
            ${esc(description)}
          </p>
          ${priceHtml}

          <!-- Media in flow (no text overlay) -->
          <div style="width:100%;margin-top:24px;border-radius:16px;border:1px solid #f1f5f9;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.02);overflow:hidden;box-sizing:border-box;">
            ${heroMediaVisualHtml(props, 'inline')}
          </div>
        </div>

        <!-- Form Column -->
        <div style="width:100%;max-width:448px;display:flex;justify-content:center;box-sizing:border-box;margin:0 auto;order:${reversed ? 1 : 2};">
          ${formCard}
        </div>
      </div>
      <style>
        @media (min-width: 1024px) {
          .showroom-grid {
            grid-template-columns: 7fr 5fr !important;
          }
        }
      </style>
    </section>
  `;
}

export function heroMosaicBlockHtml(props: any, ctx: ExportContext, _theme: any): string {
  const badgeText = props.badgeText ?? '';
  const title = props.title ?? '';
  const description = props.description ?? '';
  const priceAppel = props.priceAppel ?? '';
  const paddingTop = props.paddingTop ?? 96;
  const paddingBottom = props.paddingBottom ?? 96;
  const colorBgSection = props.colorBgSection ?? '#090d16';
  const formLayout = props.mosaicFormLayout ?? 'side';
  const reversed = !!props.layoutReversed;

  const badgeHtml = badgeText ? `
    <span style="color:#ffffff;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.08em;width:fit-content;display:inline-block;text-transform:uppercase;">
      ${esc(badgeText)}
    </span>
  ` : '';

  const priceHtml = priceAppel ? `
    <div style="display:flex;flex-direction:column;gap:2px;box-sizing:border-box;">
      <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">À partir de</span>
      <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${esc(priceAppel)}</span>
    </div>
  ` : '';

  const formCard = renderFormCardHtml(props, ctx, false);
  const mediaHtml = heroMediaVisualHtml(props, 'inline');

  if (formLayout === 'below') {
    return `
    <section
      id="mosaic_hero"
      style="width:100%;box-sizing:border-box;background-color:${esc(colorBgSection)};color:#ffffff;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);padding-top:${paddingTop}px;padding-bottom:${paddingBottom}px;position:relative;overflow:hidden;"
    >
      <div style="max-width:960px;margin:0 auto;width:100%;padding:0 5%;box-sizing:border-box;display:flex;flex-direction:column;gap:40px;">
        <div style="display:flex;flex-direction:column;gap:20px;text-align:left;">
          ${brandLogoHtml(props)}
          ${badgeHtml}
          <h1 style="font-size:clamp(2rem, 4.5vw, 2.75rem);font-weight:700;line-height:1.15;margin:0;letter-spacing:-0.025em;color:#ffffff;">${esc(title)}</h1>
          <p style="font-size:16px;color:rgba(255,255,255,0.72);line-height:1.65;margin:0;max-width:650px;">${esc(description)}</p>
          ${priceHtml}
          ${mediaHtml}
        </div>
        <div style="width:100%;max-width:420px;margin:0 auto;">${formCard}</div>
      </div>
      <style>@media (max-width: 768px) { .mosaic-image-container { height: 320px !important; } }</style>
    </section>`;
  }

  return `
    <section
      id="mosaic_hero"
      style="width:100%;box-sizing:border-box;background-color:${esc(colorBgSection)};color:#ffffff;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);padding-top:${paddingTop}px;padding-bottom:${paddingBottom}px;position:relative;overflow:hidden;"
    >
      <div style="max-width:1280px;margin:0 auto;width:100%;padding:0 5%;box-sizing:border-box;display:grid;grid-template-columns:1fr;gap:48px;align-items:center;" class="mosaic-grid">
        <!-- Text & Media Column -->
        <div style="display:flex;flex-direction:column;gap:24px;text-align:left;box-sizing:border-box;order:${reversed ? 2 : 1};">
          ${brandLogoHtml(props)}
          ${badgeHtml}
          <h1 style="font-size:clamp(2.2rem, 5vw, 3.2rem);font-weight:900;line-height:1.15;margin:0;letter-spacing:-0.025em;color:#ffffff;">
            ${esc(title)}
          </h1>
          <p style="font-size:16px;color:#cbd5e1;line-height:1.6;margin:0;max-width:650px;">
            ${esc(description)}
          </p>
          ${priceHtml}

          <div style="margin-top:24px;">${mediaHtml}</div>
        </div>

        <!-- Form Column -->
        <div style="width:100%;max-width:448px;display:flex;justify-content:center;box-sizing:border-box;margin:0 auto;order:${reversed ? 1 : 2};">
          ${formCard}
        </div>
      </div>
      <style>
        @media (min-width: 1024px) {
          .mosaic-grid {
            grid-template-columns: 7fr 5fr !important;
          }
        }
        @media (max-width: 768px) {
          .mosaic-image-container {
            height: 320px !important;
          }
        }
      </style>
    </section>
  `;
}

export function heroCinematicBlockHtml(props: any, ctx: ExportContext, _theme: any): string {
  const badgeText = props.badgeText ?? '';
  const title = props.title ?? '';
  const description = props.description ?? '';
  const priceAppel = props.priceAppel ?? '';
  const bgOverlayOpacity = props.bgOverlayOpacity ?? 60;
  const paddingTop = props.paddingTop ?? 96;
  const paddingBottom = props.paddingBottom ?? 96;
  const colorBgSection = props.colorBgSection ?? '#000000';
  const colorText = props.colorText ?? '#ffffff';
  const minHeight = props.cinematicMinHeight === 'screen' ? '100vh' : '80vh';
  const useGlassForm = (props.formCardStyle ?? 'glass') === 'glass';
  const reversed = !!props.layoutReversed;

  const overlayGradient = `linear-gradient(180deg, rgba(0,0,0,${(bgOverlayOpacity / 100 * 0.35).toFixed(2)}) 0%, rgba(0,0,0,${(bgOverlayOpacity / 100).toFixed(2)}) 100%)`;

  const badgeHtml = badgeText ? `
    <span style="background:rgba(255, 255, 255, 0.08);border:1px solid rgba(255, 255, 255, 0.15);padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${esc(colorText)};width:fit-content;display:inline-block;text-transform:uppercase;">
      ${esc(badgeText)}
    </span>
  ` : '';

  const priceHtml = priceAppel ? `
    <div style="display:flex;flex-direction:column;gap:4px;box-sizing:border-box;margin-top:12px;">
      <span style="font-size:11px;color:${esc(colorText)};opacity:0.7;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">À partir de</span>
      <span style="font-size:28px;font-weight:800;color:${esc(colorText)};letter-spacing:-0.02em;text-shadow:0 1px 4px rgba(0,0,0,0.4);">${esc(priceAppel)}</span>
    </div>
  ` : '';

  const formCard = renderFormCardHtml(props, ctx, useGlassForm);

  return `
    <section
      id="cinematic_hero"
      style="width:100%;box-sizing:border-box;background-color:${esc(colorBgSection)};font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);padding-top:${paddingTop}px;padding-bottom:${paddingBottom}px;position:relative;overflow:hidden;min-height:${minHeight};display:flex;align-items:center;"
    >
      <!-- Background media -->
      <div style="position:absolute;inset:0;width:100%;height:100%;z-index:0;">
        ${heroMediaVisualHtml(props, 'background')}
      </div>

      <!-- Overlay -->
      <div
        style="position:absolute;inset:0;background-image:${overlayGradient};z-index:0;pointer-events:none;"
      ></div>

      <div style="position:relative;z-index:1;max-width:1280px;margin:0 auto;width:100%;padding:0 5%;box-sizing:border-box;display:grid;grid-template-columns:1fr;gap:48px;align-items:center;" class="cinematic-grid">
        <!-- Text Column -->
        <div style="color:${esc(colorText)};text-align:left;display:flex;flex-direction:column;gap:16px;box-sizing:border-box;order:${reversed ? 2 : 1};">
          ${brandLogoHtml(props)}
          ${badgeHtml}
          <h1 style="font-size:clamp(2.2rem, 5vw, 3.2rem);font-weight:900;line-height:1.15;margin:0;letter-spacing:-0.025em;color:inherit;text-shadow:0 2px 8px rgba(0,0,0,0.5);">
            ${esc(title)}
          </h1>
          <p style="font-size:16px;color:inherit;opacity:0.9;line-height:1.6;margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.4);max-width:650px;">
            ${esc(description)}
          </p>
          ${priceHtml}
        </div>

        <!-- Form Column -->
        <div style="width:100%;max-width:448px;display:flex;justify-content:center;box-sizing:border-box;margin:0 auto;order:${reversed ? 1 : 2};">
          ${formCard}
        </div>
      </div>
      <style>
        @media (min-width: 1024px) {
          .cinematic-grid {
            grid-template-columns: 7fr 5fr !important;
          }
        }
      </style>
    </section>
  `;
}

export function heroFormUnifiedBlockHtml(props: any, ctx: ExportContext, _theme: any): string {
  // const _logoImage = props.logoImage ?? null;
  const badgeText = props.badgeText ?? '';
  const title = props.title ?? '';
  const description = props.description ?? '';
  const priceAppel = props.priceAppel ?? '';
  const autoHallApiUrl = props.autoHallApiUrl ?? '';
  const syncToAutoHallBase = props.syncToAutoHallBase ?? false;
  const localApiUrl = ctx.apiBaseUrl ?? 'http://localhost:3000';
  const exportCampaignId    = esc(ctx.campaignId    ?? '');
  const exportLandingPageId = esc(ctx.landingPageId ?? '');
  const exportPageVersionId = esc(ctx.pageVersionId ?? '');
  const modelsList = props.modelsList ?? [];
  const villesList = props.villesList ?? [];
  const layoutMode = props.layoutMode ?? 'stacked-immersive';
  const isCentered = layoutMode === 'stacked-immersive';
  const vehicleImage = props.vehicleImage ?? null;
  const paddingTop = props.paddingTop ?? 64;
  const paddingBottom = props.paddingBottom ?? 64;
  const colorPrimary = props.colorPrimary ?? '#005bc4';
  const colorText = props.colorText ?? '#ffffff';
  const colorBgSection = props.colorBgSection ?? '#090d16';
  const borderRadiusButtons = props.borderRadiusButtons ?? 8;
  const cardBorderRadius = Math.min(32, borderRadiusButtons + 12);
  const bgOverlayOpacity = props.bgOverlayOpacity ?? 45;
  
  const step1Title = props.step1Title ?? 'Sélectionnez le véhicule';
  const step2Title = props.step2Title ?? 'Disponibilité';
  const step3Title = props.step3Title ?? 'Coordonnées';
  const btnNextLabel = props.btnNextLabel ?? 'Suivant';
  const btnBackLabel = props.btnBackLabel ?? 'Retour';
  const btnSubmitLabel = props.btnSubmitLabel ?? 'Valider';

  const dotColor = colorPrimary;
  const borderRadiusStyle = `${borderRadiusButtons}px`;

  const dotsHtml = [0, 1, 2].map(idx => {
    const activeBg = idx === 0 ? dotColor : '#cbd5e1';
    return `<span data-dot="${idx}" style="width:10px;height:10px;border-radius:50%;background:${activeBg};cursor:pointer;transition:all 200ms ease;"></span>`;
  }).join('');

  const step1OptionsHtml = modelsList.map((m: string) => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
  const step2CitiesHtml = villesList.map((v: string) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');

  const stepsHtml = `
    <div data-step="0" style="display:block;">
      <h3 style="font-size:16px;font-weight:800;color:#0f172a;text-align:center;margin:0 0 18px;line-height:1.3;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);">${esc(step1Title)}</h3>
      <div style="display:flex;flex-direction:column;gap:6px;width:100%;margin-bottom:16px;">
        <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Modèle</label>
        <div class="luxury-select-wrapper-${props.id || 'hero'}">
          <select name="model" class="luxury-select-${props.id || 'hero'}">
            ${step1OptionsHtml}
          </select>
          <div class="luxury-select-arrow-${props.id || 'hero'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>
      <button type="button" data-next class="luxury-btn-primary-${props.id || 'hero'}" style="margin-top:10px;background:${dotColor};box-shadow:0 4px 14px ${dotColor}40;">${esc(btnNextLabel)}</button>
    </div>
    
    <div data-step="1" style="display:none;">
      <h3 style="font-size:16px;font-weight:800;color:#0f172a;text-align:center;margin:0 0 18px;line-height:1.3;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);">${esc(step2Title)}</h3>
      <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:16px;">
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Ville</label>
          <div class="luxury-select-wrapper-${props.id || 'hero'}">
            <select name="city" class="luxury-select-${props.id || 'hero'}">
              ${step2CitiesHtml}
            </select>
            <div class="luxury-select-arrow-${props.id || 'hero'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Date préférée pour l'essai</label>
          <input type="date" name="date" class="luxury-input-${props.id || 'hero'}" />
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:10px;">
        <button type="button" data-back class="luxury-btn-secondary-${props.id || 'hero'}">${esc(btnBackLabel)}</button>
        <button type="button" data-next class="luxury-btn-primary-${props.id || 'hero'}" style="flex:1;background:${dotColor};box-shadow:0 4px 14px ${dotColor}40;">${esc(btnNextLabel)}</button>
      </div>
    </div>
    
    <div data-step="2" style="display:none;">
      <h3 style="font-size:16px;font-weight:800;color:#0f172a;text-align:center;margin:0 0 18px;line-height:1.3;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);">${esc(step3Title)}</h3>
      <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:16px;">
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Nom Complet *</label>
          <input type="text" name="name" required placeholder="Entrez votre nom" class="luxury-input-${props.id || 'hero'}" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Téléphone *</label>
          <input type="tel" name="phone" required placeholder="Ex: 06 00 00 00 00" class="luxury-input-${props.id || 'hero'}" />
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-start;margin:4px 0 16px;">
        <input type="checkbox" required style="margin-top:2px;accent-color:${dotColor};cursor:pointer;" />
        <span style="font-size:10px;color:#64748b;line-height:1.4;">En soumettant ce formulaire, j'accepte le traitement de mes données.</span>
      </div>
      <div style="display:flex;gap:10px;margin-top:10px;">
        <button type="button" data-back class="luxury-btn-secondary-${props.id || 'hero'}">${esc(btnBackLabel)}</button>
        <button type="button" data-submit class="luxury-btn-primary-${props.id || 'hero'}" style="flex:1;background:${dotColor};box-shadow:0 4px 14px ${dotColor}40;">${esc(btnSubmitLabel)}</button>
      </div>
    </div>
  `;

  const isMultiStep = (props.formMode ?? 'multi-step') === 'multi-step';
  const singleStepTitle = props.singleStepTitle ?? 'Demande de rappel rapide';

  const singleStepHtml = `
    <div style="display:block;">
      <h3 style="font-size:16px;font-weight:800;color:#0f172a;text-align:center;margin:0 0 18px;line-height:1.3;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);">${esc(singleStepTitle)}</h3>
      <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:16px;">
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Modèle</label>
          <div class="luxury-select-wrapper-${props.id || 'hero'}">
            <select name="model" class="luxury-select-${props.id || 'hero'}">
              ${step1OptionsHtml}
            </select>
            <div class="luxury-select-arrow-${props.id || 'hero'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Ville</label>
          <div class="luxury-select-wrapper-${props.id || 'hero'}">
            <select name="city" class="luxury-select-${props.id || 'hero'}">
              ${step2CitiesHtml}
            </select>
            <div class="luxury-select-arrow-${props.id || 'hero'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Date préférée pour l'essai</label>
          <input type="date" name="date" class="luxury-input-${props.id || 'hero'}" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Nom Complet *</label>
          <input type="text" name="name" required placeholder="Entrez votre nom" class="luxury-input-${props.id || 'hero'}" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <label style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">Téléphone *</label>
          <input type="tel" name="phone" required placeholder="Ex: 06 00 00 00 00" class="luxury-input-${props.id || 'hero'}" />
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-start;margin:4px 0 16px;">
        <input type="checkbox" required style="margin-top:2px;accent-color:${dotColor};cursor:pointer;" />
        <span style="font-size:10px;color:#64748b;line-height:1.4;">En soumettant ce formulaire, j'accepte le traitement de mes données.</span>
      </div>
      <button type="button" data-submit class="luxury-btn-primary-${props.id || 'hero'}" style="margin-top:10px;background:${dotColor};box-shadow:0 4px 14px ${dotColor}40;">${esc(btnSubmitLabel)}</button>
    </div>
  `;

  const cleanVehicleImage = sanitizeUrl(vehicleImage) || 'https://www.autohall.ma/sites/default/files/styles/brand_landing_hero/public/chery-brand-banner.jpg';
  /** Voile d'assombrissement premium — vignette dégradée plutôt qu'un aplat plat. */
  const overlayGradient = `linear-gradient(180deg, rgba(0,0,0,${(bgOverlayOpacity / 100 * 0.6).toFixed(2)}) 0%, rgba(0,0,0,${(bgOverlayOpacity / 100).toFixed(2)}) 100%)`;

  const cardStyleAttr = `width:100%;max-width:448px;background:#ffffff;border-radius:${cardBorderRadius}px;box-shadow:0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.12);overflow:hidden;display:flex;flex-direction:column;border:1px solid rgba(15,23,42,0.06);z-index:1;box-sizing:border-box;`;

  const logoHtml = `
    <span style="font-size:18px;font-weight:900;color:${esc(colorText)};letter-spacing:-0.03em;margin-bottom:12px;display:block;">Auto Hall</span>
  `;

  const heroInfoHtml = `
    <div style="display:flex;flex-direction:column;gap:16px;z-index:1;color:${esc(colorText)};max-width:550px;text-align:${isCentered ? 'center' : 'left'};align-items:${isCentered ? 'center' : 'flex-start'};box-sizing:border-box;">
      ${logoHtml}
      ${badgeText ? `
        <span style="background:rgba(255, 255, 255, 0.08);border:1px solid rgba(255, 255, 255, 0.15);padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${colorText === '#ffffff' ? '#ffffff' : colorPrimary};width:fit-content;box-sizing:border-box;display:inline-block;">
          ${esc(badgeText)}
        </span>
      ` : ''}
      <h1 style="font-size:clamp(2.2rem, 5vw, 3.2rem);font-weight:800;line-height:1.15;margin:0;letter-spacing:-0.025em;color:inherit;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);text-shadow:0 2px 8px rgba(0,0,0,0.5);">
        ${esc(title)}
      </h1>
      <p style="font-size:16px;color:${esc(colorText)};opacity:0.9;line-height:1.6;margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.4);">
        ${esc(description)}
      </p>
      ${priceAppel ? `
        <div style="display:flex;flex-direction:column;gap:4px;box-sizing:border-box;">
          <span style="font-size:11px;color:${esc(colorText)};opacity:0.7;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
            À partir de
          </span>
          <span style="font-size:28px;font-weight:800;color:${esc(colorText)};letter-spacing:-0.02em;text-shadow:0 1px 4px rgba(0,0,0,0.4);">
            ${esc(priceAppel)}
          </span>
        </div>
      ` : ''}
    </div>
  `;

  const formCardHtml = isMultiStep ? `
    <div class="lp-multi-form" data-multi-form data-accent="${esc(dotColor)}" data-submission-mode="DATABASE" data-campaign-id="${exportCampaignId}" data-landing-page-id="${exportLandingPageId}" data-local-api="${esc(localApiUrl)}" data-sync-autohall="${syncToAutoHallBase ? 'true' : 'false'}" data-autohall-api="${esc(autoHallApiUrl)}" data-campaign="${exportCampaignId}" data-lp="${exportLandingPageId}" data-pv="${exportPageVersionId}" style="${cardStyleAttr}position:relative;">
      <!-- Stepper progress bar -->
      <div style="width: 100%; height: 5px; background: #cbd5e1; position: relative;">
        <div data-progress style="width: 33.33%; height: 100%; background: ${esc(dotColor)}; transition: width 250ms ease;"></div>
      </div>

      <!-- Form Content -->
      <div style="padding:24px;color:#0f172a;display:flex;flex-direction:column;gap:20px;box-sizing:border-box;">
        <div data-form-container>
          <!-- Stepper Header -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:20px;">
            <span data-step-indicator style="font-size:12px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.08em;">
              ÉTAPE 1/3
            </span>
            
            <!-- Stepper Dots -->
            <div data-stepper style="display:flex;gap:8px;">
              ${dotsHtml}
            </div>
          </div>

          <form class="lead-multi-step-form" style="margin:0;">
            ${stepsHtml}
          </form>
        </div>

        <!-- Success message -->
        <div data-success style="display:none;text-align:center;padding:24px 0;">
          <div style="width:56px;height:56px;border-radius:50%;background:#d1fae5;color:#059669;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">✓</div>
          <h3 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 8px;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);">Demande Envoyée !</h3>
          <p style="font-size:14px;color:#64748b;margin:0;line-height:1.5;">Merci pour votre demande. Un conseiller vous contactera sous 24 heures.</p>
        </div>
        
        <!-- Error message -->
        <div data-error style="display:none;text-align:center;padding:12px;background:#fee2e2;color:#b91c1c;border-radius:8px;font-size:13px;font-weight:500;">
          Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.
        </div>
      </div>
    </div>
  ` : `
    <div class="lp-single-form" data-single-form data-accent="${esc(dotColor)}" data-submission-mode="DATABASE" data-campaign-id="${exportCampaignId}" data-landing-page-id="${exportLandingPageId}" data-local-api="${esc(localApiUrl)}" data-sync-autohall="${syncToAutoHallBase ? 'true' : 'false'}" data-autohall-api="${esc(autoHallApiUrl)}" data-campaign="${exportCampaignId}" data-lp="${exportLandingPageId}" data-pv="${exportPageVersionId}" style="${cardStyleAttr}position:relative;">
      <!-- Form Content -->
      <div style="padding:24px;color:#0f172a;display:flex;flex-direction:column;gap:20px;box-sizing:border-box;">
        <div data-form-container>
          <form class="lead-single-step-form" style="margin:0;">
            ${singleStepHtml}
          </form>
        </div>

        <!-- Success message -->
        <div data-success style="display:none;text-align:center;padding:24px 0;">
          <div style="width:56px;height:56px;border-radius:50%;background:#d1fae5;color:#059669;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">✓</div>
          <h3 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 8px;font-family:var(--brand-font, 'Outfit', 'Inter', sans-serif);">Demande Envoyée !</h3>
          <p style="font-size:14px;color:#64748b;margin:0;line-height:1.5;">Merci pour votre demande. Un conseiller vous contactera sous 24 heures.</p>
        </div>
        
        <!-- Error message -->
        <div data-error style="display:none;text-align:center;padding:12px;background:#fee2e2;color:#b91c1c;border-radius:8px;font-size:13px;font-weight:500;">
          Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.
        </div>
      </div>
    </div>
  `;

  const styleBlock = `
<style>
  .luxury-input-${props.id || 'hero'} {
    height: 46px;
    padding: 0 16px;
    border: 1px solid #cbd5e1;
    border-radius: ${borderRadiusStyle};
    font-size: 14px;
    color: #09090b;
    background-color: #ffffff;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .luxury-select-wrapper-${props.id || 'hero'} {
    position: relative;
    width: 100%;
    box-sizing: border-box;
  }
  .luxury-select-${props.id || 'hero'} {
    appearance: none;
    -webkit-appearance: none;
    height: 46px;
    padding: 0 16px;
    padding-right: 40px;
    border: 1px solid #cbd5e1;
    border-radius: ${borderRadiusStyle};
    font-size: 14px;
    color: #09090b;
    background-color: #ffffff;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    cursor: pointer;
  }
  .luxury-select-arrow-${props.id || 'hero'} {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #cbd5e1;
  }
  .luxury-btn-primary-${props.id || 'hero'} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    background: #005bc4;
    color: #ffffff;
    border: none;
    border-radius: ${borderRadiusStyle};
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 91, 196, 0.3);
    font-family: inherit;
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
    width: 100%;
  }
  .luxury-btn-primary-${props.id || 'hero'}:hover {
    opacity: 0.9;
  }
  .luxury-btn-secondary-${props.id || 'hero'} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    background: #e2e8f0;
    color: #475569;
    border: none;
    border-radius: ${borderRadiusStyle};
    font-weight: 600;
    font-size: 14px;
    padding: 0 20px;
    cursor: pointer;
    font-family: inherit;
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .luxury-btn-secondary-${props.id || 'hero'}:hover {
    background-color: #cbd5e1;
    color: #1e293b;
  }
  .luxury-btn-secondary-${props.id || 'hero'}:active {
    transform: scale(0.98);
  }
</style>`;

  // Split Classique — fond image plein cadre, texte à gauche / formulaire à droite.
  if (layoutMode === 'split-classic') {
    const badgeHtml = badgeText ? `
      <span class="text-xs uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/20 inline-block font-bold" style="color: #ffffff; background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); font-size: 12px; letter-spacing: 0.1em;">
        ${esc(badgeText)}
      </span>
    ` : `
      <span class="text-xs uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/20 inline-block font-bold" style="color: #ffffff; background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); font-size: 12px; letter-spacing: 0.1em;">
        Auto Hall
      </span>
    `;

    const priceHtml = priceAppel ? `
      <div style="margin-top:8px;box-sizing:border-box;">
        <p style="font-size:11px;text-transform:uppercase;color:#cbd5e1;font-weight:600;letter-spacing:0.05em;margin:0 0 4px;">À partir de</p>
        <p style="font-size:30px;font-weight:900;color:#ffffff;margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.4);">${esc(priceAppel)}</p>
      </div>
    ` : '';

    return `
      ${styleBlock}
      <section
        id="form_test_drive_modele"
        style="position:relative;overflow:hidden;min-height:85vh;background-image:url('${esc(cleanVehicleImage)}');background-size:cover;background-position:center;background-repeat:no-repeat;display:flex;align-items:center;box-sizing:border-box;font-family:var(--brand-font, inherit);padding-top:${paddingTop}px;padding-bottom:${paddingBottom}px;width:100%;"
      >
        <!-- Overlay pour le contraste -->
        <div
          style="position:absolute;inset:0;background-image:${overlayGradient};z-index:0;pointer-events:none;"
        ></div>

        <div style="position:relative;z-index:1;max-width:1280px;margin:0 auto;width:100%;padding:0 5%;box-sizing:border-box;display:grid;grid-template-columns:1fr;gap:32px;align-items:center;">
          <!-- Bloc Texte à gauche -->
          <div style="color:#ffffff;text-align:left;display:flex;flex-direction:column;gap:16px;box-sizing:border-box;">
            <div style="display:block;">${badgeHtml}</div>
            <h1 style="font-size:clamp(2.2rem, 5vw, 3.2rem);font-weight:800;line-height:1.15;margin:0;letter-spacing:-0.025em;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.5);">
              ${esc(title)}
            </h1>
            <p style="font-size:16px;color:#e4e4e7;opacity:0.95;line-height:1.6;margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.4);max-width:550px;">
              ${esc(description)}
            </p>
            ${priceHtml}
          </div>

          <!-- Bloc Formulaire -->
          <div style="width:100%;max-width:448px;display:flex;justify-content:center;box-sizing:border-box;">
            ${formCardHtml}
          </div>
        </div>
      </section>
    `;
  }

  // Stacked Immersif — fond image plein cadre, contenu centré (texte + carte empilés).
  return `
    ${styleBlock}
    <section
      id="form_test_drive_modele"
      style="width:100%;min-height:85vh;display:flex;align-items:center;justify-content:center;box-sizing:border-box;background-image:url('${esc(cleanVehicleImage)}');background-color:${esc(colorBgSection)};background-size:cover;background-position:center;background-repeat:no-repeat;padding:${paddingTop}px 5% ${paddingBottom}px;font-family:var(--brand-font, inherit);position:relative;overflow:hidden;"
    >
      <div
        style="position:absolute;inset:0;background-image:${overlayGradient};z-index:0;"
      ></div>

      <div style="position:relative;z-index:1;width:100%;max-width:640px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:32px;box-sizing:border-box;">
        ${heroInfoHtml}
        <div style="display:flex;justify-content:center;width:100%;box-sizing:border-box;">
          ${formCardHtml}
        </div>
      </div>
    </section>
  `;
}

export function specsGridBlockHtml(props: any): string {
  const specs = (props.specs ?? []).filter((s: any) => !s.hidden);
  
  const ICONS: Record<string, string> = {
    Zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    Cpu: 'M4 4h16v16H4V4z M9 9h6v6H9V9z',
    Star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    Award: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.21 13.89L7 23l5-3 5 3-1.21-9.12',
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    Check: 'M20 6L9 17l-5-5',
    Download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    Phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.04 2h3a2 2 0 0 1 2 1.72',
    Clock: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
  };

  const specsHtml = specs.map((s: any) => {
    const path = ICONS[s.icon] ?? ICONS.Star;
    return `<div style="padding:24px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;gap:16px;box-sizing:border-box;">
      <div style="width:44px;height:44px;border-radius:10px;background:rgba(40,143,227,0.1);display:flex;align-items:center;justify-content:center;color:#288fe3;flex-shrink:0;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>
      </div>
      <div style="display:flex;flex-direction:column;gap:2px;">
        <span style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;">${esc(s.label)}</span>
        <span style="font-size:15px;font-weight:700;color:#0f172a;">${esc(s.value)}</span>
      </div>
    </div>`;
  }).join('');

  return `<section style="width:100%;background:#ffffff;font-family:Outfit,Inter,sans-serif;padding:80px 5%;box-sizing:border-box;">
    <div style="max-width:1200px;margin:0 auto;">
      ${props.title ? `<h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);font-weight:800;color:#0f172a;text-align:center;letter-spacing:-0.02em;margin:0 0 48px;">${esc(props.title)}</h2>` : ''}
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
        ${specsHtml}
      </div>
    </div>
  </section>`;
}

const MODEL_SHOWCASE_RADIUS_PX: Record<string, number> = { sm: 6, md: 12, lg: 24 };
const MODEL_SHOWCASE_GAP_PX: Record<string, number> = { compact: 4, standard: 8, large: 16 };

export function modelShowcaseGalleryBlockHtml(props: any): string {
  const blockId = props.id || 'model-showcase-gallery';
  const fallbackMain = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80';
  const fallbackThumbs = [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'
  ];

  const mainSrcRaw = sanitizeUrl(props.mainImage);
  const mainSrc = (mainSrcRaw && mainSrcRaw !== NEUTRAL_VEHICLE_PLACEHOLDER) ? mainSrcRaw : fallbackMain;
  const mainAlt = props.mainImageAlt || 'Vue principale';
  const thumbs = [1, 2, 3, 4].map((n) => {
    const rawVal = sanitizeUrl(props[`thumbImage${n}`]);
    const src = (rawVal && rawVal !== NEUTRAL_VEHICLE_PLACEHOLDER) ? rawVal : fallbackThumbs[n - 1];
    return {
      src,
      alt: props[`thumbImage${n}Alt`] || `Détail du véhicule ${n}`,
    };
  });
  const radiusPx = MODEL_SHOWCASE_RADIUS_PX[props.borderRadius ?? 'md'] ?? 12;
  const gapPx = MODEL_SHOWCASE_GAP_PX[props.gap ?? 'standard'] ?? 8;

  const images = [{ src: mainSrc, alt: mainAlt }, ...thumbs];
  const lightboxImagesJson = esc(JSON.stringify(images));

  const thumbsHtml = thumbs.map((thumb, idx) => `
      <a href="#" class="item-media-last-item popup-gallery item-media-last-item-${blockId}" data-lightbox-open="${idx + 1}">
        <img src="${esc(thumb.src)}" alt="${esc(thumb.alt)}" class="gallery-img-${blockId}" style="width:100%;height:100%;object-fit:cover;display:block;" />
      </a>`).join('');

  return `
<style>
  .gallery-container-modele-${blockId} {
    width: 100%;
    background: #ffffff;
    font-family: var(--brand-font, 'Outfit', 'Inter', sans-serif);
    box-sizing: border-box;
  }
  .gallery-grid-${blockId} {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: ${gapPx}px;
    width: 100%;
  }
  @media (min-width: 768px) {
    .gallery-grid-${blockId} {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      height: 460px;
    }
    .item-media-first-${blockId} {
      grid-column: span 2 / span 2;
      height: 100%;
    }
    .item-media-last-${blockId} {
      grid-column: span 2 / span 2;
      height: 100%;
    }
  }
  .item-media-first-${blockId} {
    position: relative;
    height: 300px;
    overflow: hidden;
    border-radius: ${radiusPx}px;
  }
  .item-media-last-${blockId} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: ${gapPx}px;
    height: 300px;
  }
  .item-media-last-item-${blockId} {
    width: 100%;
    height: 100%;
    border-radius: ${radiusPx}px;
    overflow: hidden;
    display: block;
  }
  .gallery-img-${blockId} {
    transition: transform 500ms ease, filter 500ms ease;
  }
  .gallery-img-${blockId}:hover {
    transform: scale(1.03);
    filter: brightness(1.05);
  }
  .afficher_toutes_photos-${blockId} {
    position: absolute;
    bottom: 16px;
    left: 16px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    text-decoration: none;
    transition: background 200ms;
  }
  .afficher_toutes_photos-${blockId}:hover {
    background: rgba(0, 0, 0, 0.7);
  }
</style>
<section class="gallery-container-modele gallery-container-modele-${blockId}" data-gallery-images="${lightboxImagesJson}">
  <div class="gallery-container gallery-grid gallery-grid-${blockId}">
    <div class="gallery-grid-item item-media-first item-media-first-${blockId}">
      <a href="#" class="popup-gallery" data-lightbox-open="0" style="display:block;width:100%;height:100%;cursor:pointer;">
        <img src="${esc(mainSrc)}" alt="${esc(mainAlt)}" class="gallery-img-${blockId}" style="width:100%;height:100%;object-fit:cover;display:block;" />
      </a>
      <button class="afficher_toutes_photos afficher_toutes_photos-${blockId}" type="button" data-lightbox-open="0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        ${esc(props.buttonText || 'Afficher toutes les photos')}
      </button>
    </div>
    <div class="gallery-grid-item item-media-last item-media-last-${blockId}">${thumbsHtml}
    </div>
  </div>
</section>
<script>
(function() {
  var wrapper = document.currentScript ? document.currentScript.previousElementSibling : null;
  if (!wrapper) return;
  var images = [];
  try { images = JSON.parse(wrapper.getAttribute('data-gallery-images') || '[]'); } catch (e) {}
  if (!images.length) return;

  var current = 0;
  var overlay = null;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;';
    overlay.innerHTML =
      '<button type="button" aria-label="Fermer" data-lb-close style="position:absolute;top:20px;right:24px;background:transparent;border:none;color:#fff;cursor:pointer;padding:8px;font-size:28px;line-height:1;">&times;</button>' +
      (images.length > 1 ? '<button type="button" aria-label="Précédente" data-lb-prev style="position:absolute;left:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:44px;height:44px;color:#fff;cursor:pointer;font-size:20px;">&#8249;</button>' : '') +
      '<img data-lb-img style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:4px;" />' +
      (images.length > 1 ? '<button type="button" aria-label="Suivante" data-lb-next style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:44px;height:44px;color:#fff;cursor:pointer;font-size:20px;">&#8250;</button>' : '') +
      '<span data-lb-counter style="color:#fff;font-size:13px;opacity:0.8;"></span>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeLightbox(); });
    overlay.querySelector('[data-lb-close]').addEventListener('click', closeLightbox);
    var prevBtn = overlay.querySelector('[data-lb-prev]');
    var nextBtn = overlay.querySelector('[data-lb-next]');
    if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); current = (current - 1 + images.length) % images.length; render(); });
    if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); current = (current + 1) % images.length; render(); });
  }

  function render() {
    if (!overlay) return;
    var img = images[current];
    var imgEl = overlay.querySelector('[data-lb-img]');
    imgEl.src = img.src;
    imgEl.alt = img.alt || '';
    overlay.querySelector('[data-lb-counter]').textContent = (current + 1) + ' / ' + images.length;
  }

  function openLightbox(idx) {
    current = idx;
    if (!overlay) buildOverlay();
    render();
  }

  function closeLightbox() {
    if (overlay) { overlay.remove(); overlay = null; }
  }

  wrapper.querySelectorAll('[data-lightbox-open]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      openLightbox(parseInt(el.getAttribute('data-lightbox-open'), 10) || 0);
    });
  });
})();
</script>
`;
}

export function modelsGridBlockHtml(props: any): string {
  const models = props.models ?? [];
  const title = props.title ?? 'Nos Modèles';
  const subtitle = props.subtitle ?? 'Découvrez notre sélection de véhicules.';
  const blockId = props.id || 'models-grid';

  const cardsHtml = models.map((model: any) => {
    const badgeHtml = model.badge ? `
      <span style="position:absolute;top:12px;left:12px;background:rgba(0,44,108,0.9);color:#ffffff;font-size:10px;font-weight:800;padding:4px 10px;border-radius:20px;letter-spacing:0.05em;text-transform:uppercase;font-family:inherit;box-sizing:border-box;">
        ${esc(model.badge)}
      </span>
    ` : '';

    return `
      <div class="model-card-premium" style="display:flex;flex-direction:column;border-radius:12px;background:#ffffff;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 4px 6px rgba(0, 0, 0, 0.02);box-sizing:border-box;">
        <div style="width:100%;aspect-ratio:16/10;overflow:hidden;background:#f9fafb;position:relative;box-sizing:border-box;">
          <img src="${esc(model.image)}" alt="${esc(model.name)}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          ${badgeHtml}
        </div>
        <div style="padding:24px;display:flex;flex-direction:column;flex:1;justify-content:space-between;gap:16px;box-sizing:border-box;">
          <div style="display:flex;flex-direction:column;gap:6px;box-sizing:border-box;">
            <h3 style="font-size:18px;font-weight:800;color:#0f172a;margin:0;line-height:1.3;font-family:inherit;">
              ${esc(model.name)}
            </h3>
            <div style="display:flex;flex-direction:column;margin-top:4px;box-sizing:border-box;">
              <span style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                À partir de
              </span>
              <span style="font-size:22px;font-weight:900;color:#002C6C;">
                ${esc(model.price)}
              </span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:auto;box-sizing:border-box;">
            <a href="${esc(model.link)}" class="model-card-btn-primary" style="display:flex;align-items:center;justify-content:center;gap:8px;height:42px;background:#002c6c;color:#ffffff;font-size:13px;font-weight:700;border-radius:8px;text-decoration:none;font-family:inherit;box-sizing:border-box;">
              Voir plus
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-left:4px;"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <a href="#form_test_drive" class="model-card-btn-secondary" style="display:flex;align-items:center;justify-content:center;gap:8px;height:42px;background:#f4f6f8;color:#374151;font-size:13px;font-weight:700;border-radius:8px;text-decoration:none;font-family:inherit;box-sizing:border-box;">
              Réserver un essai
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-left:4px;"><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
<style>
  .models-grid-section-${blockId} {
    width: 100%;
    background: #ffffff;
    font-family: var(--brand-font, 'Outfit', 'Inter', sans-serif);
    padding: 48px 0;
    box-sizing: border-box;
  }
  .models-grid-container-${blockId} {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 16px;
    box-sizing: border-box;
  }
  .models-grid-header-${blockId} {
    text-align: center;
    margin-bottom: 48px;
    box-sizing: border-box;
  }
  .models-grid-title-${blockId} {
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 800;
    color: #002C6C;
    margin: 0 0 12px 0;
    letter-spacing: -0.02em;
    font-family: inherit;
  }
  .models-grid-subtitle-${blockId} {
    font-size: 16px;
    color: #4b5563;
    margin: 0;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
  }
  .models-grid-cards-${blockId} {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    width: 100%;
    box-sizing: border-box;
  }
  .model-card-premium {
    transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .model-card-premium:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06) !important;
    border-color: #d1d5db !important;
  }
  .model-card-btn-primary:hover {
    opacity: 0.9;
  }
  .model-card-btn-secondary:hover {
    background-color: #e5e7eb !important;
  }
  @media (min-width: 768px) {
    .models-grid-cards-${blockId} {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
<section class="models-grid-section-${blockId}">
  <div class="models-grid-container-${blockId}">
    <div class="models-grid-header-${blockId}">
      <h2 class="models-grid-title-${blockId}">${esc(title)}</h2>
      ${subtitle ? `<p class="models-grid-subtitle-${blockId}">${esc(subtitle)}</p>` : ''}
    </div>
    <div class="models-grid-cards-${blockId}">
      ${cardsHtml}
    </div>
  </div>
</section>
`;
}

export function conversionFormSplitBlockHtml(props: any, ctx: ExportContext): string {
  const accent = esc(props.accentColor ?? '#288fe3');
  const benefits = (props.benefits ?? []).filter((b: any) => b.enabled);
  const apiBase = esc(ctx.apiBaseUrl ?? 'http://localhost:3000');
  const cId = esc(ctx.campaignId ?? '');
  const lpId = esc(ctx.landingPageId ?? '');

  const benefitsHtml = benefits.map((b: any) => `
    <li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;">
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(40,143,227,0.15);border:1.5px solid ${accent};display:flex;align-items:center;justify-content:center;color:${accent};flex-shrink:0;font-weight:bold;">✓</div>
      <span style="font-size:15px;color:#e2e8f0;font-weight:500;line-height:1.4;">${esc(b.text)}</span>
    </li>
  `).join('');

  let step1Fields = '';
  if (props.showModel) {
    step1Fields += `<div style="display:flex;flex-direction:column;gap:6px;width:100%;margin-bottom:16px;">
      <label style="font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;">Modèle Souhaité</label>
      <select name="model" style="height:42px;padding:0 10px;border-radius:8px;border:1px solid #cbd5e1;font-size:14px;outline:none;background:#ffffff;width:100%;">
        <option value="Finition Confort">Finition Confort</option>
        <option value="Finition Prestige">Finition Prestige</option>
        <option value="Finition Sport">Finition Sport</option>
      </select>
    </div>`;
  }
  if (props.showCity) {
    step1Fields += `<div style="display:flex;flex-direction:column;gap:6px;width:100%;margin-bottom:16px;">
      <label style="font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;">Ville</label>
      <select name="city" style="height:42px;padding:0 10px;border-radius:8px;border:1px solid #cbd5e1;font-size:14px;outline:none;background:#ffffff;width:100%;">
        <option value="Casablanca">Casablanca</option>
        <option value="Rabat">Rabat</option>
        <option value="Marrakech">Marrakech</option>
      </select>
    </div>`;
  }

  let step2Fields = '';
  if (props.showDate) {
    step2Fields += `<div style="display:flex;flex-direction:column;gap:6px;width:100%;margin-bottom:16px;">
      <label style="font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;">Date souhaitée d'essai</label>
      <input type="date" name="date" style="height:42px;padding:0 10px;border-radius:8px;border:1px solid #cbd5e1;font-size:14px;outline:none;width:100%;box-sizing:border-box;" />
    </div>`;
  }
  if (props.showName) {
    step2Fields += `<div style="display:flex;flex-direction:column;gap:6px;width:100%;margin-bottom:16px;">
      <label style="font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;">Nom Complet *</label>
      <input type="text" name="name" required placeholder="Ex: Yasser Benali" style="height:42px;padding:0 10px;border-radius:8px;border:1px solid #cbd5e1;font-size:14px;outline:none;width:100%;box-sizing:border-box;" />
    </div>`;
  }
  if (props.showPhone) {
    step2Fields += `<div style="display:flex;flex-direction:column;gap:6px;width:100%;margin-bottom:16px;">
      <label style="font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;">Téléphone *</label>
      <input type="tel" name="phone" required placeholder="06 00 00 00 00" style="height:42px;padding:0 10px;border-radius:8px;border:1px solid #cbd5e1;font-size:14px;outline:none;width:100%;box-sizing:border-box;" />
    </div>`;
  }

  step2Fields += `<div style="display:flex;gap:8px;align-items:flex-start;margin:12px 0 16px;">
    <input type="checkbox" required style="margin-top:2px;accent-color:${accent};cursor:pointer;" />
    <span style="font-size:11px;color:#64748b;line-height:1.4;">${esc(props.gdprConsent)}</span>
  </div>`;

  return `<section style="width:100%;background:#090d16;font-family:Outfit,Inter,sans-serif;padding:80px 5%;box-sizing:border-box;color:#ffffff;">
    <div style="max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:48px;align-items:center;">
      <div style="flex:1;min-width:320px;display:flex;flex-direction:column;gap:28px;">
        <h2 style="font-size:clamp(1.8rem, 3vw, 2.6rem);font-weight:800;margin:0;letter-spacing:-0.02em;line-height:1.1;">${esc(props.benefitsTitle)}</h2>
        <ul style="list-style:none;padding:0;margin:0;">${benefitsHtml}</ul>
        <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;display:flex;align-items:center;gap:8px;">${esc(props.guaranteeText)}</p>
      </div>
      <div style="flex:1;min-width:320px;display:flex;justify-content:center;">
        <div class="lp-multi-form" data-api="${apiBase}" data-campaign="${cId}" data-lp="${lpId}" style="width:100%;max-width:440px;background:#ffffff;border-radius:20px;padding:32px 28px;color:#0f172a;box-shadow:0 10px 30px rgba(0,0,0,0.25);box-sizing:border-box;overflow:hidden;">
          <div data-stepper style="display:flex;justify-content:center;gap:6px;margin-bottom:16px;">
            <span data-dot="0" style="width:8px;height:8px;border-radius:50%;background:${accent};"></span>
            <span data-dot="1" style="width:8px;height:8px;border-radius:50%;background:#e2e8f0;"></span>
          </div>
          
          <form class="lead-split-form" style="margin:0;">
            <!-- Step 1 -->
            <div data-step="0" style="display:block;">
              <h3 style="font-size:18px;font-weight:800;margin:0 0 16px;color:#0f172a;">Étape 1/2 : Votre Projet</h3>
              ${step1Fields}
              <button type="button" data-next style="width:100%;height:48px;background:${accent};color:#ffffff;border:none;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit;">Continuer →</button>
            </div>
            
            <!-- Step 2 -->
            <div data-step="1" style="display:none;">
              <h3 style="font-size:18px;font-weight:800;margin:0 0 16px;color:#0f172a;">Étape 2/2 : Coordonnées</h3>
              ${step2Fields}
              <div style="display:flex;gap:8px;margin-top:10px;">
                <button type="button" data-back style="height:48px;background:transparent;color:#64748b;border:1px solid #cbd5e1;border-radius:10px;font-weight:600;font-size:14px;padding:0 16px;cursor:pointer;font-family:inherit;">Retour</button>
                <button type="button" data-submit style="flex:1;height:48px;background:${accent};color:#ffffff;border:none;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;">${esc(props.ctaLabel)}</button>
              </div>
            </div>
          </form>
          
          <div data-success style="display:none;text-align:center;padding:24px 0;">
            <div style="width:56px;height:56px;border-radius:50%;background:#d1fae5;color:#059669;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">✓</div>
            <h3 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 8px;">Demande Envoyée !</h3>
            <p style="font-size:14px;color:#64748b;margin:0;line-height:1.5;">Merci pour votre demande. Un conseiller Auto Hall vous contactera sous 24 heures.</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function formHtml(): string {
  return `<form style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:12px;"></form>`;
}

export function fordPromoBlockHtml(props: any, ctx: ExportContext = {}): string {
  const campaignImage = esc(props.campaignImage || '');
  const altText = esc(props.altText || '');
  const FALLBACK_IMG = 'https://fordpromo.myautohall.ma/images/fordvisuelnv.png';
  const formTitle = esc(props.formTitle || 'Contactez-moi');
  const submitLabel = esc(props.submitLabel || 'Envoyer');
  const primaryColor = esc(props.primaryColor || '#2c82e6');
  const formTextColor = esc(props.formTextColor || '#1a2840');
  const cgvUrl = esc(props.cgvUrl || 'https://fr.ford.ma/');
  const logoUrl = esc(props.logoUrl || '');
  
  const villesList = props.villesList?.length ? props.villesList : [...AUTOHALL_OFFICIAL_CITIES];

  const apiBase = esc(ctx.apiBaseUrl ?? '');
  const cid  = esc(ctx.campaignId    || props.campaignId    || '');
  const lpid = esc(ctx.landingPageId || props.landingPageId || '');
  // const pvid = esc(ctx.pageVersionId || props.pageVersionId || '');
  const syncAttr = props.syncToAutoHallBase ? ' data-sync-autohall="true"' : '';
  const autoHallApi = esc(props.apiUrl || '');

  const makeTranslucent = (color: string, opacity: number) => {
    if (!color) return `rgba(255, 255, 255, ${opacity})`;
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      let r = 0, g = 0, b = 0;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+(\.\d+)?/g);
      if (matches && matches.length >= 3) {
        return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${opacity})`;
      }
    }
    return color;
  };

  const opacityLevel = props.opacityLevel || 'semi-transparent';
  const opacityMap: Record<string, number> = {
    transparent: 0.75,
    'semi-transparent': 0.9,
    opaque: 1.0,
  };
  const finalBgColor = makeTranslucent(props.formBackground || 'rgba(139, 169, 203, 0.85)', opacityMap[opacityLevel] ?? 0.9);

  const radiusLevel = props.borderRadius || 'md';
  const radiusMap: Record<string, string> = {
    md: '8px',
    xl: '12px',
    '2xl': '16px',
  };
  const currentRadius = radiusMap[radiusLevel] || '8px';

  const paddingLevel = props.paddingSize || 'normal';
  const paddingMap: Record<string, any> = {
    compact: {
      cardPadding: '16px 18px',
      gap: '6px',
      inputPadding: '9px 12px',
      submitPadding: '9px 12px',
      submitMargin: '8px',
    },
    normal: {
      cardPadding: '24px 24px',
      gap: '9px',
      inputPadding: '12px 14px',
      submitPadding: '11px 16px',
      submitMargin: '12px',
    },
    spacieux: {
      cardPadding: '32px 30px',
      gap: '12px',
      inputPadding: '14px 16px',
      submitPadding: '13px 18px',
      submitMargin: '16px',
    },
  };
  const pData = paddingMap[paddingLevel] || paddingMap.normal;

  const formatLabelOrPlaceholder = (text: string | undefined, required: boolean) => {
    if (!text) return '';
    const cleaned = text.replace(/\s*\*+$/, '').trim();
    return required ? `${cleaned} *` : cleaned;
  };

  // Resolve dynamic active fields
  const fields = (props.fields && props.fields.length > 0 ? props.fields : DEFAULT_FORD_FIELDS).filter((f: any) => f.active !== false);

  const formFieldsHtml = fields.map((field: any) => {
    if (field.type === 'select') {
      return `
          <div class="fp-field">
            <select required name="${esc(field.id)}" class="fp-select">
              <option value="" disabled selected style="color:#94a3b8;">${esc(formatLabelOrPlaceholder(field.label, field.required))}</option>
              ${villesList.map((v: string) => `<option value="${esc(v)}">${esc(v)}</option>`).join('\n              ')}
            </select>
          </div>`;
    }

    const typeAttr = field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text';
    const maxLenAttr = field.type === 'tel' ? ' maxlength="10" oninput="this.value=this.value.replace(/\\\\D/g,\'\')"' : '';
    const reqAttr = field.required ? ' required' : '';
    const placeholderAttr = esc(formatLabelOrPlaceholder(field.placeholder || field.label, field.required));

    return `
          <div class="fp-field">
            <input${reqAttr} type="${typeAttr}" name="${esc(field.id)}"${maxLenAttr} class="fp-input" placeholder="${placeholderAttr}" />
          </div>`;
  }).join('\n');

  return `
<section class="fp-root" style="width:100%;background:#e8ecf0;padding:40px 16px;font-family:'Outfit','Inter',system-ui,sans-serif;--fp-primary:${primaryColor};--fp-radius:${currentRadius};--fp-padding:${pData.cardPadding};--fp-gap:${pData.gap};--fp-input-padding:${pData.inputPadding};--fp-submit-padding:${pData.submitPadding};--fp-submit-margin:${pData.submitMargin};box-sizing:border-box;" data-block="ford-promo">
  <style>
    .fp-root *, .fp-root *::before, .fp-root *::after { box-sizing: border-box; }

    .fp-block {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 1320px;
      margin: 0 auto;
      border-radius: var(--fp-radius, 8px) !important;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
    }
    @media (min-width: 768px) {
      .fp-block { flex-direction: row; align-items: stretch; }
    }

    .fp-img-col {
      flex: 0 0 auto;
      width: 100%;
      min-height: 280px;
      overflow: hidden;
      background: #021833;
    }
    @media (min-width: 768px) {
      .fp-img-col { width: 60%; min-height: unset; }
    }
    .fp-img-col img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .fp-form-col {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      background: ${finalBgColor};
      padding: var(--fp-padding, 24px) 20px 20px;
      min-width: 0;
      transition: all 250ms ease;
    }
    @media (min-width: 768px) {
      .fp-form-col { flex: 0 0 40%; width: 40%; padding: var(--fp-padding, 24px); }
    }

    .fp-form-title {
      font-size: 18px;
      font-weight: 700;
      text-align: center;
      color: ${formTextColor};
      margin: 0 0 16px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .fp-field { display: flex; flex-direction: column; margin-bottom: var(--fp-gap, 9px); }
    .fp-input, .fp-select {
      width: 100%;
      padding: var(--fp-input-padding, 12px 14px);
      font-size: 13.5px;
      color: #1e293b;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: var(--fp-radius, 8px) !important;
      outline: none;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      appearance: none;
      -webkit-appearance: none;
    }
    .fp-input::placeholder { color: #94a3b8; }
    .fp-input:focus, .fp-select:focus {
      border-color: var(--fp-primary, #2c82e6);
      box-shadow: 0 0 0 3px var(--fp-primary-glow, rgba(44,130,230,0.2));
      background: #ffffff;
    }
    .fp-select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 18px;
      padding-right: 36px;
      cursor: pointer;
    }
    .fp-gdpr {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 11px;
      line-height: 1.55;
      color: ${formTextColor};
      margin: 4px 0 0;
    }
    .fp-gdpr input[type="checkbox"] {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
      margin-top: 2px;
      accent-color: ${primaryColor};
      cursor: pointer;
    }
    .fp-legal {
      font-size: 10.5px;
      color: ${formTextColor};
      line-height: 1.75;
      margin: 10px 0 0;
      opacity: 0.85;
    }
    .fp-submit {
      width: 100%;
      padding: var(--fp-submit-padding, 11px 16px);
      margin-top: var(--fp-submit-margin, 12px);
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      letter-spacing: 0.04em;
      color: #ffffff;
      background: ${primaryColor};
      border: none;
      border-radius: var(--fp-radius, 8px) !important;
      cursor: pointer;
      transition: background 180ms ease, transform 120ms ease, box-shadow 180ms ease;
      box-shadow: 0 2px 8px rgba(44, 130, 230, 0.25);
    }
    .fp-submit:hover:not(:disabled) {
      filter: brightness(0.9);
      box-shadow: 0 4px 14px rgba(44,130,230,0.35);
      transform: translateY(-1px);
    }
    .fp-submit:active:not(:disabled) { transform: scale(0.98); box-shadow: none; }
    .fp-submit:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
    .fp-logo-header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 20px;
      width: 100%;
    }
    .fp-logo-header img { max-height: 32px; width: auto; object-fit: contain; display: block; }
    .fp-error-msg {
      background: rgba(220,38,38,0.08);
      border: 1px solid rgba(220,38,38,0.2);
      border-radius: 6px;
      color: #dc2626;
      font-size: 12px;
      padding: 8px 12px;
      margin-top: 6px;
      text-align: center;
    }
    .fp-success-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      text-align: center;
      padding: 32px 20px;
      flex: 1;
      min-height: 320px;
      animation: fpSuccessFadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes fpSuccessFadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fp-success-icon-wrap {
      position: relative; width: 72px; height: 72px; margin-bottom: 20px;
    }
    .fp-success-icon-wrap::before {
      content: ''; position: absolute; inset: -6px; border-radius: 50%;
      background: radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%);
      animation: fpSuccessPulse 2.4s ease-in-out infinite;
    }
    @keyframes fpSuccessPulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.15); opacity: 1; }
    }
    .fp-success-icon-svg {
      width: 72px; height: 72px; display: block;
      stroke-dasharray: 166; stroke-dashoffset: 166;
      animation: fpCheckDraw 600ms 200ms cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }
    @keyframes fpCheckDraw { to { stroke-dashoffset: 0; } }
    .fp-check-path {
      stroke-dasharray: 30; stroke-dashoffset: 30;
      animation: fpCheckDraw 500ms 550ms cubic-bezier(0.65,0,0.45,1) forwards;
    }
    .fp-success-title {
      font-size: 20px; font-weight: 700; letter-spacing: -0.02em;
      line-height: 1.25; margin: 0 0 10px; color: ${formTextColor};
    }
    .fp-success-msg {
      font-size: 13px; line-height: 1.7; opacity: 0.75;
      margin: 0; max-width: 280px; color: ${formTextColor};
    }
    .fp-success-badge {
      display: inline-flex; align-items: center; gap: 5px;
      margin-top: 20px; padding: 5px 12px; border-radius: 20px;
      background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
      font-size: 11px; font-weight: 600; color: #16a34a; letter-spacing: 0.02em;
    }
  </style>

  <div class="fp-block">
    <!-- LEFT: Campaign visual -->
    <div class="fp-img-col">
      <img
        src="${campaignImage}"
        alt="${altText}"
        loading="lazy"
        decoding="async"
        style="width:100%;height:auto;display:block;min-height:280px;"
        onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
      />
    </div>

    <!-- RIGHT: Form panel -->
    <div class="fp-form-col">
      <div data-success style="display:none;" class="fp-success-screen">
        <div class="fp-success-icon-wrap">
          <svg class="fp-success-icon-svg" viewBox="0 0 52 52" fill="none"
            stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="26" cy="26" r="23" stroke-opacity="0.25" style="animation:none;stroke-dasharray:none;stroke-dashoffset:0" />
            <circle cx="26" cy="26" r="23" />
            <path class="fp-check-path" d="M15 26l8 8 14-14" stroke-width="3.5" />
          </svg>
        </div>
        <h3 class="fp-success-title">${esc(props.successTitle || 'Demande reçue !')}</h3>
        <p class="fp-success-msg">${esc(props.successMessage || 'Un conseiller commercial Ford examinera vos informations et vous contactera par téléphone dans les plus brefs délais pour donner suite à votre demande.')}</p>
        <div class="fp-success-badge">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="#22c55e"><circle cx="5" cy="5" r="4"/></svg>
          Demande transmise
        </div>
      </div>

      <div data-form-container>
        ${logoUrl ? `
        <div class="fp-logo-header">
          <img src="${logoUrl}" alt="Logo" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display='none'" />
        </div>` : ''}
        <h3 class="fp-form-title">${formTitle}</h3>
        <form
          class="lp-form"
          data-api="${apiBase}"
          data-campaign="${cid}"
          data-lp="${lpid}"${syncAttr}
          data-autohall-api="${autoHallApi}"
          data-req-type="LEAD"
        >
          ${formFieldsHtml}

          <div class="fp-gdpr">
            <input required type="checkbox" name="accept" />
            <span>
              J&rsquo;ai lu et j&rsquo;accepte <a href="${cgvUrl}" target="_blank" rel="noreferrer" style="color:${primaryColor};font-weight:600;">les conditions générales d&rsquo;utilisations</a>, notamment la mention relative à la protection des données personnelles. *
            </span>
          </div>
          <p class="fp-legal">Conformément à la loi 09-08, vous disposez d&rsquo;un droit d&rsquo;accès, de rectification et d&rsquo;opposition au traitement de vos données personnelles.</p>
          <p class="fp-legal">* Champs obligatoires.</p>

          <div data-error style="display:none;" class="fp-error-msg">Une erreur est survenue. Veuillez réessayer.</div>

          <button type="submit" data-submit data-original-label="${submitLabel}" class="fp-submit">
            ${submitLabel}
          </button>
        </form>
      </div>


    </div>
  </div>
`;
}

export function campaignGammeThermiqueBlockHtml(props: any, ctx: ExportContext): string {
  const cfg = resolveCgtProps(props);
  const primary = esc(cfg.primary);

  // mapPropsForZip already resolved the banner to a local 'images/xxx.jpg' relative
  // path (or kept the CDN URL on download failure). resolveCgtBannerUrl() would
  // incorrectly prepend '/' to relative paths, breaking file:// context.
  // We use the raw prop value directly and fall back to the CDN default.
  const rawBanner = (props.bannerImage || props.campaignImage || '').trim();
  const isLocalhostUrl = (u: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(u);
  const resolvedBanner = rawBanner && !isLocalhostUrl(rawBanner)
    ? rawBanner
    : CGT_DEFAULT_BANNER;
  const imgUrl = esc(resolvedBanner);
  const imgAlt = esc(cfg.imgAlt);
  const inputBorder = esc(cfg.inputBorder);
  const layoutBg = esc(cfg.layoutBg);
  const objectFit = esc(cfg.imageSizing);

  const step1Title = esc(cfg.step1Title);
  const step2Title = esc(cfg.step2Title);
  const step3Title = esc(cfg.step3Title);
  const btnNext = esc(cfg.btnNext);
  const btnBack = esc(cfg.btnBack);
  const btnSubmit = esc(cfg.btnSubmit);

  const apiBase = esc(ctx.apiBaseUrl ?? '');
  const cid  = esc(ctx.campaignId    || props.campaignId    || '');
  const lpid = esc(ctx.landingPageId || props.landingPageId || '');
  const pvid = esc(ctx.pageVersionId || props.pageVersionId || '');
  const syncAttr = props.syncToAutoHallBase ? ' data-sync-autohall="true"' : '';
  const autoHallApi = esc(cfg.autoHallApiUrl);

  const radiusMap: Record<string, string> = { none: '0px', md: '8px', lg: '12px' };
  const inputRadius = radiusMap[cfg.borderRadius ?? 'md'] ?? '8px';

  // Get rgba helper for background opacity
  const getRgba = (hex: string, op: number) => {
    if (!hex.startsWith('#')) return hex;
    const h = hex.slice(1);
    let r = 255, g = 255, b = 255;
    if (h.length === 3) {
      r = parseInt(h[0] + h[0], 16);
      g = parseInt(h[1] + h[1], 16);
      b = parseInt(h[2] + h[2], 16);
    } else if (h.length === 6) {
      r = parseInt(h.slice(0, 2), 16);
      g = parseInt(h.slice(2, 4), 16);
      b = parseInt(h.slice(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${op / 100})`;
  };
  const finalFormBgColor = esc(getRgba(cfg.formBg, cfg.formBgOpacity ?? 95));

  const fieldModele = cfg.fields.find((f: any) => f.id === 'modele') || { label: 'Modèle', placeholder: '', required: true, active: true };
  const fieldVille  = cfg.fields.find((f: any) => f.id === 'ville')  || { label: 'Ville', placeholder: '', required: true, active: true };
  const fieldDate   = cfg.fields.find((f: any) => f.id === 'date')   || { label: 'Date préférée pour l’essai', placeholder: '', required: true, active: true };
  const fieldNom    = cfg.fields.find((f: any) => f.id === 'nom')    || { label: 'Nom', placeholder: 'Entrez votre nom', required: true, active: true };
  const fieldTel    = cfg.fields.find((f: any) => f.id === 'tel')    || { label: 'Téléphone', placeholder: 'Entrez votre Téléphone', required: true, active: true };
  const fieldEmail  = cfg.fields.find((f: any) => f.id === 'email')  || { label: 'Email', placeholder: 'Entrez votre adresse email', required: true, active: false };

  const models = cfg.customizeVehicles ? (cfg.modelsList?.length ? cfg.modelsList : DEFAULT_CHERY_MODELS) : DEFAULT_CHERY_MODELS;
  const modelOptions = models.map((m: string) => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
  const villeOptions = cfg.villesList.map((v: string) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');

  return `
<section class="cgt-layout" style="display:flex;width:100%;min-height:540px;background:${layoutBg};box-sizing:border-box;margin:0;padding:0;overflow:hidden;font-family:'Outfit','Inter',sans-serif;align-items:stretch;" data-block="campaign-gamme-thermique">
  <style>
    .cgt-layout *, .cgt-layout *::before, .cgt-layout *::after { box-sizing: border-box; }
    .cgt-layout .image-container {
      flex: 1;
      height: 100%;
      background: ${layoutBg};
      overflow: hidden;
    }
    .cgt-layout .image-container img {
      width: 100%;
      height: 100%;
      object-fit: ${objectFit};
      display: block;
    }
    .cgt-layout .form-wrapper {
      flex: 0 0 420px;
      width: 420px;
      display: flex;
      flex-direction: column;
      background: ${finalFormBgColor};
      padding: 32px 24px;
      justify-content: center;
      align-items: center;
      transition: background 250ms ease;
    }
    .cgt-layout .form_test_drive {
      width: 100%;
      max-width: 380px;
    }
    .cgt-layout .form-container {
      display: flex;
      flex-direction: column;
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      padding: 0px;
      position: relative;
    }
    .cgt-layout .progress-bar-custom {
      height: 4px;
      width: 100%;
      background: #e2e8f0;
      border-radius: 2px;
      margin-bottom: 22px;
      overflow: hidden;
    }
    .cgt-layout .progress-fill {
      height: 100%;
      background: ${primary};
      transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .cgt-layout .step {
      display: none;
      flex-direction: column;
    }
    .cgt-layout .step.active {
      display: flex;
      animation: cgtFadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .cgt-layout .step-header {
      margin-bottom: 18px;
    }
    .cgt-layout .step-number {
      color: ${primary};
      text-transform: uppercase;
      letter-spacing: .06em;
      font-size: 11px;
      font-weight: 800;
      margin: 0;
    }
    .cgt-layout .step-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
      margin: 5px 0 0;
    }
    .cgt-layout .step-description {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
      line-height: 1.5;
    }
    .cgt-layout .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      display: block;
      margin-bottom: 6px;
    }
    .cgt-layout .form-select,
    .cgt-layout .form-control {
      display: block;
      width: 100%;
      padding: 10px 14px;
      font-size: 14px;
      color: #1e293b;
      background: #ffffff;
      border: 1.5px solid ${inputBorder};
      border-radius: ${inputRadius};
      outline: none;
      font-family: inherit;
      line-height: 1.5;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
    }
    .cgt-layout .form-select {
      padding-right: 36px;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 18px;
    }
    .cgt-layout .form-select:focus,
    .cgt-layout .form-control:focus {
      border-color: ${primary};
      box-shadow: 0 0 0 3px rgba(40, 143, 227, 0.2);
    }
    .cgt-layout .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.01em;
      border: none;
      border-radius: ${inputRadius};
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    .cgt-layout .btn-primary {
      color: #ffffff;
      background: ${primary};
      box-shadow: 0 4px 12px rgba(40, 143, 227, 0.2);
    }
    .cgt-layout .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-0.5px);
    }
    .cgt-layout .btn-primary:active {
      transform: scale(0.975);
    }
    .cgt-layout .btn-secondary {
      color: #4b5563;
      background: transparent;
      border: 1.5px solid ${inputBorder};
    }
    .cgt-layout .btn-secondary:hover {
      background: rgba(0, 0, 0, 0.03);
    }
    .cgt-layout .btn-secondary:active {
      transform: scale(0.975);
    }
    .cgt-layout .success-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px 0 8px;
    }
    .cgt-layout .success-icon {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      color: #22c55e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 16px;
      animation: cgtPulse 2.4s ease-in-out infinite;
    }
    .cgt-layout .success-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .cgt-layout .powered-by {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 20px;
      text-transform: uppercase;
      letter-spacing: .06em;
    }

    @keyframes cgtFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cgtPulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.08); opacity: 1; }
    }

    @media (max-width: 900px) {
      .cgt-layout {
        flex-direction: column !important;
        align-items: stretch;
        min-height: auto !important;
        height: auto !important;
      }
      .cgt-layout .image-container {
        flex: none;
        width: 100%;
        height: 280px;
      }
      .cgt-layout .form-wrapper {
        flex: none;
        width: 100%;
        padding: 24px 16px;
      }
      .cgt-layout .form-container {
        padding: 20px 16px;
      }
    }
  </style>

  <!-- LEFT COLUMN: Visual -->
  <div class="image-container">
    <img
      src="${imgUrl}"
      alt="${imgAlt}"
      loading="lazy"
    />
  </div>

  <!-- RIGHT COLUMN: Form -->
  <div class="form-wrapper ${cfg.formShadow ? 'shadow-2xl' : 'shadow-none'}">
    <div class="form_test_drive" id="form_test_drive" data-api="${apiBase}" data-autohall-api="${autoHallApi}" data-campaign-id="${cid}" data-lp-id="${lpid}" data-pv-id="${pvid}"${syncAttr}>
      <div class="form-container">
        <!-- Progress bar -->
        <div class="progress-bar-custom">
          <div class="progress-fill" id="progressBar" style="width: 25%"></div>
        </div>

        <div class="step active" id="step1">
          <div class="step-header">
            <div class="step-number">Étape 1/3</div>
            <div class="step-title">${step1Title}</div>
            <div class="step-description">${esc(CGT_COPY.step1Desc)}</div>
          </div>
          <div class="step-content">
            ${fieldModele.active ? `
            <div style="margin-bottom: 16px;">
              <label class="form-label">${esc(fieldModele.label || '')}${fieldModele.required ? ' *' : ''}</label>
              <div style="position: relative;">
                <select id="testdrive_modele" name="testdrive[modele]" class="form-select" ${fieldModele.required ? 'required' : ''}>
                  <option value=""></option>
                  ${modelOptions}
                </select>
              </div>
            </div>` : ''}
            <button type="button" class="btn btn-primary formtestdrivenextstep" style="width: 100%">${btnNext}</button>
          </div>
        </div>

        <div class="step" id="step2">
          <div class="step-header">
            <div class="step-number">Étape 2/3</div>
            <div class="step-title">${step2Title}</div>
            <div class="step-description">${esc(CGT_COPY.step2Desc)}</div>
          </div>
          <div class="step-content">
            ${fieldVille.active ? `
            <div style="margin-bottom: 12px;">
              <label class="form-label">${esc(fieldVille.label || '')}${fieldVille.required ? ' *' : ''}</label>
              <div style="position: relative;">
                <select id="testdrive_ville" name="testdrive[ville]" class="form-select" ${fieldVille.required ? 'required' : ''}>
                  <option value=""></option>
                  ${villeOptions}
                </select>
              </div>
            </div>` : ''}
            ${fieldDate.active ? `
            <div style="margin-bottom: 16px;">
              <label class="form-label">${esc(fieldDate.label || '')}${fieldDate.required ? ' *' : ''}</label>
              <div style="position: relative; cursor: pointer;">
                <input type="date" id="testdrive_dateessai" name="testdrive[dateessai]" ${fieldDate.required ? 'required' : ''} class="form-control" style="padding-right: 36px;" />
              </div>
            </div>` : ''}
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary formtestdriveprevstep" style="flex: 1">${btnBack}</button>
              <button type="button" class="btn btn-primary formtestdrivenextstep" style="flex: 2">${btnNext}</button>
            </div>
          </div>
        </div>

        <div class="step" id="step3">
          <div class="step-header">
            <div class="step-number">Étape 3/3</div>
            <div class="step-title">${step3Title}</div>
            <div class="step-description">${esc(CGT_COPY.step3Desc)}</div>
          </div>
          <div class="step-content">
            ${fieldNom.active ? `
            <div style="margin-bottom: 12px;">
              <label class="form-label">${esc(fieldNom.label || '')}${fieldNom.required ? ' *' : ''}</label>
              <input type="text" id="testdrive_nomprenom" name="testdrive[nomprenom]" ${fieldNom.required ? 'required' : ''} placeholder="${esc(fieldNom.placeholder || '')}" class="form-control">
            </div>` : ''}
            ${fieldTel.active ? `
            <div style="margin-bottom: 16px;">
              <label class="form-label">${esc(fieldTel.label || '')}${fieldTel.required ? ' *' : ''}</label>
              <input type="text" id="testdrive_telephone" name="testdrive[telephone]" ${fieldTel.required ? 'required' : ''} placeholder="${esc(fieldTel.placeholder || '')}" class="form-control phone-number">
            </div>` : ''}
            ${fieldEmail.active ? `
            <div style="margin-bottom: 16px;">
              <label class="form-label">${esc(fieldEmail.label || '')}${fieldEmail.required ? ' *' : ''}</label>
              <input type="email" id="testdrive_email" name="testdrive[email]" ${fieldEmail.required ? 'required' : ''} placeholder="${esc(fieldEmail.placeholder || '')}" class="form-control">
            </div>` : ''}
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary formtestdriveprevstep" style="flex: 1">${btnBack}</button>
              <button type="button" class="btn btn-primary formtestdrivenextstep" style="flex: 2">${btnSubmit}</button>
            </div>
          </div>
        </div>

        <div class="step" id="step4">
          <div class="success-container">
            <div class="success-icon">✓</div>
            <div class="success-title">${esc(CGT_COPY.successMessage)}</div>
          </div>
        </div>

        <div class="powered-by">© 2026 Auto Hall</div>
      </div>
    </div>
  </div>
</section>
<script>
(function(){
  document.querySelectorAll('.form_test_drive').forEach(function(form){
    var steps = [
      form.querySelector('#step1'),
      form.querySelector('#step2'),
      form.querySelector('#step3'),
      form.querySelector('#step4')
    ];
    var progressBar = form.querySelector('#progressBar');
    var cur = 0;

    function updateProgress() {
      if (progressBar) progressBar.style.width = (((cur + 1) / steps.length) * 100) + '%';
    }

    function go(n) {
      steps.forEach(function(s, i) {
        if (!s) return;
        if (i === n) s.classList.add('active');
        else s.classList.remove('active');
      });
      cur = n;
      updateProgress();
    }

    function validateStep(sEl) {
      if (!sEl) return true;
      var ok = true;
      sEl.querySelectorAll('input,select').forEach(function(el){
        if (!el.checkValidity()) { el.classList.add('invalid'); ok = false; }
        else el.classList.remove('invalid');
      });
      return ok;
    }

    /* ── Résout l'URL absolue du backend depuis n'importe quel contexte ── */
    function resolveApiUrl(form) {
      if (typeof API_ENDPOINT !== 'undefined' && API_ENDPOINT) {
        return API_ENDPOINT;
      }
      var base = (form.getAttribute('data-api') || '').replace(/\\/$/, '');
      // Si vide ou relatif depuis file://, on utilise le port dev standard
      if (!base || base.indexOf('http') !== 0) {
        base = 'http://localhost:3000';
      }
      return base + '/api/public/leads';
    }

    /* ── URL source propre (file:// n'est pas accepté par @IsUrl) ── */
    function safeSourceUrl() {
      var href = window.location.href || '';
      if (!href || href.indexOf('file://') === 0) return 'http://offline-export.autohall.local';
      return href;
    }

    /* ── Affiche / masque l'erreur inline du formulaire ── */
    function showError(msg) {
      var errEl = form.querySelector('.cgt-submit-error');
      if (!errEl) {
        errEl = document.createElement('div');
        errEl.className = 'cgt-submit-error';
        errEl.style.cssText = 'margin-top:10px;padding:10px 12px;background:#fee2e2;color:#b91c1c;border-radius:8px;font-size:13px;font-weight:500;text-align:center;';
        var s3Content = form.querySelector('#step3 .step-content');
        if (s3Content) s3Content.appendChild(errEl);
      }
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }

    function hideError() {
      var errEl = form.querySelector('.cgt-submit-error');
      if (errEl) errEl.style.display = 'none';
    }

    var s1Next = form.querySelector('#step1 .formtestdrivenextstep');
    if (s1Next) s1Next.addEventListener('click', function(){ if (validateStep(steps[0])) go(1); });

    var s2Back = form.querySelector('#step2 .formtestdriveprevstep');
    if (s2Back) s2Back.addEventListener('click', function(){ go(0); });

    var s2Next = form.querySelector('#step2 .formtestdrivenextstep');
    if (s2Next) s2Next.addEventListener('click', function(){ if (validateStep(steps[1])) go(2); });

    var s3Back = form.querySelector('#step3 .formtestdriveprevstep');
    if (s3Back) s3Back.addEventListener('click', function(){ go(1); });

    var s3Submit = form.querySelector('#step3 .formtestdrivenextstep');
    if (s3Submit) {
      s3Submit.addEventListener('click', function(e){
        e.preventDefault();
        if (!validateStep(steps[2])) return;

        /* Lecture des champs — clés de sélecteur ciblées et fiables */
        var fModel = form.querySelector('[name="testdrive[modele]"]');
        var fVille = form.querySelector('[name="testdrive[ville]"]');
        var fDate  = form.querySelector('[name="testdrive[dateessai]"]');
        var fNom   = form.querySelector('[name="testdrive[nomprenom]"]');
        var fTel   = form.querySelector('[name="testdrive[telephone]"]');
        var fEmail = form.querySelector('[name="testdrive[email]"]');

        var model = fModel ? fModel.value.trim() : '';
        var ville = fVille ? fVille.value.trim() : '';
        var date  = fDate  ? fDate.value.trim()  : '';
        var nom   = fNom   ? fNom.value.trim()   : '';
        var tel   = fTel   ? fTel.value.trim()   : '';
        var email = fEmail ? fEmail.value.trim()  : '';

        /* Identifiants de campagne — injectés depuis le contexte d'export */
        var campaignId    = form.getAttribute('data-campaign-id')  || '';
        var landingPageId = form.getAttribute('data-lp-id')        || '';
        var pageVersionId = form.getAttribute('data-pv-id')        || '';

        function isUUID(s) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s || ''); }

        var payload = {
          fullName:      nom,
          phone:         tel,
          email:         email        || undefined,
          vehicleModel:  model        || undefined,
          city:          ville        || undefined,
          preferredDate: date         || undefined,
          brand:         'Chery',
          requestType:   'TEST_DRIVE',
          campaignId:    isUUID(campaignId)    ? campaignId    : undefined,
          landingPageId: isUUID(landingPageId) ? landingPageId : undefined,
          pageVersionId: isUUID(pageVersionId) ? pageVersionId : undefined,
          sourceUrl:     (function(){ var h=window.location.href||''; return (!h||h.indexOf('file://')===0)?'http://offline-export.autohall.local':h; })(),
          rawPayload: {
            modele: model, ville: ville, dateessai: date,
            nomprenom: nom, telephone: tel, email: email
          }
        };

        /* Nettoyage des champs undefined */
        Object.keys(payload).forEach(function(k){ if (payload[k] === undefined) delete payload[k]; });

        /* Désactivation du bouton pendant l'envoi */
        var origLabel = s3Submit.textContent;
        s3Submit.disabled = true;
        s3Submit.textContent = 'Envoi…';
        hideError();

        var targetUrl = resolveApiUrl(form);
        fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function(res) {
            return res.text().then(function(txt) {
              var body = {};
              try { body = JSON.parse(txt); } catch(e) {}
              return { ok: res.ok, status: res.status, body: body };
            });
          })
          .then(function(result) {
            if (!result.ok) {
              var msg = (result.body && result.body.message) ? result.body.message : 'HTTP ' + result.status;
              throw new Error(msg);
            }
            s3Submit.disabled = false;
            s3Submit.textContent = origLabel;
            go(3);
          })
          .catch(function(err) {
            console.error('[AutoHall CGT] Lead submission FAILED:', err.message);
            console.error('[AutoHall CGT] Target URL was:', targetUrl);
            console.error('[AutoHall CGT] Payload was:', JSON.stringify(payload));
            s3Submit.disabled = false;
            s3Submit.textContent = origLabel;
            showError('Erreur d\\u2019envoi : ' + (err.message || 'Erreur r\\u00e9seau') + '. V\\u00e9rifiez que le serveur est accessible.');
          });
      });
    }

    go(0);
  });
})();
</script>`;
}

export function alternatingShowcaseBlockHtml(props: any, theme: any): string {
  const items = props.items || [];
  const primaryColor = theme.primaryColor || '#002C6C';

  const rowsHtml = items.map((item: any, index: number) => {
    const isOdd = index % 2 !== 0;
    const rowClass = isOdd ? 'flex flex-col md:flex-row-reverse gap-8 items-center justify-center' : 'flex flex-col md:flex-row gap-8 items-center justify-center';

    const renderIconSvg = (iconName: string) => {
      const name = (iconName || '').toLowerCase();
      if (name === 'shield') {
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`;
      }
      if (name === 'zap') {
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`;
      }
      if (name === 'cpu') {
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"></path></svg>`;
      }
      if (name === 'navigation') {
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>`;
      }
      return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4m0-4h.01"></path></svg>`;
    };

    const icon1Svg = renderIconSvg(item.feature1Icon);
    const icon2Svg = renderIconSvg(item.feature2Icon);

    const badgeHtml = item.badge ? `
      <span class="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full" style="background-color: ${primaryColor}15; color: ${primaryColor}; font-family: inherit;">
        ${esc(item.badge)}
      </span>
    ` : '';

    return `
      <section class="w-full py-16 bg-white box-border">
        <div class="max-w-7xl mx-auto px-5 md:px-8">
          <div class="${rowClass}">
            
            <!-- Text Content Column -->
            <div class="flex-1 w-full md:max-w-xl">
              ${badgeHtml}
              
              <h4 class="text-zinc-800 font-bold text-2xl md:text-3xl mb-4 leading-tight" style="color: #27272a; font-family: inherit;">
                ${esc(item.title)}
              </h4>
              
              <p class="text-zinc-600 text-sm leading-relaxed mb-6" style="color: #52525b;">
                ${esc(item.description)}
              </p>

              <!-- Micro-features Sub-grid -->
              <div class="flex gap-4 mt-4">
                <!-- Micro-feature 1 -->
                <div class="flex gap-3 items-start flex-1">
                  <div class="p-2.5 rounded-xl flex items-center justify-center shrink-0" style="background-color: ${primaryColor}10; color: ${primaryColor};">
                    ${icon1Svg}
                  </div>
                  <div>
                    <h6 class="font-semibold text-zinc-800 text-base mb-1" style="color: #27272a; font-family: inherit; margin: 0 0 4px;">
                      ${esc(item.feature1Title)}
                    </h6>
                    <p class="text-zinc-500 text-xs leading-normal" style="color: #71717a; margin: 0;">
                      ${esc(item.feature1Desc)}
                    </p>
                  </div>
                </div>

                <!-- Micro-feature 2 -->
                <div class="flex gap-3 items-start flex-1">
                  <div class="p-2.5 rounded-xl flex items-center justify-center shrink-0" style="background-color: ${primaryColor}10; color: ${primaryColor};">
                    ${icon2Svg}
                  </div>
                  <div>
                    <h6 class="font-semibold text-zinc-800 text-base mb-1" style="color: #27272a; font-family: inherit; margin: 0 0 4px;">
                      ${esc(item.feature2Title)}
                    </h6>
                    <p class="text-zinc-500 text-xs leading-normal" style="color: #71717a; margin: 0;">
                      ${esc(item.feature2Desc)}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Explorer Button -->
              <div class="mt-8">
                <a href="${esc(item.linkUrl || '#')}" class="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-white font-bold text-sm tracking-wide transition-all active:scale-[0.98]" style="background-color: ${primaryColor}; text-decoration: none; font-family: inherit; box-sizing: border-box;">
                  ${esc(item.linkLabel || 'Explorer')}
                </a>
              </div>
            </div>

            <!-- Image Column -->
            <div class="flex-1 flex justify-center w-full">
              <img src="${esc(item.imageUrl)}" alt="${esc(item.title)}" class="w-full max-w-md h-[380px] object-cover rounded-2xl shadow-sm" />
            </div>

          </div>
        </div>
      </section>
    `;
  }).join('\n');

  return `
    <div class="reverse-mobile">
      ${rowsHtml}
    </div>
  `;
}

const TFC_IMAGE_RADIUS_PX: Record<string, number> = {
  none: 0,
  md: 8,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999
};

export function tacticalFlashCampaignBlockHtml(props: any, ctx: ExportContext, theme: any): string {
  const activeBrand = getAutoHallBrand(props.brandKey) || getAutoHallBrand(ctx.selectedBrandId);
  const primaryColor = activeBrand?.primaryColor || props.colorPrimary || theme.primaryColor || '#0051a3';
  const colorAccent = props.colorAccent || primaryColor;
  const brandLogoUrl = props.brandLogoUrl || null;
  const bgSection = props.colorBgSection || '#b1dbd8';
  const formBg = (props.formBgColor && props.formBgColor !== '#ffffff' && props.formBgColor !== '#011625' && props.formBgColor !== '#00364b' && props.formBgColor !== '#011222' && props.formBgColor !== '#010b14' && props.formBgColor !== '#010b18' && props.formBgColor !== '#020c1b') ? props.formBgColor : '#030914';
  const radius = props.borderRadius ?? 16;
  const cardRadius = radius;
  const villesList = props.villesList?.length ? props.villesList : [...AUTOHALL_OFFICIAL_CITIES];
  const formTitle = props.formTitle || 'CONTACTEZ-MOI';
  const btnSubmitLabel = props.btnSubmitLabel || 'Envoyer';
  const showMarketing = !props.hideMarketingText;
  const hasMarketingContent = showMarketing && Boolean(props.badgeText || props.headline || props.description || props.priceValue);
  
  const imageRadius = TFC_IMAGE_RADIUS_PX[props.imageRadius ?? '2xl'] ?? 16;
  const imageFit = props.visualFitMode || props.imageFit || 'cover';
  const imageMaxHeight = props.maxVisualHeight || props.imageMaxHeight || 360;
  const blockId = props.id || 'main';
  const globalGap = typeof props.globalPadding === 'number' ? `${props.globalPadding}px` : (typeof props.sectionPadding === 'number' ? `${props.sectionPadding}px` : '32px');
  const paddingVal = typeof props.globalPadding === 'number' ? `${props.globalPadding}px 32px` : (typeof props.sectionPadding === 'number' ? `${props.sectionPadding}px 32px` : (props.sectionPadding === 'compact' ? '40px 32px' : props.sectionPadding === 'generous' ? '128px 32px' : '80px 32px'));

  // -- Per-variant field/label tokens (mirrors fieldStyle()/labelStyle() in TacticalFlashCampaign.tsx) --
  const fieldStyleAttr = `width:100%; height:auto; padding:14px 16px; border:1px solid rgba(255, 255, 255, 0.1); border-radius:\${radius}px; background:rgba(255, 255, 255, 0.02); color:#ffffff; font-weight:500; font-size:12px; outline:none; box-sizing:border-box; font-family:'Outfit', system-ui, sans-serif; transition:all 300ms cubic-bezier(0.16, 1, 0.3, 1);`;
  const labelStyleAttr = `font-size:10px; font-weight:bold; color:#94a3b8; text-transform:uppercase; letter-spacing:0.15em; margin-bottom:8px; display:block;`;
  const chevronColor = 'rgba(255, 255, 255, 0.5)';
  const chevron = `<div style="position:absolute; right:8px; top:50%; transform:translateY(-50%); pointer-events:none; border-left:4px solid transparent; border-right:4px solid transparent; border-top:4px solid ${chevronColor};"></div>`;

  const marketingHtml = hasMarketingContent ? `
        <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 16px; max-width: 640px;">
          <span class="tfc-badge" style="display: inline-flex; align-items: center; padding: 6px 16px; border-radius: 999px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; background: rgba(255, 255, 255, 0.8); color: #0051a3; border: 1px solid rgba(0, 81, 163, 0.1); backdrop-filter: blur(8px); margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); font-family: 'Outfit', system-ui, sans-serif;">
            ${esc(props.badgeText)}
          </span>
          ${props.headline ? `
            <h1 class="font-black tracking-tighter text-[#00364b] leading-[1.1] text-5xl mb-6" style="margin: 0 0 16px; font-size: clamp(32px, 4.5vw, 46px); font-weight: 900; color: #00364b; letter-spacing: -0.04em; line-height: 1.1; font-family: 'Outfit', system-ui, sans-serif; text-wrap: balance;">${esc(props.headline)}</h1>
          ` : ''}
          ${props.description ? `
            <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.625; font-weight: 400; max-width: 576px; font-family: 'Outfit', system-ui, sans-serif;">${esc(props.description)}</p>
          ` : ''}
          ${props.priceValue ? `
            <div class="tfc-price-card" style="display: inline-flex; align-items: center; gap: 12px; padding: 12px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03); border-left: 4px solid ${primaryColor}; margin-top: 4px; transition: all 200ms ease;">
              <div style="display: flex; flex-direction: column;">
                ${props.priceLabel ? `<span style="font-size: 9.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px;">${esc(props.priceLabel)}</span>` : ''}
                <div style="display: flex; align-items: baseline; gap: 4px;">
                  <span style="font-size: 24px; font-weight: 900; color: ${primaryColor}; letter-spacing: -0.02em; line-height: 1;">${esc(props.priceValue)}</span>
                  ${props.priceSuffix ? `<span style="font-size: 11px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase; line-height: 1;">${esc(props.priceSuffix)}</span>` : ''}
                </div>
              </div>
            </div>
          ` : ''}
        </div>
  ` : '';

  const placeholderIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
  
  const isContain = imageFit === 'contain';
  const containerHeight = isContain ? 'auto' : `${imageMaxHeight}px`;
  const containerMaxHeight = isContain ? 'none' : `${imageMaxHeight}px`;
  const containerBg = isContain ? '#09090b' : 'transparent';
  const imgRadiusStyle = isContain ? 0 : imageRadius;
  const displayFlexStyle = isContain ? 'display:flex; align-items:center; justify-content:center;' : '';

  const backdropHtml = isContain
    ? `<div class="tfc-visual-backdrop" style="background-image: url('${esc(props.promoImageUrl)}'); background-size: cover; background-position: center; filter: blur(40px); opacity: 0.4; position: absolute; inset: 0; transform: scale(1.1); z-index: 0;"></div>`
    : '';

  const imgHeightStyle = isContain ? 'auto' : '100%';
  const imgMaxHeightStyle = isContain ? `${imageMaxHeight}px` : '100%';

  const imageHtml = props.promoImageUrl
    ? `<div class="tfc-visual-container" style="width: 100%; height: ${containerHeight}; max-height: ${containerMaxHeight}; border-radius: ${imageRadius}px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02); border: 1px solid rgba(226, 232, 240, 0.8); position: relative; background: ${containerBg}; ${displayFlexStyle}">
        ${backdropHtml}
        <img class="tfc-visual-img" src="${esc(props.promoImageUrl)}" alt="${esc(props.promoImageAlt || 'Visuel de campagne')}" style="width: 100%; height: ${imgHeightStyle}; max-height: ${imgMaxHeightStyle}; object-fit: ${imageFit}; display: block; transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1); border-radius: ${imgRadiusStyle}px; position: relative; z-index: 1;" />
      </div>`
    : `<div class="tfc-empty-state-card" style="width: 100%; height: 100%; min-height: 320px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1.5px dashed #cbd5e1; border-radius: ${imageRadius}px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 48px 24px; box-sizing: border-box; position: relative; overflow: hidden; transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);">
          <div style="position: absolute; inset: 0; opacity: 0.04; background-image: linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px); background-size: 20px 20px; pointer-events: none;"></div>
          <div style="position: absolute; width: 240px; height: 240px; border-radius: 50%; background: radial-gradient(circle, ${primaryColor}0d 0%, transparent 70%); pointer-events: none;"></div>
          <div class="tfc-empty-state-icon-wrap" style="width: 64px; height: 64px; border-radius: 20px; background: #ffffff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px -4px rgba(148, 163, 184, 0.12); margin-bottom: 16px; transition: all 300ms ease; position: relative; z-index: 1;">
            ${placeholderIcon}
          </div>
          <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #1e293b; text-align: center; font-family: var(--brand-font, 'Outfit', 'Inter', sans-serif); position: relative; z-index: 1;">Glisser-déposer le visuel de l'offre</p>
          <p style="margin: 0 0 20px; font-size: 12px; color: #94a3b8; text-align: center; position: relative; z-index: 1;">Format recommandé : Carré ou 4:3</p>
          <span class="tfc-empty-state-btn" style="font-size: 12px; font-weight: 600; color: ${primaryColor}; border: 1.5px solid ${primaryColor}20; border-radius: 8px; background: #ffffff; padding: 6px 18px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02); transition: all 200ms ease; position: relative; z-index: 1;">Parcourir les médias</span>
        </div>`;

  const logoHtml = brandLogoUrl
    ? `<img src="${esc(brandLogoUrl)}" alt="Logo marque" style="max-height: 36px; max-width: 120px; margin-bottom: 20px; object-fit: contain;" onerror="this.style.display='none';" />`
    : '';

  const consentId = `tfc-consent-${blockId}`;

  return `
<section id="flash-campaign-${blockId}" style="width: 100%; background-color: ${bgSection}; min-height: 100vh; display: flex; align-items: center; font-family: 'Outfit', system-ui, sans-serif; padding: ${paddingVal}; box-sizing: border-box; --tfc-accent: ${colorAccent};">
  <div style="width: 100%; margin: 0 auto; box-sizing: border-box; gap: ${globalGap};" class="tfc-grid-container">
    <!-- Left: marketing copy + promo visual -->
    <div style="position: relative; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; box-sizing: border-box; gap: 24px; width: 100%;" class="tfc-marketing-col">
      ${marketingHtml}
      ${imageHtml}
    </div>

    <!-- Right: compact form card -->
    <div style="display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: 100%;" class="tfc-form-wrap">
      <div style="width: 100%; background-color: ${formBg}; color: #ffffff; display: flex; flex-direction: column; justify-content: center; gap: 20px; position: relative; overflow: hidden; border-radius: ${cardRadius}px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 0 35px 70px -15px rgba(0,0,0,0.7); box-sizing: border-box; transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1); border: 0.5px solid rgba(255, 255, 255, 0.08);" class="tfc-form-col tfc-form-col--dark bg-[#030914] border-[0.5px] border-white/[0.08] shadow-[0_35px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div aria-hidden style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #1b7ac8; border-radius: ${radius}px ${radius}px 0 0;"></div>

        <!-- Form -->
        <form id="tfc-form-main" action="save_lead.php" method="POST" style="display: flex; flex-direction: column; width: 100%;">
          ${logoHtml}

          <h2 class="tfc-form-title" style="display: block; margin: 0 0 4px; color: #ffffff; font-weight: 700; letter-spacing: -0.025em; line-height: 1.2;">
            ${esc(formTitle)}
          </h2>

          <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
            <!-- Civilité + Prénom -->
            <div style="display: flex; flex-direction: row; gap: 16px; width: 100%;">
              <div style="width: 80px; flex-shrink: 0;">
                <label style="${labelStyleAttr}">Civilité</label>
                <div style="position: relative;">
                  <select name="civility" class="tfc-field-input tfc-field-input--dark" style="${fieldStyleAttr} appearance: none; padding-right: 28px; cursor: pointer;">
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                    <option value="Mlle">Mlle</option>
                  </select>
                  ${chevron}
                </div>
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 8px; width: 100%;">
                <label style="${labelStyleAttr}">Prénom *</label>
                <input type="text" name="firstname" required placeholder="Prénom" class="tfc-field-input tfc-field-input--dark" style="${fieldStyleAttr}" />
              </div>
            </div>

            <!-- Nom -->
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <label style="${labelStyleAttr}">Nom *</label>
              <input type="text" name="lastname" required placeholder="Nom de famille" class="tfc-field-input tfc-field-input--dark" style="${fieldStyleAttr}" />
            </div>

            <!-- Téléphone -->
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <label style="${labelStyleAttr}">Téléphone *</label>
              <input type="tel" name="phone" required placeholder="ex : 06xxxxxxxx *" maxlength="10" pattern="0[1-9][0-9]{8}" class="tfc-field-input tfc-field-input--dark" style="${fieldStyleAttr}" />
            </div>

            <!-- Email -->
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <label style="${labelStyleAttr}">Email *</label>
              <input type="email" name="email" required placeholder="machine@gmail.com *" class="tfc-field-input tfc-field-input--dark" style="${fieldStyleAttr}" />
            </div>

            <!-- Ville -->
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <label style="${labelStyleAttr}">Ville *</label>
              <div style="position: relative;">
                <select name="city" class="tfc-field-input tfc-field-input--dark" style="${fieldStyleAttr} appearance: none; padding-right: 28px; cursor: pointer;">
                  ${villesList.map((v: string) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}
                </select>
                ${chevron}
              </div>
            </div>

            <!-- RGPD -->
            <div style="display: flex; gap: 8px; align-items: flex-start; margin-top: 4px;">
              <input type="checkbox" name="privacy" id="${consentId}" required style="margin-top: 2px; accent-color: ${colorAccent}; cursor: pointer; flex-shrink: 0;" />
              <label for="${consentId}" style="font-size: 11px; color: #d4d4d8; line-height: 1.625; cursor: pointer;">
                ${esc(AUTOHALL_RGPD_CLAUSE)}
              </label>
            </div>

            <!-- Submit button -->
            <button type="submit" style="display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px 32px; background: ${colorAccent}; color: #ffffff; border: none; border-radius: ${radius}px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; cursor: pointer; transition: all 300ms ease-out; box-shadow: 0 10px 20px -5px rgba(27, 122, 200, 0.3); box-sizing: border-box; font-family: 'Outfit', system-ui, sans-serif;" class="tfc-submit-btn bg-[#1b7ac8] hover:bg-[#156cb4] text-white font-black py-4 px-8 rounded-xl uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(27,122,200,0.3)] w-full flex items-center justify-center cursor-pointer">
              ${esc(btnSubmitLabel)}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <style>
    #flash-campaign-${blockId} .tfc-grid-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      max-width: 1200px;
      min-height: calc(100vh - 80px);
      box-sizing: border-box;
    }
    @media (min-width: 768px) {
      #flash-campaign-${blockId} .tfc-grid-container {
        flex-direction: row;
      }
      #flash-campaign-${blockId} .tfc-marketing-col {
        flex: 0 0 60% !important;
        width: 60% !important;
      }
      #flash-campaign-${blockId} .tfc-form-wrap {
        flex: 0 0 40% !important;
        width: 40% !important;
      }
      #flash-campaign-${blockId} .tfc-form-col {
        padding: 2rem;
      }
      #flash-campaign-${blockId} .tfc-submit-btn {
        width: auto;
        align-self: flex-end;
      }
    }
    @media (min-width: 1024px) {
      #flash-campaign-${blockId} .tfc-grid-container {
        gap: 3rem;
      }
    }
    #flash-campaign-${blockId} .tfc-marketing-col,
    #flash-campaign-${blockId} .tfc-form-wrap {
      width: 100%;
      min-width: 0;
    }
    #flash-campaign-${blockId} .tfc-form-col {
      padding: 1.5rem;
    }
    #flash-campaign-${blockId} .tfc-form-title {
      font-size: 18px;
    }
    @media (min-width: 768px) {
      #flash-campaign-${blockId} .tfc-form-title {
        font-size: 20px;
      }
    }
    #flash-campaign-${blockId} .tfc-submit-btn {
      width: 100%;
      margin-top: 16px;
      transition: all 200ms ease-out !important;
    }
    #flash-campaign-${blockId} .tfc-submit-btn:not(:disabled):hover {
      background: #99cfca !important;
      box-shadow: 0 10px 20px -2px rgba(0, 0, 0, 0.2), 0 4px 8px -3px rgba(0, 0, 0, 0.1) !important;
    }
    #flash-campaign-${blockId} .tfc-submit-btn:not(:disabled):active {
      transform: scale(0.98);
    }
    #flash-campaign-${blockId} .tfc-field-input {
      transition: all 200ms ease-out !important;
    }
    #flash-campaign-${blockId} .tfc-field-input::placeholder {
      color: #a1a1aa;
    }
    #flash-campaign-${blockId} .tfc-field-input--dark::placeholder {
      color: rgba(255, 255, 255, 0.4) !important;
    }
    #flash-campaign-${blockId} .tfc-field-input:focus,
    #flash-campaign-${blockId} .tfc-field-input--dark:focus {
      border-color: var(--tfc-accent, #1b7ac8) !important;
      background: rgba(255, 255, 255, 0.1) !important;
      color: #ffffff !important;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08), 0 0 0 5px var(--tfc-accent, #1b7ac8), 0 0 8px var(--tfc-accent, #1b7ac8) !important;
      outline: none !important;
    }
    #flash-campaign-${blockId} .tfc-field-input--dark {
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #ffffff !important;
    }
    #flash-campaign-${blockId} .tfc-empty-state-card:hover {
      border-color: var(--tfc-accent, #3b82f6) !important;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04) !important;
      background: #ffffff !important;
    }
    #flash-campaign-${blockId} .tfc-empty-state-card:hover .tfc-empty-state-icon-wrap {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -6px rgba(148, 163, 184, 0.2) !important;
      border-color: var(--tfc-accent, #3b82f6) !important;
    }
    #flash-campaign-${blockId} .tfc-empty-state-card:hover .tfc-empty-state-btn {
      background: color-mix(in srgb, var(--tfc-accent, #3b82f6) 10%, transparent) !important;
      border-color: var(--tfc-accent, #3b82f6) !important;
    }
    #flash-campaign-${blockId} .tfc-visual-img:hover {
      transform: scale(1.02);
    }
    #flash-campaign-${blockId} .tfc-visual-backdrop {
      position: absolute;
      inset: -10px;
      filter: blur(20px) opacity(0.3) saturate(1.2);
      transform: scale(1.1);
      pointer-events: none;
      z-index: 0;
      transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    #flash-campaign-${blockId} .tfc-visual-container:hover .tfc-visual-backdrop {
      transform: scale(1.15);
      opacity: 0.4;
    }
    #flash-campaign-${blockId} .tfc-price-card:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06) !important;
    }
  </style>
</section>
  `;
}

export function multiStepTestDriveBlockHtml(props: any, _ctx: ExportContext, _theme: any): string {
  const villesList = props.villesList?.length ? props.villesList : [...AUTOHALL_OFFICIAL_CITIES];
  const modelesList = props.modelesList?.length ? props.modelesList : ['Opel Corsa', 'Opel Mokka', 'Ford Focus', 'Ford Kuga', 'Chery Tiggo 7', 'Chery Tiggo 8 Pro'];
  const formTitle = props.formTitle || 'RÉSERVER UN ESSAI';
  const formSubtitle = props.formSubtitle || 'Complétez vos informations pour planifier votre essai.';
  const btnSubmitLabel = props.btnSubmitLabel || 'Confirmer mon essai';
  const blockId = props.id || 'main';
  const imageUrl = props.promoImageUrl || props.imageSrc || 'https://www.autohall.ma/assets/campagne/Gamme-Thermique-1200x628.jpg';

  return `
<section id="test-drive-${blockId}" class="w-full bg-[#f4f6f8] py-6 px-4 md:px-8 flex items-center justify-center min-h-fit" style="width:100%; background-color:#f4f6f8; padding:24px 16px; min-height:fit-content; display:flex; align-items:center; justify-content:center; box-sizing:border-box; font-family:'Outfit', system-ui, -apple-system, sans-serif;">
  <div class="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch mtd-grid-container" style="width:100%; max-width:80rem; background-color:#ffffff; border-radius:1rem; box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); overflow:hidden; display:grid; align-items:stretch; box-sizing:border-box;">
    
    <!-- Colonne de Gauche (Bannière Visuelle de l'Offre - 7 ou 8 colonnes) -->
    <div class="lg:col-span-7 xl:col-span-8 relative bg-[#eef2f6] flex items-center justify-center p-4 lg:p-6 mtd-col-visual" style="position:relative; background-color:#eef2f6; display:flex; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;">
      <img 
        src="${esc(imageUrl)}" 
        alt="${esc(props.promoImageAlt || 'Gamme Tiggo Auto Hall')}" 
        class="w-full h-auto max-h-[620px] object-contain object-center select-none" 
        style="width:100%; height:auto; max-height:620px; object-fit:contain; object-position:center; user-select:none; display:block;"
        loading="eager"
      />
    </div>

    <!-- Colonne de Droite (Formulaire Multi-Étapes - 5 ou 4 colonnes) -->
    <div class="lg:col-span-5 xl:col-span-4 p-6 sm:p-8 flex flex-col justify-center bg-white border-l border-zinc-100 mtd-col-form" style="display:flex; flex-direction:column; justify-content:center; background-color:#ffffff; border-left:1px solid #f4f4f5; padding:24px 32px; box-sizing:border-box;">
      
      <!-- Succès (Masqué initialement) -->
      <div id="mtd-success-${blockId}" style="display:none; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:32px 16px;">
        <div style="margin-bottom:16px; width:64px; height:64px; border-radius:9999px; background-color:#ecfdf5; display:flex; align-items:center; justify-content:center;">
          <svg style="width:36px; height:36px; color:#10b981;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 style="margin:0 0 8px; font-size:20px; font-weight:800; color:#020617;">Demande Reçue !</h3>
        <p style="margin:0; font-size:13px; line-height:1.6; color:#64748b; max-width:280px;">
          Votre demande d'essai a été enregistrée avec succès. Un conseiller Auto Hall vous contactera sous peu.
        </p>
      </div>

      <!-- Formulaire Principal -->
      <form id="mtd-form-${blockId}" action="${esc(props.formActionUrl || '/api/public/leads')}" method="POST" class="lp-multi-form" data-multi-form style="display:flex; flex-direction:column; justify-content:space-between; width:100%; box-sizing:border-box;">
        
        <!-- En-tête formulaire -->
        <div style="margin-bottom:16px; user-select:none;">
          <span style="display:inline-block; margin-bottom:6px; font-size:10px; text-transform:uppercase; font-weight:700; color:#2563eb; background-color:#eff6ff; padding:2px 10px; border-radius:9999px;">
            Test Drive Officiel
          </span>
          <h2 style="margin:0; font-size:20px; font-weight:900; line-height:1.2; color:#0f172a; letter-spacing:-0.02em;">
            ${esc(formTitle)}
          </h2>
          <p style="margin:4px 0 0; font-size:12px; line-height:1.5; color:#64748b;">
            ${esc(formSubtitle)}
          </p>
        </div>

        <!-- Barre de progression -->
        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span id="mtd-step-label-${blockId}" style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8;">
              Étape 01/03
            </span>
            <span id="mtd-step-pct-${blockId}" style="font-size:11px; font-weight:700; color:#2563eb;">
              33%
            </span>
          </div>
          <div style="height:6px; width:100%; background-color:#f1f5f9; border-radius:9999px; overflow:hidden;">
            <div id="mtd-progress-bar-${blockId}" style="height:100%; width:33%; background-color:#2563eb; border-radius:9999px; transition:width 300ms ease;"></div>
          </div>
        </div>

        <div id="mtd-error-${blockId}" style="display:none; align-items:center; gap:8px; padding:8px 12px; margin-bottom:12px; background-color:#fef2f2; border:1px solid #fecaca; border-radius:8px; color:#ef4444; font-size:12px; font-weight:600;"></div>

        <!-- Étape 1 : Modèle -->
        <div id="mtd-step1-${blockId}" style="display:block; margin-bottom:16px;">
          <label style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#334155; margin-bottom:6px;">
            Sélectionner le modèle *
          </label>
          <div style="position:relative; width:100%;">
            <select id="mtd-input-model-${blockId}" name="model" required style="width:100%; padding:12px 36px 12px 14px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:600; color:#0f172a; outline:none; cursor:pointer; -webkit-appearance:none; -moz-appearance:none; appearance:none; box-sizing:border-box;">
              <option value="" disabled selected>Choisir un modèle...</option>
              ${modelesList.map((m: string) => `<option value="${esc(m)}">${esc(m)}</option>`).join('')}
            </select>
            <div style="position:absolute; right:14px; top:50%; transform:translateY(-50%); pointer-events:none; color:#2563eb;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>

        <!-- Étape 2 : Ville & Date -->
        <div id="mtd-step2-${blockId}" style="display:none; margin-bottom:16px; flex-direction:column; gap:12px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#334155; margin-bottom:6px;">
              Ville de l'essai *
            </label>
            <div style="position:relative; width:100%;">
              <select id="mtd-input-city-${blockId}" name="city" style="width:100%; padding:12px 36px 12px 14px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:600; color:#0f172a; outline:none; cursor:pointer; -webkit-appearance:none; -moz-appearance:none; appearance:none; box-sizing:border-box;">
                <option value="" disabled selected>Choisir une ville...</option>
                ${villesList.map((v: string) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}
              </select>
              <div style="position:absolute; right:14px; top:50%; transform:translateY(-50%); pointer-events:none; color:#2563eb;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#334155; margin-bottom:6px;">
              Date d'essai préférée *
            </label>
            <input id="mtd-input-date-${blockId}" type="date" name="date" style="width:100%; padding:10px 14px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:600; color:#0f172a; outline:none; box-sizing:border-box;" />
          </div>
        </div>

        <!-- Étape 3 : Coordonnées -->
        <div id="mtd-step3-${blockId}" style="display:none; margin-bottom:16px; flex-direction:column; gap:10px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#334155; margin-bottom:4px;">
              Nom et Prénom *
            </label>
            <input id="mtd-input-name-${blockId}" type="text" name="name" placeholder="Votre nom complet" style="width:100%; padding:10px 14px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:500; color:#0f172a; outline:none; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#334155; margin-bottom:4px;">
              Téléphone *
            </label>
            <input id="mtd-input-phone-${blockId}" type="tel" name="phone" placeholder="ex : 06xxxxxxxx" maxlength="10" pattern="0[1-9][0-9]{8}" style="width:100%; padding:10px 14px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:500; color:#0f172a; outline:none; box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#334155; margin-bottom:4px;">
              Email
            </label>
            <input id="mtd-input-email-${blockId}" type="email" name="email" placeholder="contact@example.com" style="width:100%; padding:10px 14px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; font-size:13px; font-weight:500; color:#0f172a; outline:none; box-sizing:border-box;" />
          </div>
          <label style="display:flex; align-items:flex-start; gap:8px; margin-top:4px; cursor:pointer; user-select:none;">
            <input id="mtd-input-consent-${blockId}" type="checkbox" name="consent" required style="margin-top:2px; accent-color:#0f172a; width:15px; height:15px; cursor:pointer;" />
            <span style="font-size:10px; line-height:1.4; color:#64748b;">
              ${AUTOHALL_RGPD_CLAUSE}
            </span>
          </label>
        </div>

        <!-- Boutons de navigation avec active:scale-[0.98] -->
        <div style="padding-top:12px; border-top:1px solid #f1f5f9; display:flex; flex-direction:column; gap:8px;">
          <button id="mtd-btn-prev-${blockId}" type="button" onclick="mtdPrevStep('${blockId}')" class="active:scale-[0.98]" style="display:none; width:100%; height:42px; border-radius:12px; border:none; background-color:#f1f5f9; color:#475569; font-size:13px; font-weight:700; cursor:pointer; transition:transform 150ms ease, background-color 150ms ease;">
            Retour
          </button>
          <button id="mtd-btn-next-${blockId}" type="button" onclick="mtdNextStep('${blockId}')" class="active:scale-[0.98]" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; height:46px; border-radius:12px; border:none; background-color:#0f172a; color:#ffffff; font-size:14px; font-weight:700; cursor:pointer; transition:transform 150ms ease, background-color 150ms ease;">
            <span>Suivant</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
          <button id="mtd-btn-submit-${blockId}" type="button" onclick="mtdSubmitLead('${blockId}')" class="active:scale-[0.98]" style="display:none; align-items:center; justify-content:center; gap:8px; width:100%; height:46px; border-radius:12px; border:none; background-color:#0f172a; color:#ffffff; font-size:14px; font-weight:700; cursor:pointer; transition:transform 150ms ease, background-color 150ms ease;">
            <span>${esc(btnSubmitLabel)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
          <p style="text-align:center; font-size:10px; color:#94a3b8; margin:4px 0 0; display:flex; align-items:center; justify-content:center; gap:4px; user-select:none;">
            <svg style="width:12px; height:12px; color:#10b981;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Sans engagement
          </p>
        </div>

      </form>
    </div>

  </div>

  <style>
    @media (min-width: 1024px) {
      #test-drive-${blockId} .mtd-grid-container {
        grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
      }
      #test-drive-${blockId} .mtd-col-visual {
        grid-column: span 7 / span 7 !important;
      }
      #test-drive-${blockId} .mtd-col-form {
        grid-column: span 5 / span 5 !important;
      }
    }
    @media (min-width: 1280px) {
      #test-drive-${blockId} .mtd-col-visual {
        grid-column: span 8 / span 8 !important;
      }
      #test-drive-${blockId} .mtd-col-form {
        grid-column: span 4 / span 4 !important;
      }
    }
    #test-drive-${blockId} select:focus,
    #test-drive-${blockId} input:focus {
      border-color: #2563eb !important;
      background-color: #ffffff !important;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
    }
    #test-drive-${blockId} button:hover {
      opacity: 0.95;
    }
    #test-drive-${blockId} button:active {
      transform: scale(0.98);
    }
  </style>

  <script>
    window['mtdStep_' + '${blockId}'] = 1;

    function mtdShowErr(bid, msg) {
      var err = document.getElementById('mtd-error-' + bid);
      if (err) {
        err.innerText = msg;
        err.style.display = 'block';
      }
    }

    function mtdHideErr(bid) {
      var err = document.getElementById('mtd-error-' + bid);
      if (err) err.style.display = 'none';
    }

    function mtdNextStep(bid) {
      mtdHideErr(bid);
      var cur = window['mtdStep_' + bid] || 1;
      if (cur === 1) {
        var m = document.getElementById('mtd-input-model-' + bid);
        if (!m || !m.value) {
          mtdShowErr(bid, 'Veuillez sélectionner un modèle.');
          return;
        }
        document.getElementById('mtd-step1-' + bid).style.display = 'none';
        document.getElementById('mtd-step2-' + bid).style.display = 'flex';
        document.getElementById('mtd-btn-prev-' + bid).style.display = 'block';
        document.getElementById('mtd-progress-bar-' + bid).style.width = '66%';
        document.getElementById('mtd-step-label-' + bid).innerText = 'Étape 02/03';
        document.getElementById('mtd-step-pct-' + bid).innerText = '66%';
        window['mtdStep_' + bid] = 2;
      } else if (cur === 2) {
        var c = document.getElementById('mtd-input-city-' + bid);
        var d = document.getElementById('mtd-input-date-' + bid);
        if (!c || !c.value) {
          mtdShowErr(bid, 'Veuillez sélectionner une ville.');
          return;
        }
        if (!d || !d.value) {
          mtdShowErr(bid, "Veuillez choisir une date d'essai.");
          return;
        }
        document.getElementById('mtd-step2-' + bid).style.display = 'none';
        document.getElementById('mtd-step3-' + bid).style.display = 'flex';
        document.getElementById('mtd-btn-next-' + bid).style.display = 'none';
        document.getElementById('mtd-btn-submit-' + bid).style.display = 'flex';
        document.getElementById('mtd-progress-bar-' + bid).style.width = '100%';
        document.getElementById('mtd-step-label-' + bid).innerText = 'Étape 03/03';
        document.getElementById('mtd-step-pct-' + bid).innerText = '100%';
        window['mtdStep_' + bid] = 3;
      }
    }

    function mtdPrevStep(bid) {
      mtdHideErr(bid);
      var cur = window['mtdStep_' + bid] || 1;
      if (cur === 2) {
        document.getElementById('mtd-step2-' + bid).style.display = 'none';
        document.getElementById('mtd-step1-' + bid).style.display = 'block';
        document.getElementById('mtd-btn-prev-' + bid).style.display = 'none';
        document.getElementById('mtd-progress-bar-' + bid).style.width = '33%';
        document.getElementById('mtd-step-label-' + bid).innerText = 'Étape 01/03';
        document.getElementById('mtd-step-pct-' + bid).innerText = '33%';
        window['mtdStep_' + bid] = 1;
      } else if (cur === 3) {
        document.getElementById('mtd-step3-' + bid).style.display = 'none';
        document.getElementById('mtd-step2-' + bid).style.display = 'flex';
        document.getElementById('mtd-btn-submit-' + bid).style.display = 'none';
        document.getElementById('mtd-btn-next-' + bid).style.display = 'flex';
        document.getElementById('mtd-progress-bar-' + bid).style.width = '66%';
        document.getElementById('mtd-step-label-' + bid).innerText = 'Étape 02/03';
        document.getElementById('mtd-step-pct-' + bid).innerText = '66%';
        window['mtdStep_' + bid] = 2;
      }
    }

    async function mtdSubmitLead(bid) {
      mtdHideErr(bid);
      var name = document.getElementById('mtd-input-name-' + bid)?.value?.trim();
      var phone = document.getElementById('mtd-input-phone-' + bid)?.value?.trim();
      var email = document.getElementById('mtd-input-email-' + bid)?.value?.trim();
      var consent = document.getElementById('mtd-input-consent-' + bid)?.checked;
      var model = document.getElementById('mtd-input-model-' + bid)?.value;
      var city = document.getElementById('mtd-input-city-' + bid)?.value;
      var date = document.getElementById('mtd-input-date-' + bid)?.value;

      if (!name || !phone) {
        mtdShowErr(bid, 'Veuillez remplir tous les champs obligatoires.');
        return;
      }
      if (!consent) {
        mtdShowErr(bid, 'Veuillez accepter les conditions de confidentialité.');
        return;
      }

      var btn = document.getElementById('mtd-btn-submit-' + bid);
      if (btn) btn.disabled = true;

      try {
        var payload = {
          fullName: name,
          phone: phone,
          email: email || undefined,
          vehicleModel: model,
          city: city,
          preferredDate: date,
          requestType: 'TEST_DRIVE'
        };
        var apiUrl = typeof API_ENDPOINT !== 'undefined' ? API_ENDPOINT : 'http://localhost:3000/api/public/leads';
        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function(e){ console.warn('Offline lead cache:', e); });
      } catch(err) {
        console.warn('Submission error:', err);
      }

      document.getElementById('mtd-form-' + bid).style.display = 'none';
      document.getElementById('mtd-success-' + bid).style.display = 'flex';
    }
  </script>
</section>
  `;
}

function renderProBlockSection(blockType: string, props: any, ctx: ExportContext, theme: any): string {
  switch (blockType) {
    case 'brand-navbar':             return brandNavbarBlockHtml(props);
    case 'hero-showroom':            return heroShowroomBlockHtml(props, ctx, theme);
    case 'hero-mosaic':              return heroMosaicBlockHtml(props, ctx, theme);
    case 'hero-cinematic':           return heroCinematicBlockHtml(props, ctx, theme);
    case 'hero-immersive-form':      return heroImmersiveFormBlockHtml(props, ctx, theme);
    case 'hero-split-classic':       return heroShowroomBlockHtml(props, ctx, theme); // fallback compatibility
    case 'hero-immersive-overlay':   return heroCinematicBlockHtml(props, ctx, theme); // fallback compatibility
    case 'specs-grid':                return specsGridBlockHtml(props);
    case 'model-showcase-gallery':    return modelShowcaseGalleryBlockHtml(props);
    case 'conversion-form-split':     return conversionFormSplitBlockHtml(props, ctx);
    case 'carousel':                 return carouselBlockHtml(props);
    case 'specs-showroom':           return specsShowroomBlockHtml(props, ctx);
    case 'contact-section':          return contactSectionBlockHtml(props, ctx);
    case 'footer-block':             return footerBlockHtml(props);
    case 'campaign-gamme-thermique': return campaignGammeThermiqueBlockHtml(props, ctx);
    case 'alternating-showcase':     return alternatingShowcaseBlockHtml(props, theme);
    case 'tactical-flash-campaign':  return tacticalFlashCampaignBlockHtml(props, ctx, theme);
    case 'multi-step-test-drive':    return multiStepTestDriveBlockHtml(props, ctx, theme);
    default:                         return '';
  }
}

// ── Node-tree renderers ───────────────────────────────────────────────────────

function renderNode(node: BuilderNode, nodes: Record<string, BuilderNode>, ctx: ExportContext, theme: any): string {
  if (node.visibility?.hidden) return '';

  const lStyle = layoutToStyle(node.layout);
  const nStyle = styleToStyle(node.style);
  const style = merge(lStyle, nStyle);
  const styleAttr = style ? ` style="${esc(style)}"` : '';

  switch (node.kind) {
    case 'section': {
      const blockType = (node.props as any)?.blockType as string | undefined;
      if (blockType) return renderProBlockSection(blockType, node.props, ctx, theme);
      const children = node.children.map((id: string) => nodes[id] ? renderNode(nodes[id], nodes, ctx, theme) : '').join('');
      const sectionStyle = merge('box-sizing:border-box;width:100%', lStyle, nStyle);
      return `<section style="${esc(sectionStyle)}">${children}</section>`;
    }

    case 'text': {
      const p = node.props as { tag?: string; text?: string; content?: string; align?: string };
      const tag = p.tag ?? 'p';
      const text = p.text ?? p.content ?? '';
      const alignStyle = p.align ? esc(`text-align:${p.align};${style}`) : esc(style);
      return `<${esc(tag)} style="${alignStyle}">${esc(text)}</${esc(tag)}>`;
    }

    case 'button': {
      const p = node.props as { label?: string; href?: string; variant?: string };
      const btnStyle = merge('display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;cursor:pointer;border:none', nStyle, lStyle);
      const href = p.href ? ` href="${esc(p.href)}"` : '';
      const tag = p.href ? 'a' : 'button';
      return `<${tag}${href} style="${esc(btnStyle)}">${esc(p.label ?? 'Bouton')}</${tag}>`;
    }

    case 'image': {
      const p = node.props as { src?: string; alt?: string };
      if (!p.src?.trim()) return '';
      const imgStyle = merge('display:block;max-width:100%;height:auto', nStyle, lStyle);
      return `<img src="${esc(p.src)}" alt="${esc(p.alt ?? '')}" style="${esc(imgStyle)}" loading="lazy" />`;
    }

    case 'form': {
      return `<div style="display:flex;justify-content:center;padding:40px 5%;width:100%;box-sizing:border-box;">${formHtml()}</div>`;
    }

    case 'card': {
      const cardStyle = merge('display:flex;flex-direction:column', nStyle, lStyle);
      const children = node.children.map((id: string) => nodes[id] ? renderNode(nodes[id], nodes, ctx, theme) : '').join('');
      return `<div style="${esc(cardStyle)}">${children}</div>`;
    }

    case 'stack':
    case 'frame': {
      const children = node.children.map((id: string) => nodes[id] ? renderNode(nodes[id], nodes, ctx, theme) : '').join('');
      return `<div${styleAttr}>${children}</div>`;
    }

    default: {
      const children = node.children.map((id: string) => nodes[id] ? renderNode(nodes[id], nodes, ctx, theme) : '').join('');
      return children ? `<div${styleAttr}>${children}</div>` : '';
    }
  }
}

function buildFormScript(): string {
  return `<script>
(function(){
  var A=typeof __EXPORT_API_URL__!=='undefined'?__EXPORT_API_URL__:'';
  async function sub(form) {
    var formEl = form.querySelector('form') || form;
    // Étape 1 : Validation stricte des contraintes HTML5 natives
    if (formEl && typeof formEl.checkValidity === 'function' && !formEl.checkValidity()) {
      if (typeof formEl.reportValidity === 'function') {
        formEl.reportValidity();
      }
      showErr(form);
      return;
    }

    var localApi = (form.dataset.localApi || form.dataset.api || A || '').replace(/\\/$/, '');
    // Si vide ou relatif (contexte file://), on pointe vers le port dev standard
    if (!localApi || localApi.indexOf('http') !== 0) {
      localApi = 'http://localhost:3000';
    }
    var finalLocalUrl = localApi + '/api/public/leads';
    try {
      var parsed = new URL(localApi);
      finalLocalUrl = parsed.origin + '/api/public/leads';
    } catch (e) {
      finalLocalUrl = 'http://localhost:3000/api/public/leads';
    }

    var syncToAutoHallBase = form.dataset.syncAutohall === 'true';
    var autoHallApiUrl = form.dataset.autohallApi || '';

    var cid  = form.dataset.campaign || '';
    var lpid = form.dataset.lp       || '';
    var pvid = form.dataset.pv       || '';

    // Dynamic field extraction
    var d = {};
    var phone = '';
    var email = '';
    var city = '';
    var nom = '';
    var prenom = '';
    var fullName = '';

    form.querySelectorAll('input,select,textarea').forEach(function(el) {
      if (!el.name || el.type === 'submit') return;
      var val = el.type === 'checkbox' ? el.checked : el.value;
      d[el.name] = val;

      if (el.type === 'tel' || el.name === 'phone' || el.name === 'tel') {
        phone = val;
      } else if (el.type === 'email' || el.name === 'email') {
        email = val;
      } else if (el.name === 'city' || el.name === 'ville' || el.tagName.toLowerCase() === 'select') {
        city = val;
      } else if (el.name === 'nom' || el.name === 'lastName') {
        nom = val;
      } else if (el.name === 'prenom' || el.name === 'firstName') {
        prenom = val;
      } else if (el.name === 'fullName' || el.name === 'name') {
        fullName = val;
      }
    });

    if (!fullName) {
      fullName = ((prenom || '') + ' ' + (nom || '')).trim();
    }
    if (!fullName) {
      var textEl = form.querySelector('input[type="text"]');
      if (textEl) fullName = textEl.value;
    }

    var btn = form.querySelector('[data-submit]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" style="animation: fpRotate 1s linear infinite; width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Envoi…';
    }

    function isUUID(str) {
      if (!str) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    }

    var payload = {
      fullName: fullName,
      phone: phone,
      email: email,
      vehicleModel: d.model || d.vehicleModel || '',
      city: city || d.ville || '',
      message: d.message || '',
      requestType: form.dataset.reqType || 'TEST_DRIVE',
      sourceUrl: (function(){ var h=window.location.href||''; return (!h||h.indexOf('file://')===0)?'http://offline-export.autohall.local':h; })(),
      rawPayload: d,
      campaignId:    isUUID(cid)  ? cid  : undefined,
      landingPageId: isUUID(lpid) ? lpid : undefined,
      pageVersionId: isUUID(pvid) ? pvid : undefined
    };

    // Étape 2 : Pipeline Interne (Dashboard Builder)
    var localSuccess = false;
    try {
      var localRes = await fetch(finalLocalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (localRes.ok) {
        localSuccess = true;
      } else {
        var errBody = '';
        try { errBody = await localRes.text(); } catch(e) {}
        console.error('[AutoHall] Lead submission failed — HTTP ' + localRes.status, errBody);
        console.error('[AutoHall] Payload sent:', JSON.stringify(payload));
        console.error('[AutoHall] Target URL:', finalLocalUrl);
      }
    } catch (err) {
      console.error('[AutoHall] Lead submission network error:', err);
      console.error('[AutoHall] Target URL:', finalLocalUrl);
      console.error('[AutoHall] CORS note: verify backend CORS allows null origin (file://)');
    }

    // Étape 2.5 : Fallback direct CRM pour Ford Promo
    var isFord = form.closest('[data-block="ford-promo"]') !== null || cid === 'ford-promo';
    if (!localSuccess && isFord) {
      try {
        var fd = new FormData();
        form.querySelectorAll('input,select,textarea').forEach(function(el) {
          if (el.name) fd.append(el.name, el.type === 'checkbox' ? (el.checked ? 'true' : '') : el.value);
        });
        var extRes = await fetch('https://fordpromo.myautohall.ma/js/Acontact.php', {
          method: 'POST',
          body: fd
        });
        if (extRes.ok) {
          localSuccess = true;
        }
      } catch (err) {
        console.error('Erreur de fallback CRM', err);
      }
    }

    // Étape 3 : Pipeline Externe Optionnel (Réseau Central Auto Hall)
    if (syncToAutoHallBase && autoHallApiUrl) {
      try {
        var extRes = await fetch(autoHallApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'Landing Page Builder',
            capturedAt: new Date().toISOString(),
            data: payload
          })
        });
        if (!extRes.ok) {
          console.error('Erreur de synchronisation avec la base centrale Auto Hall: status ' + extRes.status);
        }
      } catch (err) {
        console.error('Erreur de synchronisation avec la base centrale Auto Hall', err);
      }
    }

    // Finalisation
    if (localSuccess) {
      showOk(form);
    } else {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.getAttribute('data-original-label') || 'Réessayer';
      }
      showErr(form);
    }
  }
  function showOk(form){
    var parent = form.closest('.fp-form-col') || form;
    var s = parent.querySelector('[data-success]');
    form.querySelectorAll('[data-step],[data-stepper],[data-progress],[data-step-indicator]').forEach(function(el){el.style.display='none';});
    var fc = parent.querySelector('[data-form-container]');
    if(fc) fc.style.display='none';
    var err = parent.querySelector('[data-error]');
    if(err) err.style.display='none';
    if(s) {
      s.style.display='flex';
      var modelVal = form.querySelector('[name="testdrive[modele]"], select')?.value || '';
      var dateVal = form.querySelector('[name="testdrive[dateessai]"], input[type="date"]')?.value || '';
      var brandVal = form.querySelector('[name="testdrive[brand]"]')?.value || '';
      var rBrand = s.querySelector('[data-recap-brand]');
      var rModel = s.querySelector('[data-recap-model]');
      var rDate = s.querySelector('[data-recap-date]');
      if (rBrand && brandVal) rBrand.textContent = brandVal;
      if (rModel && modelVal) rModel.textContent = modelVal;
      if (rDate && dateVal) rDate.textContent = dateVal;
    }
  }
  function showErr(form){
    var parent = form.closest('.fp-form-col') || form;
    var e = parent.querySelector('[data-error]') || form.querySelector('[data-error]');
    if(e) e.style.display='';
  }
  function validate(step){
    var ok=true;
    step.querySelectorAll('input,select,textarea').forEach(function(el){
      if (el.hasAttribute('required') || el.willValidate) {
        if (!el.checkValidity()) {
          el.style.borderColor='#ef4444';
          el.style.boxShadow='0 0 0 2px rgba(239, 68, 68, 0.2)';
          ok=false;
        } else {
          el.style.borderColor='';
          el.style.boxShadow='';
        }
      }
    });
    return ok;
  }
  function initSingle(form){
    var btn=form.querySelector('[data-submit]');
    if(btn)btn.addEventListener('click',function(){sub(form);});
  }
  function initMulti(form){
    var steps=Array.from(form.querySelectorAll('[data-step]'));
    var dots=Array.from(form.querySelectorAll('[data-dot]'));
    var cur=0;
    var accent=form.dataset.accent||'#288fe3';
    var ind=form.querySelector('[data-step-indicator]');
    var bar=form.querySelector('[data-progress]');
    function go(n){
      steps.forEach(function(s,i){s.style.display=i===n?'':'none';});
      dots.forEach(function(d,i){d.style.background=i===n?accent:'#e2e8f0';});
      if(ind)ind.textContent='Étape '+(n+1)+'/'+steps.length;
      if(bar)bar.style.width=((n+1)/steps.length)*100+'%';
      cur=n;
    }
    dots.forEach(function(d,i){
      d.addEventListener('click',function(){
        if(i===cur)return;
        if(i<cur){
          go(i);
        }else{
          var valid=true;
          for(var sIdx=cur;sIdx<i;sIdx++){
            if(!validate(steps[sIdx])){
              valid=false;
              go(sIdx);
              break;
            }
          }
          if(valid)go(i);
        }
      });
    });
    form.querySelectorAll('[data-next]').forEach(function(btn){
      btn.addEventListener('click',function(){if(validate(steps[cur])&&cur<steps.length-1)go(cur+1);});
    });
    form.querySelectorAll('[data-back]').forEach(function(btn){
      btn.addEventListener('click',function(){if(cur>0)go(cur-1);});
    });
    form.querySelectorAll('[data-submit]').forEach(function(btn){
      btn.addEventListener('click',function(){if(validate(steps[cur]))sub(form);});
    });
    go(0);
  }
  document.querySelectorAll('.lp-form, [data-single-form]').forEach(initSingle);
  document.querySelectorAll('.lp-multi-form, [data-multi-form]').forEach(initMulti);
})();
</script>`;
}

// ── Main export function ──────────────────────────────────────────────────────

export function generateExportHtml(document: BuilderDocument, ctx: ExportContext = {}): string {
  const root = document.nodes[document.rootId];
  if (!root) return '<!DOCTYPE html><html><body></body></html>';

  const theme = getActiveTheme(document);

  // Le contexte de landing page (marque/modèle actif) vit sur le document — on le fusionne
  // ici pour que tous les blocs (Hero, Specs Showroom...) y aient accès à l'export sans que
  // chaque appelant de `generateExportHtml` ait à le reporter manuellement.
  const mergedCtx: ExportContext = {
    ...ctx,
    landingPageType: document.meta.landingPageType ?? ctx.landingPageType,
    selectedBrandId: document.meta.selectedBrandId ?? ctx.selectedBrandId,
    selectedModelName: document.meta.selectedModelName ?? ctx.selectedModelName,
  };

  const bodyHtml = root.children
    .map((id: string) => document.nodes[id] ? renderNode(document.nodes[id], document.nodes, mergedCtx, theme) : '')
    .join('\n');

  const title = esc(document.meta.seoTitle || document.meta.title || 'Landing Page');
  const description = document.meta.seoDescription?.trim();
  const descriptionTag = description ? `\n  <meta name="description" content="${esc(description)}" />` : '';
  // Custom head scripts (GTM/Meta Pixel...) are the page owner's own trusted embed code for
  // their own published page — injected verbatim, not escaped, same trust model as any
  // other page-builder "custom code" field.
  const headScripts = document.meta.headScripts?.trim();
  const headScriptsBlock = headScripts ? `\n  ${headScripts}` : '';
  const apiBaseUrl = (
    import.meta.env.VITE_BACKEND_URL
    || import.meta.env.VITE_API_BASE_URL
    || ctx.apiBaseUrl
    || 'http://localhost:3000'
  ).replace(/\/$/, '');
  const apiEndpoint = `${apiBaseUrl}/api/public/leads`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>${descriptionTag}${headScriptsBlock}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
  <style>
    :root {
      --brand-primary: ${theme.primaryColor};
      --brand-secondary: ${theme.secondaryColor};
      --brand-radius: ${theme.buttonRadius};
      --brand-font: ${theme.fontFamily};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--brand-font, 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif); color: #111827; background: #fff; line-height: 1.5; }
    img { display: block; max-width: 100%; }
    button, a { font-family: inherit; }
    section, footer { width: 100%; }
    details > summary::-webkit-details-marker { display: none; }
    /* Typography scale */
    h1,h2,h3,h4,h5,h6 { font-family: var(--brand-font, 'Outfit', sans-serif); font-weight:800; line-height:1.18; letter-spacing:-0.025em; color:#111827; margin:0 0 16px; }
    h1{font-size:clamp(2rem,5vw,3.5rem);} h2{font-size:clamp(1.6rem,3.5vw,2.5rem);} h3{font-size:clamp(1.25rem,2.5vw,1.75rem);}
    p{margin:0 0 14px;font-size:16px;line-height:1.72;color:#4b5563;} p:last-child{margin-bottom:0;}
    ul,ol{padding-left:1.5em;margin:0 0 14px;} li{font-size:15px;line-height:1.6;color:#374151;}
    blockquote{margin:0 0 14px;padding:16px 20px;border-left:4px solid #e85d04;background:#fff7f0;border-radius:0 8px 8px 0;font-size:16px;font-style:italic;color:#374151;}
    strong{font-weight:700;color:#111827;} a{color:#e85d04;}
    /* Responsive grids */
    @media (max-width: 768px) {
      [style*="grid-template-columns: 2fr"] { grid-template-columns: 1fr !important; }
      [style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
      [style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
      [style*="padding: 72px"] { padding-top:48px!important; padding-bottom:48px!important; }
      [style*="padding: 80px"] { padding-top:48px!important; padding-bottom:48px!important; }
    }
    @media (max-width: 480px) {
      [style*="grid-template-columns: repeat(2"] { grid-template-columns: 1fr !important; }
    }
    /* Hero Form Block — variant responsive */
    @media (max-width: 860px) {
      .hfb-split { grid-template-columns: 1fr !important; gap: 32px !important; padding: 48px 5% !important; }
      .hfb-split-left { display: flex !important; flex-direction: column !important; padding: 48px 5% !important; }
      .hfb-split-left .hfb-form { order: 2; width: 100% !important; max-width: 460px !important; margin: 0 auto !important; }
      .hfb-floating { grid-template-columns: 1fr !important; gap: 32px !important; padding: 48px 5% !important; }
      .hfb-floating .hfb-form { width: 100% !important; max-width: 460px !important; margin: 0 auto !important; }
      .hfb-overlay { display: flex !important; flex-direction: column !important; gap: 32px !important; padding: 48px 5% !important; min-height: 0 !important; }
      .hfb-overlay .hfb-form { position: static !important; transform: none !important; width: 100% !important; max-width: 460px !important; margin: 0 auto !important; }
      .hfb-centered .hfb-form { max-width: 100% !important; }
    }
    @media (max-width: 480px) {
      .hfb-card { border-radius: 16px !important; padding: 20px !important; }
    }
  </style>
  <script>
    const API_ENDPOINT = ${JSON.stringify(apiEndpoint)};
    var __EXPORT_API_URL__ = ${JSON.stringify(apiBaseUrl)};
  </script>
</head>
<body>
${bodyHtml}
</body>
${buildFormScript()}
</html>`;
}
