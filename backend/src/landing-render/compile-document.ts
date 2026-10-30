import { escapeHtml } from './block-renderer';

function resolveFormSteps(props: any): any[] {
  if (props.steps && props.steps.length) return props.steps;

  const enabledFields = (props.fields || []).filter((f: any) => f.enabled !== false);
  if (enabledFields.length === 0) return [];

  const stepCount = props.stepCount || 1;
  if (stepCount === 1 || enabledFields.length <= 3) {
    return [
      {
        id: 'step-1',
        title: props.stepTitle ?? props.title ?? 'Formulaire',
        description: props.stepDescription ?? props.subtitle,
        fieldIds: enabledFields.map((f: any) => f.id),
      },
    ];
  }

  const stepsList: any[] = [];
  const chunkSize = Math.ceil(enabledFields.length / stepCount);
  for (let i = 0; i < stepCount; i++) {
    const slice = enabledFields.slice(i * chunkSize, (i + 1) * chunkSize);
    stepsList.push({
      id: `step-${i + 1}`,
      title: `Étape ${i + 1}`,
      description: '',
      fieldIds: slice.map((f: any) => f.id),
    });
  }
  return stepsList;
}

function getFieldsForStep(fields: any[], step: any): any[] {
  const idSet = new Set(step.fieldIds || []);
  return fields.filter((f) => f.enabled !== false && idSet.has(f.id));
}

export type CompileOptions = {
  assetMap?: Record<string, { exportPath: string; absolutePath: string; url: string }>;
  mode?: 'preview' | 'export';
};

export function compileDocument(document: any, options: CompileOptions = {}): { html: string; css: string } {
  const nodes = document.nodes || {};
  const rootId = document.rootId;
  const mode = options.mode || 'preview';

  // 1. Compile CSS Stylesheet
  let css = `
    /* AutoHall LP Builder V4 Compiled Stylesheet */
    :root {
      --hfr-accent: #e85d04;
    }
  `;

  for (const nodeId of Object.keys(nodes)) {
    const node = nodes[nodeId];
    if (!node) continue;

    // Desktop style
    const desktopStyle = nodeToCssDeclaration(node, 'desktop');
    if (desktopStyle.trim()) {
      css += `\n[data-v4-node-id="${nodeId}"] { ${desktopStyle} }`;
    }
  }

  // Tablet style overrides
  css += `\n@media (max-width: 768px) {`;
  for (const nodeId of Object.keys(nodes)) {
    const node = nodes[nodeId];
    if (!node) continue;
    const tabletStyle = nodeToCssDeclaration(node, 'tablet');
    if (tabletStyle.trim()) {
      css += `\n  [data-v4-node-id="${nodeId}"] { ${tabletStyle} }`;
    }
  }
  css += `\n}`;

  // Mobile style overrides
  css += `\n@media (max-width: 480px) {`;
  for (const nodeId of Object.keys(nodes)) {
    const node = nodes[nodeId];
    if (!node) continue;
    const mobileStyle = nodeToCssDeclaration(node, 'mobile');
    if (mobileStyle.trim()) {
      css += `\n  [data-v4-node-id="${nodeId}"] { ${mobileStyle} }`;
    }
  }
  css += `\n}`;

  // 2. Compile HTML starting from rootId
  const html = renderNode(rootId, nodes, options);

  return { html, css };
}

function renderNode(nodeId: string, nodes: Record<string, any>, options: CompileOptions): string {
  const node = nodes[nodeId];
  if (!node) return '';
  if (node.visibility?.hidden) return '';

  const childHtml = (node.children || [])
    .map((childId: string) => renderNode(childId, nodes, options))
    .join('\n');

  switch (node.kind) {
    case 'text':
      return renderTextNode(node);
    case 'image':
      return renderImageNode(node, childHtml, options);
    case 'button':
      return renderButtonNode(node);
    case 'form':
      return renderFormNode(node, options);
    case 'card':
      return `<div class="v4-card-node" data-v4-node-id="${node.id}">${childHtml}</div>`;
    case 'section':
      if (isProBlock(node)) {
        return renderProBlock(node, options);
      }
      return `
        <section class="v4-container-node v4-container-node--section" data-v4-node-id="${node.id}">
          ${childHtml}
        </section>
      `.trim();
    case 'frame':
    case 'stack':
      return `
        <div class="v4-container-node v4-container-node--${node.kind}" data-v4-node-id="${node.id}">
          ${childHtml}
        </div>
      `.trim();
    default:
      return childHtml;
  }
}

// ── Text rendering ──
function renderTextNode(node: any): string {
  const props = node.props || {};
  const tag = props.tag || 'p';
  const text = props.text || props.content || '';
  const escapedText = escapeHtml(text).replace(/\n/g, '<br />');
  return `<${tag} class="v4-text-node" data-v4-node-id="${node.id}">${escapedText}</${tag}>`;
}

// ── Image rendering ──
function renderImageNode(node: any, children: string, options: CompileOptions): string {
  const props = node.props || {};
  const assetMap = options.assetMap || {};
  const isHeroImage = node.name === 'HeroImage' || node.name === 'ImageLayer';

  // Resolve source URL
  let src = props.src || '';
  const assetId = props.assetId;
  if (assetId && assetMap[assetId]) {
    src = options.mode === 'export' ? assetMap[assetId].exportPath : assetMap[assetId].url;
  }

  const alt = escapeHtml(props.alt || 'Visuel de campagne');

  let overlayHtml = '';
  if (props.overlayEnabled) {
    const gradient = imageOverlayGradient(
      props.overlayColor || '#000000',
      props.overlayOpacity || 35,
      props.overlayDirection || 'to-bottom',
      props.overlayGradient !== false
    );
    const blendMode = props.overlayBlendMode || 'normal';
    overlayHtml = `
      <div class="v4-image-node__overlay" style="background: ${gradient}; mix-blend-mode: ${blendMode}; position: absolute; inset: 0; pointer-events: none;"></div>
    `.trim();
  }

  // Visual text overlay content inside the image
  const contentHtml = children ? `<div class="v4-image-node__content" style="position: relative; z-index: 10; width: 100%; height: 100%;">${children}</div>` : '';

  return `
    <div class="v4-image-node" data-v4-node-id="${node.id}" style="position: relative; overflow: hidden; display: flex; width: 100%; height: 100%;">
      <img src="${escapeHtml(src)}" alt="${alt}" style="width: 100%; height: 100%; display: block;" />
      ${overlayHtml}
      ${contentHtml}
    </div>
  `.trim();
}

// ── Button rendering ──
function renderButtonNode(node: any): string {
  const props = node.props || {};
  const variant = props.variant || 'primary';
  const label = escapeHtml(props.label || 'Bouton');
  const href = props.href ? escapeHtml(props.href) : '#';

  return `
    <a href="${href}" class="v4-button-node v4-button-node--${variant}" data-v4-node-id="${node.id}">
      <span>${label}</span>
    </a>
  `.trim();
}

// ── Form rendering ──
function renderFormNode(node: any, options: CompileOptions): string {
  const props = node.props || {};
  const steps = resolveFormSteps(props);
  const isSingleStep = steps.length <= 1;
  const submitLabel = escapeHtml(props.submitLabel || 'Envoyer');
  const consentLabel = escapeHtml(props.consentLabel || "J'accepte d'être contacté par Auto Hall.");
  const showConsent = props.showConsent !== false;

  // Dots indicator
  let stepperHtml = '';
  if (!isSingleStep && props.showProgress !== false) {
    stepperHtml = `
      <div class="hfr-stepper-wrap" data-lp-step-indicator>
        ${steps.map((step: any, i: number) => `
          ${i > 0 ? `<div class="hfr-stepper__line ${i === 0 ? 'hfr-stepper__line--done' : ''}" data-step-line="${i}"></div>` : ''}
          <button type="button" class="hfr-stepper__dot ${i === 0 ? 'hfr-stepper__dot--active' : ''}" data-step-dot="${i}" aria-label="Étape ${i + 1}"></button>
        `).join('')}
      </div>
    `.trim();
  }

  // Confirmation panel
  const successMessage = escapeHtml(props.successMessage || 'Merci pour votre demande !');
  const redirectUrlAttr = props.redirectUrl ? ` data-redirect-url="${escapeHtml(props.redirectUrl)}"` : '';

  const stepPanelsHtml = steps.map((step: any, i: number) => {
    const isFirst = i === 0;
    const isLast = i === steps.length - 1;
    const fields = getFieldsForStep(props.fields || [], step);

    const fieldsHtml = fields.map((f: any) => {
      const type = f.type || 'text';
      const requiredAttr = f.required ? ' required' : '';
      const requiredStar = f.required ? '<span class="hfr-required">*</span>' : '';
      const placeholder = f.placeholder ? ` placeholder="${escapeHtml(f.placeholder)}"` : '';
      const label = escapeHtml(f.label);
      const isHalf = f.width === '50%';
      const halfClass = isHalf ? ' hfr-field-wrap--half' : '';

      let controlHtml = '';

      if (type === 'checkbox' || f.id === 'consent') {
        controlHtml = `
          <label class="hfr-consent">
            <input type="checkbox" name="${f.id}" class="hfr-consent__check"${requiredAttr} />
            <span class="hfr-consent__text">${label}${requiredStar}</span>
          </label>
        `;
      } else if (f.id === 'city' || f.id === 'ville') {
        // Search combobox for cities (Morocco cities list)
        controlHtml = `
          <div class="hfr-field">
            <label class="hfr-field__label" for="city-input">${label}${requiredStar}</label>
            <div class="hfr-city-combo" role="combobox" aria-expanded="false">
              <div class="hfr-city-combo__input-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hfr-city-combo__icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" id="city-input" class="hfr-field__input hfr-city-combo__input" placeholder="${escapeHtml(f.placeholder || 'Rechercher une ville…')}" autocomplete="off" />
                <input type="hidden" name="${f.id}" class="hfr-city-combo__value"${requiredAttr} />
              </div>
              <ul class="hfr-city-combo__list" role="listbox" style="display: none;"></ul>
            </div>
          </div>
        `;
      } else if (type === 'select' || f.id === 'model' || f.id === 'vehicleModel') {
        const options = f.options || [];
        controlHtml = `
          <div class="hfr-field">
            <label class="hfr-field__label">${label}${requiredStar}</label>
            <select class="hfr-field__input hfr-field__select" name="${f.id}"${requiredAttr}>
              <option value="">${escapeHtml(f.placeholder || 'Sélectionner…')}</option>
              ${options.map((opt: string) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (type === 'textarea') {
        controlHtml = `
          <div class="hfr-field">
            <label class="hfr-field__label">${label}${requiredStar}</label>
            <textarea class="hfr-field__input hfr-field__input--textarea" name="${f.id}"${placeholder}${requiredAttr}></textarea>
          </div>
        `;
      } else {
        const htmlType = type === 'phone' ? 'tel' : type === 'email' ? 'email' : type === 'date' ? 'date' : 'text';
        controlHtml = `
          <div class="hfr-field">
            <label class="hfr-field__label">${label}${requiredStar}</label>
            <input type="${htmlType}" class="hfr-field__input" name="${f.id}"${placeholder}${requiredAttr} />
          </div>
        `;
      }

      return `
        <div class="hfr-field-wrap${halfClass}" data-field-id="${f.id}">
          ${controlHtml}
        </div>
      `;
    }).join('\n');

    // Action buttons for step
    let actionsHtml = '';
    if (isSingleStep) {
      actionsHtml = `
        <button type="submit" class="hfr-btn hfr-btn--next">
          <span>${submitLabel}</span>
        </button>
      `;
    } else {
      const backBtn = !isFirst
        ? `<button type="button" class="hfr-btn hfr-btn--back" data-lp-form-back>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden><polyline points="15 18 9 12 15 6" /></svg>
            <span>${escapeHtml(step.backLabel || props.backLabel || 'Retour')}</span>
          </button>`
        : '<span></span>';

      const nextBtn = isLast
        ? `<button type="submit" class="hfr-btn hfr-btn--next">
            <span>${submitLabel}</span>
          </button>`
        : `<button type="button" class="hfr-btn hfr-btn--next" data-lp-form-advance>
            <span>${escapeHtml(step.nextLabel || 'Continuer')}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden><polyline points="9 18 15 12 9 6" /></svg>
          </button>`;

      actionsHtml = `
        <div class="hfr-actions">
          ${backBtn}
          ${nextBtn}
        </div>
      `;
    }

    return `
      <div class="lp-lead-form__step" data-lp-form-step="${i + 1}"${isFirst ? '' : ' hidden'}>
        ${step.title ? `<h2 class="hfr-step-title">${escapeHtml(step.title)}</h2>` : ''}
        ${step.description ? `<p class="hfr-step-desc">${escapeHtml(step.description)}</p>` : ''}
        <div class="hfr-fields">${fieldsHtml}</div>
        <p class="hfr-submit-error lp-lead-form__feedback" role="status" aria-live="polite" style="display: none;"></p>
        ${actionsHtml}
      </div>
    `;
  }).join('\n');

  const stepTitlesAttr = steps.length > 1
    ? ` data-lp-step-titles="${escapeHtml(JSON.stringify(steps.map((s: any) => ({ title: s.title || '', description: s.description || '' }))))}"`
    : '';

  return `
    <div class="v4-form-node" data-v4-node-id="${node.id}">
      <div class="hfr-card" style="border-radius: ${props.cardRadius ?? 24}px; background: ${props.cardBackground ?? '#ffffff'}; color: ${props.textColor ?? '#111827'}; padding: ${props.cardSpacing ?? 28}px; --hfr-accent: ${props.accentColor ?? '#e85d04'};">
        ${stepperHtml}
        <div class="hfr-card__body">
          <form class="lp-lead-form lp-lead-form__form" novalidate data-lp-step-count="${steps.length}" data-lp-current-step="1"${redirectUrlAttr}${stepTitlesAttr}>
            ${stepPanelsHtml}
            <div class="hfr-confirmation" style="display: none;">
              <div class="hfr-confirmation__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 class="hfr-confirmation__title">${successMessage}</h2>
              <dl class="hfr-confirmation__recap" style="display: none;"></dl>
            </div>
          </form>
        </div>
      </div>
    </div>
  `.trim();
}

// ── Pro Block Rendering ──
function isProBlock(node: any): boolean {
  const bt = node.props?.blockType;
  // Also detect by node.name for ProBlocks that omit blockType in older docs
  const nm = (node.name || '').toLowerCase();
  if (nm === 'campaign-gamme-thermique' || nm === 'campaigngammethermique') return true;
  if (nm === 'brand-navbar' || nm === 'brandnavbar') return true;
  if (nm === 'ford-promo' || nm === 'fordpromo') return true;
  return [
    'hero', 'hero-form', 'text-block', 'image-block', 'video-block', 'button-block', 'form-block',
    'features-grid', 'stats-banner', 'cta-banner', 'models-showcase',
    'faq-block', 'gallery-block', 'footer-block', 'testimonials-block',
    'campaign-gamme-thermique', 'brand-navbar', 'ford-promo',
  ].includes(bt);
}

function renderProBlock(node: any, options: CompileOptions): string {
  const props = node.props || {};
  const blockType = props.blockType;

  switch (blockType) {
    case 'hero':
      return renderHero(props);
    case 'hero-form':
      return renderHeroForm(node, options);
    case 'text-block':
      return renderTextBlock(props);
    case 'image-block':
      return renderImageBlock(props, options);
    case 'video-block':
      return renderVideoBlock(props);
    case 'button-block':
      return renderButtonBlock(props);
    case 'form-block':
      return renderFormNode(node, options);
    case 'features-grid':
      return renderFeaturesGrid(props);
    case 'stats-banner':
      return renderStatsBanner(props);
    case 'cta-banner':
      return renderCtaBanner(props);
    case 'models-showcase':
      return renderModelsShowcase(props);
    case 'faq-block':
      return renderFAQBlock(props);
    case 'gallery-block':
      return renderGalleryBlock(props);
    case 'testimonials-block':
      return renderTestimonialsBlock(props);
    case 'footer-block':
      return renderFooterBlock(props);
    case 'campaign-gamme-thermique':
      return renderCampaignGammeThermique(props);
    case 'brand-navbar':
      return renderBrandNavbar(props);
    case 'ford-promo':
      return renderFordPromo(props);
    default: {
      // Fallback: detect by node name when blockType is missing/mismatched
      const nodeName = (node.name || '').toLowerCase();
      if (nodeName === 'campaign-gamme-thermique' || nodeName === 'campaigngammethermique')
        return renderCampaignGammeThermique(props);
      if (nodeName === 'brand-navbar' || nodeName === 'brandnavbar')
        return renderBrandNavbar(props);
      if (nodeName === 'ford-promo' || nodeName === 'fordpromo')
        return renderFordPromo(props);
      return '';
    }
  }
}

// ── Core Block Html Renderers ──

function renderHero(props: any): string {
  const bgStyle = props.backgroundImage
    ? `background-image: linear-gradient(135deg, ${props.gradientFrom || 'rgba(0,44,95,0.7)'} 0%, ${props.gradientTo || 'rgba(0,0,0,0.85)'} 100%), url('${escapeHtml(props.backgroundImage)}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${props.gradientFrom || '#002c5f'} 0%, ${props.gradientTo || '#000000'} 100%);`;

  const align = props.layout === 'center' ? 'center' : props.layout === 'right' ? 'flex-end' : 'flex-start';
  const textAlign = props.layout === 'center' ? 'center' : props.layout === 'right' ? 'right' : 'left';

  return `
    <section class="lp-hero-block" style="${bgStyle} min-height: ${props.minHeight || '65vh'}; display: flex; align-items: center; justify-content: ${align}; padding: 80px 24px; width: 100%; box-sizing: border-box;">
      <div style="max-width: 720px; width: 100%; display: flex; flex-direction: column; gap: 20px; text-align: ${textAlign}; align-items: ${align}; color: #ffffff; font-family: 'Outfit', sans-serif;">
        ${props.title ? `<h1 style="font-size: 48px; font-weight: 900; line-height: 1.1; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">${escapeHtml(props.title)}</h1>` : ''}
        ${props.subtitle ? `<p style="font-size: 20px; line-height: 1.6; color: rgba(255,255,255,0.9); margin: 0;">${escapeHtml(props.subtitle)}</p>` : ''}
        ${props.ctaText ? `<a href="${escapeHtml(props.ctaUrl || '#')}" style="margin-top: 12px; padding: 14px 36px; background-color: #e85d04; color: #ffffff; font-weight: 700; font-size: 15px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 20px rgba(232,93,4,0.3); display: inline-block;">${escapeHtml(props.ctaText)}</a>` : ''}
      </div>
    </section>
  `.trim();
}

function renderHeroForm(node: any, options: CompileOptions): string {
  const props = node.props || {};
  const bgStyle = props.backgroundImage
    ? `background-image: linear-gradient(135deg, ${props.gradientFrom || 'rgba(0,44,95,0.7)'} 0%, ${props.gradientTo || 'rgba(0,0,0,0.85)'} 100%), url('${escapeHtml(props.backgroundImage)}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${props.gradientFrom || '#002c5f'} 0%, ${props.gradientTo || '#000000'} 100%);`;

  const formHtml = renderFormNode(node, options);

  return `
    <section class="lp-hero-form-block" style="${bgStyle} min-height: 75vh; padding: 80px 24px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
      <div class="lp-hero-form-container" style="max-width: 1200px; width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: center;">
        <div style="color: #ffffff; font-family: 'Outfit', sans-serif;">
          ${props.title ? `<h1 style="font-size: 48px; font-weight: 900; line-height: 1.15; margin: 0 0 20px; text-transform: uppercase; letter-spacing: -0.02em;">${escapeHtml(props.title)}</h1>` : ''}
          ${props.subtitle ? `<p style="font-size: 20px; line-height: 1.6; color: rgba(255,255,255,0.85); margin: 0;">${escapeHtml(props.subtitle)}</p>` : ''}
        </div>
        <div style="display: flex; justify-content: center; width: 100%;">
          ${formHtml}
        </div>
      </div>
    </section>
  `.trim();
}

function renderTextBlock(props: any): string {
  return `
    <section style="background: ${props.background || '#ffffff'}; color: ${props.textColor || '#111827'}; padding: ${props.paddingTop ?? 60}px 24px ${props.paddingBottom ?? 60}px; width: 100%; box-sizing: border-box; display: flex; justify-content: center;">
      <div class="lp-text-content" style="max-width: 800px; width: 100%; font-size: 16px; line-height: 1.7; font-family: 'Inter', sans-serif;">
        ${props.textContent || ''}
      </div>
    </section>
  `.trim();
}

function renderImageBlock(props: any, options: CompileOptions): string {
  const overlayHtml = props.imageOverlayEnabled
    ? `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: ${props.imageOverlayColor || 'rgba(0,0,0,0.3)'}; opacity: ${(props.imageOverlayOpacity ?? 35) / 100}; border-radius: ${props.borderRadius ?? 16}px;"></div>`
    : '';

  return `
    <section style="padding: 40px 24px; width: 100%; box-sizing: border-box; display: flex; justify-content: center; background: #ffffff;">
      <div style="position: relative; width: 100%; max-width: 1000px; aspect-ratio: ${props.imageAspectRatio || '16/9'}; overflow: hidden; border-radius: ${props.borderRadius ?? 16}px;">
        <img src="${escapeHtml(props.imageSrc || '')}" alt="${escapeHtml(props.imageAlt || '')}" style="width: 100%; height: 100%; object-fit: ${props.imageFit || 'cover'};" />
        ${overlayHtml}
      </div>
    </section>
  `.trim();
}

function renderVideoBlock(props: any): string {
  let embedUrl = props.videoUrl || '';
  if (embedUrl.includes('youtube.com/watch?v=')) {
    const id = embedUrl.split('v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  } else if (embedUrl.includes('youtu.be/')) {
    const id = embedUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }

  return `
    <section style="padding: 40px 24px; width: 100%; box-sizing: border-box; display: flex; justify-content: center; background: #ffffff;">
      <div style="width: 100%; max-width: 960px; aspect-ratio: ${props.videoAspectRatio || '16/9'}; border-radius: ${props.videoRadius ?? 16}px; box-shadow: ${props.videoShadow ? '0 12px 30px rgba(0,0,0,0.12)' : 'none'}; overflow: hidden; background: #000000; position: relative;">
        <iframe src="${escapeHtml(embedUrl)}" title="Video Player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%;"></iframe>
      </div>
    </section>
  `.trim();
}

function renderButtonBlock(props: any): string {
  const align = props.buttonAlignment === 'left' ? 'flex-start' : props.buttonAlignment === 'right' ? 'flex-end' : 'center';

  return `
    <div style="padding: 24px 24px; display: flex; justify-content: ${align}; width: 100%; box-sizing: border-box; background: #ffffff;">
      <a href="${escapeHtml(props.buttonUrl || '#')}" style="padding: 14px 36px; background-color: ${props.buttonVariant === 'outline' ? 'transparent' : (props.accentColor || '#e85d04')}; border: 2px solid ${props.accentColor || '#e85d04'}; color: ${props.buttonVariant === 'outline' ? (props.accentColor || '#e85d04') : '#ffffff'}; font-weight: 700; font-size: 15px; border-radius: 8px; text-decoration: none;">
        ${escapeHtml(props.buttonLabel || 'Bouton')}
      </a>
    </div>
  `.trim();
}

// ── Pro Icons Map ──
const ICON_MAP: Record<string, string> = {
  Shield:   'M12 2L3 7v5c0 5.25 3.84 10.15 9 11.36C17.16 22.15 21 17.25 21 12V7l-9-5z',
  Percent:  'M19 5L5 19M9 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm11 11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  Truck:    'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v7a2 2 0 0 1-2 2h-2m-7 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm7 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z',
  Wrench:   'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  Star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  Phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  Award:    'M12 15l-8 3 8-14 8 14-8-3zm0 0v6',
  Check:    'M20 6L9 17l-5-5',
  Car:      'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v7a2 2 0 0 1-2 2h-2',
  MapPin:   'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  Calendar: 'M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 6h18M8 2v4M16 2v4',
  Zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
};

function renderProIcon(name: string, color = 'currentColor'): string {
  const path = ICON_MAP[name] ?? ICON_MAP.Star;
  return `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: block;">
      <path d="${path}" />
    </svg>
  `.trim();
}

// ── features-grid html ──
function renderFeaturesGrid(props: any): string {
  const accent = props.accentColor || '#e85d04';
  const cols = props.columns || 3;
  const items = props.items || [];

  const cardsHtml = items.map((item: any) => `
    <div style="padding: 32px 28px; border-radius: 16px; background: #ffffff; border: 1px solid #f3f4f6; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 16px;">
      <div style="width: 48px; height: 48px; border-radius: 12px; background: ${accent}15; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        ${renderProIcon(item.icon, accent)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <h3 style="font-size: 17px; font-weight: 700; color: '#111827'; margin: 0;">${escapeHtml(item.title)}</h3>
        <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.55;">${escapeHtml(item.text)}</p>
      </div>
    </div>
  `).join('\n');

  return `
    <section class="pb-section" style="padding: 72px 24px; background: #fff;">
      ${(props.title || props.subtitle) ? `
        <div style="text-align: center; margin-bottom: 56px; max-width: 640px; margin-left: auto; margin-right: auto;">
          ${props.title ? `<h2 style="font-size: 36px; font-weight: 800; color: #111827; margin: 0 0 12px; line-height: 1.2; letter-spacing: -0.025em;">${escapeHtml(props.title)}</h2>` : ''}
          ${props.subtitle ? `<p style="font-size: 17px; color: #6b7280; margin: 0; line-height: 1.6;">${escapeHtml(props.subtitle)}</p>` : ''}
        </div>
      ` : ''}
      <div class="lp-grid-layout" style="display: grid; grid-template-columns: repeat(${cols}, minmax(0, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto;">
        ${cardsHtml}
      </div>
    </section>
  `.trim();
}

// ── stats-banner html ──
function renderStatsBanner(props: any): string {
  const bg = props.background || '#111827';
  const textColor = props.textColor || '#ffffff';
  const stats = props.stats || [];

  const itemsHtml = stats.map((stat: any, i: number) => {
    const showDivider = i < stats.length - 1;
    const borderStyle = showDivider ? `border-right: 1px solid rgba(255,255,255,0.1);` : '';

    return `
      <div class="lp-stats-item" style="display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 24px; ${borderStyle}">
        <span style="font-size: 42px; font-weight: 800; color: #f59e0b; line-height: 1;">${escapeHtml(stat.value)}</span>
        <span style="font-size: 14px; font-weight: 600; color: ${textColor}; opacity: 0.9;">${escapeHtml(stat.label)}</span>
        ${stat.note ? `<span style="font-size: 12px; color: ${textColor}; opacity: 0.5;">${escapeHtml(stat.note)}</span>` : ''}
      </div>
    `;
  }).join('\n');

  return `
    <section style="padding: 56px 24px; background: ${bg}; display: flex; justify-content: center;">
      <div class="lp-stats-grid" style="display: grid; grid-template-columns: repeat(${stats.length}, 1fr); gap: 0; max-width: 1100px; width: 100%;">
        ${itemsHtml}
      </div>
    </section>
  `.trim();
}

// ── cta-banner html ──
function renderCtaBanner(props: any): string {
  const bg = props.background || `linear-gradient(135deg, #c2410c 0%, #e85d04 50%, #f97316 100%)`;
  const accent = props.accentColor || '#e85d04';

  return `
    <section style="padding: 80px 24px; background: ${bg}; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px;">
      <h2 style="font-size: 38px; font-weight: 800; color: #fff; margin: 0; max-width: 720px; line-height: 1.2; letter-spacing: -0.02em;">${escapeHtml(props.title)}</h2>
      ${props.subtitle ? `<p style="font-size: 18px; color: rgba(255,255,255,0.8); margin: 0; max-width: 560px;">${escapeHtml(props.subtitle)}</p>` : ''}
      <a href="${escapeHtml(props.buttonUrl || '#lead-form')}" style="display: inline-block; margin-top: 8px; padding: 14px 32px; border-radius: 10px; text-decoration: none; background: #fff; color: ${accent}; font-size: 16px; font-weight: 700; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">${escapeHtml(props.buttonLabel)}</a>
    </section>
  `.trim();
}

// ── models-showcase html ──
function renderModelsShowcase(props: any): string {
  const accent = props.accentColor || '#e85d04';
  const cols = props.columns || 3;
  const cards = props.cards || [];

  const cardsHtml = cards.map((card: any) => `
    <div style="border-radius: 16px; background: #fff; border: 1px solid #f3f4f6; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; flex-direction: column;">
      <div style="height: 200px; background: ${card.imageSrc ? `url(${escapeHtml(card.imageSrc)}) center/cover no-repeat` : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'}; flex-shrink: 0;"></div>
      <div style="padding: 20px 20px 24px; display: flex; flex-direction: column; gap: 8px; flex: 1;">
        <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">${escapeHtml(card.name)}</h3>
        ${card.price ? `<p style="font-size: 15px; font-weight: 600; color: ${accent}; margin: 0;">${escapeHtml(card.price)}</p>` : ''}
        <a href="#lead-form" style="display: flex; align-items: center; justify-content: center; text-decoration: none; margin-top: auto; height: 44px; border-radius: 8px; background: ${accent}; color: #fff; font-size: 14px; font-weight: 600; width: 100%;">${escapeHtml(card.ctaLabel || 'Découvrir')}</a>
      </div>
    </div>
  `).join('\n');

  return `
    <section style="padding: 72px 24px; background: #f9fafb;">
      ${(props.title || props.subtitle) ? `
        <div style="text-align: center; margin-bottom: 48px; max-width: 640px; margin-left: auto; margin-right: auto;">
          ${props.title ? `<h2 style="font-size: 36px; font-weight: 800; color: #111827; margin: 0 0 10px; letter-spacing: -0.02em;">${escapeHtml(props.title)}</h2>` : ''}
          ${props.subtitle ? `<p style="font-size: 16px; color: #6b7280; margin: 0;">${escapeHtml(props.subtitle)}</p>` : ''}
        </div>
      ` : ''}
      <div class="lp-grid-layout" style="display: grid; grid-template-columns: repeat(${cols}, minmax(0, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto;">
        ${cardsHtml}
      </div>
    </section>
  `.trim();
}

// ── faq-block html ──
function renderFAQBlock(props: any): string {
  const accent = props.accentColor || '#e85d04';
  const items = props.items || [];

  const itemsHtml = items.map((item: any) => `
    <div class="lp-faq-item" style="border: 1.5px solid #f3f4f6; border-radius: 14px; overflow: hidden; background: #fff; transition: border-color 150ms ease, background 150ms ease; margin-bottom: 10px;">
      <button type="button" class="lp-faq-toggle" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border: none; background: transparent; cursor: pointer; text-align: left; gap: 16px;">
        <span style="font-size: 16px; font-weight: 600; color: #111827; flex: 1;">${escapeHtml(item.question)}</span>
        <span class="lp-faq-toggle-icon" style="width: 28px; height: 28px; border-radius: 50%; background: #f3f4f6; color: #6b7280; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; transition: background 150ms, color 150ms;">+</span>
      </button>
      <div class="lp-faq-content" style="display: none; padding: 0 24px 20px;">
        <p style="font-size: 15px; color: #4b5563; line-height: 1.65; margin: 0;">${escapeHtml(item.answer)}</p>
      </div>
    </div>
  `).join('\n');

  return `
    <section style="padding: 72px 24px; background: #fff;">
      ${(props.title || props.subtitle) ? `
        <div style="text-align: center; margin-bottom: 48px; max-width: 640px; margin-left: auto; margin-right: auto;">
          ${props.title ? `<h2 style="font-size: 36px; font-weight: 800; color: #111827; margin: 0 0 12px; letter-spacing: -0.025em;">${escapeHtml(props.title)}</h2>` : ''}
          ${props.subtitle ? `<p style="font-size: 17px; color: #6b7280; margin: 0; line-height: 1.6;">${escapeHtml(props.subtitle)}</p>` : ''}
        </div>
      ` : ''}
      <div style="max-width: 800px; margin: 0 auto;" data-lp-faq-accent="${accent}">
        ${itemsHtml}
      </div>
    </section>
  `.trim();
}

// ── gallery-block html ──
function renderGalleryBlock(props: any): string {
  const cols = props.columns || 3;
  const images = props.images || [];
  const gap = props.gap ?? 12;
  const radius = props.borderRadius ?? 12;

  const imagesHtml = images.map((img: any) => `
    <div style="border-radius: ${radius}px; overflow: hidden; aspect-ratio: 4 / 3; background: #f3f4f6; position: relative;">
      <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || '')}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
      ${img.caption ? `
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 12px; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent); color: #fff; font-size: 12px; font-weight: 500;">
          ${escapeHtml(img.caption)}
        </div>
      ` : ''}
    </div>
  `).join('\n');

  return `
    <section style="padding: 64px 24px; background: #fff;">
      ${props.title ? `<h2 style="font-size: 34px; font-weight: 800; color: #111827; margin: 0 0 36px; text-align: center; letter-spacing: -0.02em;">${escapeHtml(props.title)}</h2>` : ''}
      <div class="lp-grid-layout" style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px; max-width: 1200px; margin: 0 auto;">
        ${imagesHtml}
      </div>
    </section>
  `.trim();
}

// ── testimonials-block html ──
function renderTestimonialsBlock(props: any): string {
  const cols = props.columns || 2;
  const items = props.items || [];
  const bg = props.background || '#f9fafb';

  const itemsHtml = items.map((item: any) => `
    <div style="padding: 28px; border-radius: 16px; background: #fff; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,.05); display: flex; flex-direction: column; gap: 16px;">
      ${item.rating ? `
        <div style="display: flex; gap: 3px;">
          ${Array.from({ length: item.rating }).map(() => `<span style="color: #f59e0b; font-size: 15px;">★</span>`).join('')}
        </div>
      ` : ''}
      <p style="font-size: 15px; color: #374151; line-height: 1.65; margin: 0; flex: 1;">"${escapeHtml(item.text)}"</p>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #e85d04, #f97316); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; flex-shrink: 0;">
          ${escapeHtml(item.author[0] || 'U')}
        </div>
        <div>
          <p style="font-size: 14px; font-weight: 700; color: #111827; margin: 0;">${escapeHtml(item.author)}</p>
          ${item.role ? `<p style="font-size: 12px; color: #9ca3af; margin: 0;">${escapeHtml(item.role)}</p>` : ''}
        </div>
      </div>
    </div>
  `).join('\n');

  return `
    <section style="padding: 72px 24px; background: ${bg};">
      ${props.title ? `<h2 style="font-size: 36px; font-weight: 800; color: #111827; margin: 0 0 48px; text-align: center; letter-spacing: -0.025em;">${escapeHtml(props.title)}</h2>` : ''}
      <div class="lp-grid-layout" style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 20px; max-width: 1100px; margin: 0 auto;">
        ${itemsHtml}
      </div>
    </section>
  `.trim();
}

// ── footer-block html ──
function renderFooterBlock(props: any): string {
  const bg = props.background || '#111827';
  const accent = props.accentColor || '#e85d04';
  const columns = props.columns || [];

  const columnsHtml = columns.map((col: any) => `
    <div>
      <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin: 0 0 14px;">${escapeHtml(col.heading)}</p>
      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
        ${(col.links || []).map((link: any) => `
          <li>
            <a href="${escapeHtml(link.href)}" style="font-size: 14px; color: #9ca3af; text-decoration: none;">${escapeHtml(link.label)}</a>
          </li>
        `).join('\n')}
      </ul>
    </div>
  `).join('\n');

  return `
    <footer style="padding: 56px 24px 36px; background: ${bg};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div class="lp-footer-grid" style="display: grid; grid-template-columns: 240px repeat(${columns.length}, 1fr); gap: 40px; margin-bottom: 48px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 10px; letter-spacing: -0.02em;">
              <span style="color: ${accent};">${escapeHtml(props.brand || 'Auto Hall')}</span>
            </div>
            ${props.tagline ? `<p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0;">${escapeHtml(props.tagline)}</p>` : ''}
          </div>
          ${columnsHtml}
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;">
          <p style="font-size: 13px; color: #6b7280; margin: 0;">${escapeHtml(props.copyright || '© 2026 Auto Hall. Tous droits réservés.')}</p>
        </div>
      </div>
    </footer>
  `.trim();
}

// ── Helpers ──
function mapAlign(value: string): string {
  const map: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
  return map[value] || value;
}

function mapJustify(value: string): string {
  const map: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    stretch: 'stretch',
  };
  return map[value] || value;
}

function formatSize(value: string | number): string {
  if (typeof value === 'number') return `${value}px`;
  return String(value);
}

function nodeToCssDeclaration(node: any, device: 'desktop' | 'tablet' | 'mobile'): string {
  let layout = node.layout || {};
  let style = node.style || {};
  let isHidden = node.visibility?.hidden || false;

  if (device === 'tablet' && node.responsive?.tablet) {
    layout = { ...layout, ...node.responsive.tablet.layout };
    style = { ...style, ...node.responsive.tablet.style };
    if (node.responsive.tablet.hidden !== undefined) isHidden = node.responsive.tablet.hidden;
  }
  if (device === 'mobile' && node.responsive?.mobile) {
    layout = { ...layout, ...node.responsive.mobile.layout };
    style = { ...style, ...node.responsive.mobile.style };
    if (node.responsive.mobile.hidden !== undefined) isHidden = node.responsive.mobile.hidden;
  }

  const rules: string[] = [];

  if (isHidden) {
    rules.push('display: none !important;');
    return rules.join(' ');
  }

  // Layout properties
  if (layout.display === 'grid') {
    rules.push('display: grid;');
    if (layout.columns) rules.push(`grid-template-columns: ${layout.columns};`);
    if (layout.rows) rules.push(`grid-template-rows: ${layout.rows};`);
  } else if (layout.display === 'flex') {
    rules.push('display: flex;');
    rules.push(`flex-direction: ${layout.direction === 'row' ? 'row' : 'column'};`);
  } else if (layout.display) {
    rules.push(`display: ${layout.display};`);
  }

  if (layout.gap !== undefined) rules.push(`gap: ${layout.gap}px;`);
  if (layout.align) rules.push(`align-items: ${mapAlign(layout.align)};`);
  if (layout.alignSelf) rules.push(`align-self: ${mapAlign(layout.alignSelf)};`);
  if (layout.justify) rules.push(`justify-content: ${mapJustify(layout.justify)};`);
  if (layout.justifySelf) rules.push(`justify-self: ${mapAlign(layout.justifySelf)};`);
  if (layout.padding !== undefined) rules.push(`padding: ${layout.padding}px;`);
  if (layout.minHeight !== undefined) rules.push(`min-height: ${formatSize(layout.minHeight)};`);
  if (layout.width !== undefined) rules.push(`width: ${formatSize(layout.width)};`);
  if (layout.maxWidth !== undefined) rules.push(`max-width: ${formatSize(layout.maxWidth)};`);
  if (layout.height !== undefined) rules.push(`height: ${formatSize(layout.height)};`);
  if (layout.flex !== undefined) rules.push(`flex: ${layout.flex};`);
  if (layout.position) rules.push(`position: ${layout.position};`);
  if (layout.top !== undefined) rules.push(`top: ${formatSize(layout.top)};`);
  if (layout.right !== undefined) rules.push(`right: ${formatSize(layout.right)};`);
  if (layout.bottom !== undefined) rules.push(`bottom: ${formatSize(layout.bottom)};`);
  if (layout.left !== undefined) rules.push(`left: ${formatSize(layout.left)};`);
  if (layout.zIndex !== undefined) rules.push(`z-index: ${layout.zIndex};`);
  if (layout.flexWrap) rules.push(`flex-wrap: ${layout.flexWrap};`);
  if (layout.minWidth !== undefined) rules.push(`min-width: ${formatSize(layout.minWidth)};`);
  if (layout.maxHeight !== undefined) rules.push(`max-height: ${formatSize(layout.maxHeight)};`);
  if (layout.marginTop !== undefined) rules.push(`margin-top: ${layout.marginTop}px;`);
  if (layout.marginLeft !== undefined) rules.push(`margin-left: ${layout.marginLeft}px;`);
  if (layout.overflow) rules.push(`overflow: ${layout.overflow};`);
  if (layout.gridColumn) rules.push(`grid-column: ${layout.gridColumn};`);
  if (layout.gridRow) rules.push(`grid-row: ${layout.gridRow};`);

  // Style properties
  if (style.backgroundGradient) {
    rules.push(`background: ${style.backgroundGradient};`);
  } else if (style.background) {
    rules.push(`background: ${style.background};`);
  }
  if (style.color) rules.push(`color: ${style.color};`);
  if (style.borderRadius !== undefined) rules.push(`border-radius: ${style.borderRadius}px;`);
  if (style.borderWidth !== undefined && style.borderWidth > 0) {
    rules.push(`border-width: ${style.borderWidth}px;`);
    rules.push('border-style: solid;');
    rules.push(`border-color: ${style.borderColor || '#e4e4e7'};`);
  }
  if (style.opacity !== undefined) rules.push(`opacity: ${style.opacity / 100};`);
  if (style.fontSize !== undefined) rules.push(`font-size: ${style.fontSize}px;`);
  if (style.fontWeight !== undefined) rules.push(`font-weight: ${style.fontWeight};`);
  if (style.fontFamily) rules.push(`font-family: ${style.fontFamily};`);
  if (style.lineHeight !== undefined) rules.push(`line-height: ${style.lineHeight};`);
  if (style.letterSpacing !== undefined) rules.push(`letter-spacing: ${style.letterSpacing}px;`);
  
  if (style.blur || style.brightness !== undefined || style.saturation !== undefined) {
    const filters: string[] = [];
    if (style.brightness !== undefined && style.brightness !== 100) filters.push(`brightness(${style.brightness / 100})`);
    if (style.saturation !== undefined && style.saturation !== 100) filters.push(`saturate(${style.saturation / 100})`);
    if (style.blur) filters.push(`blur(${style.blur}px)`);
    if (filters.length) rules.push(`filter: ${filters.join(' ')};`);
  }
  if (style.backdropBlur) rules.push(`backdrop-filter: blur(${style.backdropBlur}px);`);
  if (style.blendMode) rules.push(`mix-blend-mode: ${style.blendMode};`);
  if (style.shadow || style.shadowBlur || style.shadowX || style.shadowY) {
    const x = style.shadowX ?? 0;
    const y = style.shadowY ?? 4;
    const blur = style.shadowBlur ?? 12;
    const spread = style.shadowSpread ?? 0;
    const color = style.shadowColor ?? 'rgba(15, 23, 42, 0.14)';
    rules.push(`box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color};`);
  }

  return rules.join(' ');
}

function imageOverlayGradient(color: string, opacity: number, direction: string, gradient: boolean): string {
  const alpha = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
  const rgba = `${color}${alpha}`;
  if (!gradient) return rgba;
  if (direction === 'radial') return `radial-gradient(ellipse at center, ${rgba} 0%, transparent 72%)`;
  if (direction === 'to-top') return `linear-gradient(0deg, transparent 20%, ${rgba})`;
  if (direction === 'to-left') return `linear-gradient(270deg, transparent 20%, ${rgba})`;
  if (direction === 'to-right') return `linear-gradient(90deg, transparent 20%, ${rgba})`;
  return `linear-gradient(180deg, transparent 30%, ${rgba})`;
}
// ── AutoHall Campaign Gamme Thermique — Static Export Renderer ──────────────
// Produces a server-side HTML multi-step lead form compatible with
// lead-form.js (LANDING_CONFIG.leadEndpoint, lp-lead-form class, etc.)

function renderBrandNavbar(props: any): string {
  const logo = props.logoUrl || props.logoSrc || '';
  const phone = props.phone || '08 00 00 44 33';
  const ctaLabel = props.ctaLabel || 'Contact';
  const ctaUrl = props.ctaUrl || '#';
  const bg = props.backgroundColor || '#ffffff';
  const textColor = props.textColor || '#111827';
  const links: Array<{label: string; url?: string}> = Array.isArray(props.links) ? props.links : [];

  const linksHtml = links.map(l =>
    `<a href="${escapeHtml(l.url || '#')}" style="color:${escapeHtml(textColor)};text-decoration:none;font-size:14px;font-weight:500;">${escapeHtml(l.label || '')}</a>`
  ).join('');

  const logoHtml = logo
    ? `<img src="${escapeHtml(logo)}" alt="Auto Hall" style="height:40px;object-fit:contain;" />`
    : `<span style="font-weight:800;font-size:18px;color:${escapeHtml(textColor)};">Auto Hall</span>`;

  return `
<nav class="cgt-navbar" style="display:flex;align-items:center;justify-content:space-between;padding:12px 32px;background:${escapeHtml(bg)};border-bottom:1px solid rgba(0,0,0,0.07);font-family:'Outfit',sans-serif;box-sizing:border-box;width:100%;">
  <div style="display:flex;align-items:center;gap:24px;">${logoHtml}${linksHtml}</div>
  <div style="display:flex;align-items:center;gap:16px;">
    ${phone ? `<a href="tel:${escapeHtml(phone.replace(/\s/g,''))}" style="color:${escapeHtml(textColor)};font-size:14px;text-decoration:none;font-weight:600;">☎ ${escapeHtml(phone)}</a>` : ''}
    <a href="${escapeHtml(ctaUrl)}" style="background:#288fe3;color:#fff;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">${escapeHtml(ctaLabel)}</a>
  </div>
</nav>`.trim();
}

function renderCampaignGammeThermique(props: any): string {
  const p = escapeHtml;
  const banner = props.bannerImage || props.bannerSrc || '';
  const bannerAlt = props.bannerAlt || 'Campagne Auto Hall';
  const primary = props.colorPrimary || props.primary || '#288fe3';
  const inputBorder = props.inputBorderColor || '#d1d5db';
  const formBg = props.formBg || '#ffffff';
  const formRadius = props.formRadius ?? 12;
  const formShadow = props.formShadow !== false;

  const modelsList: string[] = Array.isArray(props.modelsList) ? props.modelsList : ['CHERY TIGGO 4', 'CHERY ARRIZO 6'];
  const villesList: string[] = Array.isArray(props.villesList) ? props.villesList : ['Casablanca', 'Rabat', 'Marrakech'];

  const step1Title = props.step1Title || 'Sélectionnez le véhicule que vous souhaitez essayer';
  const step2Title = props.step2Title || 'Confirmez votre disponibilité';
  const step3Title = props.step3Title || 'Vos coordonnées';
  const btnNext   = props.btnNextLabel || 'Suivant';
  const btnBack   = props.btnBackLabel || 'Retour';
  const btnSubmit = props.btnSubmitLabel || 'Soumettre';

  const formOnLeft = props.formPosition === 'left' || props.formOnLeft === true;
  const grid = formOnLeft ? '420px 1fr' : '1fr 420px';

  const modelsOptions = modelsList.map(m =>
    `<option value="${p(m)}">${p(m)}</option>`
  ).join('');

  const villesOptions = villesList.map(v =>
    `<option value="${p(v)}">${p(v)}</option>`
  ).join('');

  const shadowCss = formShadow
    ? 'box-shadow:0 4px 32px rgba(0,0,0,0.13),0 1.5px 6px rgba(0,0,0,0.07);'
    : '';

  // Resolve fields config with defaults
  const fields: Array<{ id: string; label: string; placeholder?: string; required: boolean; active: boolean }> = Array.isArray(props.fields)
    ? props.fields
    : [
        { id: 'modele', label: 'Modèle souhaité', placeholder: '', required: true, active: true },
        { id: 'ville', label: 'Ville', placeholder: '', required: true, active: true },
        { id: 'date', label: "Date d'essai souhaitée", placeholder: '', required: true, active: true },
        { id: 'nom', label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true, active: true },
        { id: 'tel', label: 'Téléphone', placeholder: '06 ou 07 XXXXXXXX', required: true, active: true },
        { id: 'email', label: 'Email', placeholder: '', required: false, active: false },
      ];
  const fModele = fields.find(f => f.id === 'modele') ?? { label: 'Modèle souhaité', required: true, active: true };
  const fVille  = fields.find(f => f.id === 'ville')  ?? { label: 'Ville', required: true, active: true };
  const fDate   = fields.find(f => f.id === 'date')   ?? { label: "Date d'essai souhaitée", required: true, active: true };
  const fNom    = fields.find(f => f.id === 'nom')    ?? { label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true, active: true };
  const fTel    = fields.find(f => f.id === 'tel')    ?? { label: 'Téléphone', placeholder: '06 ou 07 XXXXXXXX', required: true, active: true };
  const fEmail  = fields.find(f => f.id === 'email')  ?? { label: 'Email', placeholder: '', required: false, active: false };

  const autoHallApiUrl = props.autoHallApiUrl || '/api/public/leads';

  const reqStar = (req: boolean, col: string) => req ? ` <span style="color:${p(col)}">*</span>` : '';

  const step1Html = `
<div data-lp-form-step="1" style="display:flex;flex-direction:column;gap:14px;">
  <h2 style="margin:0 0 4px;font-size:17px;font-weight:700;color:#111;">${p(step1Title)}</h2>
  ${fModele.active ? `<div style="display:flex;flex-direction:column;gap:6px;">
    <label style="font-size:13px;font-weight:600;color:#374151;">${p(fModele.label)}${reqStar(fModele.required, primary)}</label>
    <select name="vehicleModel"${fModele.required ? ' required' : ''} style="display:block;width:100%;padding:12px 16px;font-size:14px;border:1.5px solid ${p(inputBorder)};border-radius:7px;outline:none;background:#fff;box-sizing:border-box;appearance:none;">
      <option value="">-- Sélectionner un modèle --</option>
      ${modelsOptions}
    </select>
  </div>` : ''}
  <button type="button" data-lp-form-advance style="width:100%;padding:13px;background:${p(primary)};color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;">${p(btnNext)}</button>
</div>`;

  const step2Html = `
<div data-lp-form-step="2" hidden style="display:flex;flex-direction:column;gap:14px;">
  <h2 style="margin:0 0 4px;font-size:17px;font-weight:700;color:#111;">${p(step2Title)}</h2>
  ${fVille.active ? `<div style="display:flex;flex-direction:column;gap:6px;">
    <label style="font-size:13px;font-weight:600;color:#374151;">${p(fVille.label)}${reqStar(fVille.required, primary)}</label>
    <select name="city"${fVille.required ? ' required' : ''} style="display:block;width:100%;padding:12px 16px;font-size:14px;border:1.5px solid ${p(inputBorder)};border-radius:7px;outline:none;background:#fff;box-sizing:border-box;appearance:none;">
      <option value="">-- Choisir une ville --</option>
      ${villesOptions}
    </select>
  </div>` : ''}
  ${fDate.active ? `<div style="display:flex;flex-direction:column;gap:6px;">
    <label style="font-size:13px;font-weight:600;color:#374151;">${p(fDate.label)}${reqStar(fDate.required, primary)}</label>
    <input type="date" name="preferredDate"${fDate.required ? ' required' : ''} style="display:block;width:100%;padding:12px 16px;font-size:14px;border:1.5px solid ${p(inputBorder)};border-radius:7px;outline:none;background:#fff;box-sizing:border-box;" />
  </div>` : ''}
  <div style="display:flex;gap:8px;">
    <button type="button" data-lp-form-back style="flex:1;padding:12px;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">${p(btnBack)}</button>
    <button type="button" data-lp-form-advance style="flex:2;padding:12px;background:${p(primary)};color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">${p(btnNext)}</button>
  </div>
</div>`;

  const step3Html = `
<div data-lp-form-step="3" hidden style="display:flex;flex-direction:column;gap:14px;">
  <h2 style="margin:0 0 4px;font-size:17px;font-weight:700;color:#111;">${p(step3Title)}</h2>
  ${fNom.active ? `<div style="display:flex;flex-direction:column;gap:6px;">
    <label style="font-size:13px;font-weight:600;color:#374151;">${p(fNom.label)}${reqStar(fNom.required, primary)}</label>
    <input type="text" name="fullName"${fNom.required ? ' required minlength="2"' : ''} placeholder="${p((fNom as any).placeholder || 'Votre nom et prénom')}" style="display:block;width:100%;padding:12px 16px;font-size:14px;border:1.5px solid ${p(inputBorder)};border-radius:7px;outline:none;box-sizing:border-box;" />
  </div>` : ''}
  ${fTel.active ? `<div style="display:flex;flex-direction:column;gap:6px;">
    <label style="font-size:13px;font-weight:600;color:#374151;">${p(fTel.label)}${reqStar(fTel.required, primary)}</label>
    <input type="tel" name="phone"${fTel.required ? ' required' : ''} pattern="0[5-7][0-9]{8}" placeholder="${p((fTel as any).placeholder || '06 ou 07 XXXXXXXX')}" style="display:block;width:100%;padding:12px 16px;font-size:14px;border:1.5px solid ${p(inputBorder)};border-radius:7px;outline:none;box-sizing:border-box;" />
  </div>` : ''}
  ${fEmail.active ? `<div style="display:flex;flex-direction:column;gap:6px;">
    <label style="font-size:13px;font-weight:600;color:#374151;">${p(fEmail.label)}${reqStar(fEmail.required, primary)}</label>
    <input type="email" name="email"${fEmail.required ? ' required' : ''} placeholder="${p((fEmail as any).placeholder || '')}" style="display:block;width:100%;padding:12px 16px;font-size:14px;border:1.5px solid ${p(inputBorder)};border-radius:7px;outline:none;box-sizing:border-box;" />
  </div>` : ''}
  <p class="lp-submit-error" role="status" aria-live="polite" style="display:none;margin:0;padding:8px 12px;font-size:13px;border-radius:6px;"></p>
  <div style="display:flex;gap:8px;">
    <button type="button" data-lp-form-back style="flex:1;padding:12px;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">${p(btnBack)}</button>
    <button type="submit" class="hfr-btn" style="flex:2;padding:12px;background:${p(primary)};color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">${p(btnSubmit)}</button>
  </div>
</div>`;

  const heroZone = banner
    ? `<div style="position:relative;overflow:hidden;">
        <img src="${p(banner)}" alt="${p(bannerAlt)}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy" />
      </div>`
    : `<div style="background:linear-gradient(135deg,#002c5f,#1a56db);min-height:320px;"></div>`;

  const formZone = `
<div style="display:flex;align-items:stretch;">
  <div style="width:100%;max-width:420px;background:${p(formBg)};border-radius:${formRadius}px;${shadowCss}padding:28px 24px;box-sizing:border-box;display:flex;flex-direction:column;font-family:'Outfit',sans-serif;">
    <!-- Progress bar -->
    <div style="height:3px;background:#e5e7eb;border-radius:9px;margin-bottom:18px;">
      <div id="cgt-progress" style="height:100%;width:25%;background:${p(primary)};border-radius:9px;transition:width 0.3s;"></div>
    </div>
    <form class="lp-lead-form" novalidate data-lp-step-count="3" data-lp-current-step="1" data-brand="Chery" data-request-type="TEST_DRIVE" data-action="${p(autoHallApiUrl)}">
      ${step1Html}
      ${step2Html}
      ${step3Html}
    </form>
    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:14px;">© ${new Date().getFullYear()} AUTO HALL</p>
  </div>
</div>`;

  const leftContent  = formOnLeft ? formZone  : heroZone;
  const rightContent = formOnLeft ? heroZone  : formZone;

  return `
<style>.cgt-section .hfr-field__input--error{border-color:#ef4444!important}.cgt-section .hfr-error{color:#ef4444;font-size:12px;margin-top:4px;display:block}</style>
<section class="cgt-section" style="display:grid;grid-template-columns:${formOnLeft ? '420px 1fr' : '1fr 420px'};width:100%;aspect-ratio:16/8.5;min-height:480px;overflow:hidden;box-sizing:border-box;font-family:'Outfit',sans-serif;">
  ${leftContent}
  ${rightContent}
</section>
<script>
(function(){
  var prog = document.getElementById('cgt-progress');
  if(!prog) return;
  function updateProgress(step){
    prog.style.width = (step===1?'25%':step===2?'50%':step===3?'75%':'100%');
  }
  var form = document.querySelector('.cgt-section .lp-lead-form');
  if(!form) return;
  form.addEventListener('lead-form-step-changed', function(e){
    updateProgress(e.detail && e.detail.step ? e.detail.step : parseInt(form.getAttribute('data-lp-current-step')||'1',10));
  });
})();
</script>`.trim();
}

function renderFordPromo(props: any): string {
  const p = escapeHtml;
  
  // Resolve campaign image
  const FALLBACK_IMG = 'https://fordpromo.myautohall.ma/images/fordvisuelnv.png';
  const rawImg = (props.campaignImage || '').trim();
  const imgIsSafe =
    rawImg.length > 0 &&
    !rawImg.startsWith('blob:') &&
    !/^https?:\/\/localhost(:\d+)?/i.test(rawImg) &&
    !/^https?:\/\/127\.0\.0\.1/i.test(rawImg) &&
    !rawImg.startsWith('src/assets/') &&
    !rawImg.startsWith('assets/src/') &&
    (rawImg.startsWith('assets/') ||
     rawImg.startsWith('images/') ||
     rawImg.startsWith('/api/public/assets/') ||
     (!rawImg.startsWith('/') && !rawImg.startsWith('./')));
  const campaignImage = p(imgIsSafe ? rawImg : FALLBACK_IMG);
  const altText = p(props.altText || 'Ford Campaign');
  const formTitle = p(props.formTitle || 'Contactez-moi');
  const submitLabel = p(props.submitLabel || 'Envoyer');
  const primaryColor = p(props.primaryColor || '#2c82e6');
  const cid = p(props.campaignId || 'ford-promo');
  const formTextColor = p(props.formTextColor || '#1a2840');
  const cgvUrl = p(props.cgvUrl || 'https://fr.ford.ma/');
  const logoUrl = p(props.logoUrl || '');
  
  const villesList = Array.isArray(props.villesList) && props.villesList.length ? props.villesList : [
    'Agadir', 'Al Hoceima', 'Béni Mellal', 'Berkane',
    'Casablanca', 'Dakhla', 'El Jadida', 'Errachidia',
    'Fès', 'Kénitra', 'Khouribga', 'Marrakech', 'Meknès',
    'Nador', 'Oujda', 'Rabat', 'Safi', 'Salé',
    'Settat', 'Tanger', 'Taroudant', 'Tétouan', 'Tiznit',
  ];

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
  const fields = (props.fields && props.fields.length > 0 ? props.fields : [
    { id: 'fullName', label: 'Nom Complet', placeholder: 'Votre Nom Complet', required: true, type: 'text' },
    { id: 'phone', label: 'Téléphone', placeholder: 'Votre N° de Téléphone', required: true, type: 'tel' },
    { id: 'city', label: 'Ville', placeholder: 'Votre Ville', required: true, type: 'select' }
  ]).filter((f: any) => f.active !== false);

  const formFieldsHtml = fields.map((field: any) => {
    if (field.type === 'select' || field.id === 'city' || field.id === 'ville') {
      return `
          <div class="fp-field">
            <select required name="${p(field.id)}" class="fp-select">
              <option value="" disabled selected style="color:#94a3b8;">${p(formatLabelOrPlaceholder(field.label, field.required))}</option>
              ${villesList.map((v: string) => `<option value="${p(v)}">${p(v)}</option>`).join('\n              ')}
            </select>
          </div>`;
    }

    const typeAttr = field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text';
    const maxLenAttr = field.type === 'tel' ? ' maxlength="10" oninput="this.value=this.value.replace(/\\\\D/g,\'\')"' : '';
    const reqAttr = field.required ? ' required' : '';
    const placeholderAttr = p(formatLabelOrPlaceholder(field.placeholder || field.label, field.required));

    return `
          <div class="fp-field">
            <input${reqAttr} type="${typeAttr}" name="${p(field.id)}"${maxLenAttr} class="fp-input" placeholder="${placeholderAttr}" />
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
    .fp-success-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      text-align: center;
      padding: 24px 0;
      flex: 1;
      color: ${formTextColor};
    }
    .fp-success-box p { margin: 0; }
  </style>

  <div class="fp-block">
    <!-- LEFT: Campaign visual -->
    <div class="fp-img-col">
      <img
        src="${campaignImage}"
        alt="${altText}"
        loading="lazy"
        decoding="async"
        style="width:100%;height:100%;object-fit:cover;display:block;min-height:280px;"
        onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
      />
    </div>

    <!-- RIGHT: Form panel -->
    <div class="fp-form-col">
      <div data-success style="display:none;" class="fp-success-box">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4 12 14.01l-3-3" />
        </svg>
        <h3 style="font-weight:800;font-size:20px;margin:16px 0 8px;text-align:center;text-transform:none;letter-spacing:normal;">Demande envoyée avec succès !</h3>
        <p style="font-size:14px;opacity:0.85;line-height:1.6;margin:0;max-width:320px;text-align:center;">Un conseiller commercial Ford prendra contact avec vous dans les plus brefs délais.</p>
      </div>

      <div data-form-container>
        ${logoUrl ? `
        <div class="fp-logo-header">
          <img src="${logoUrl}" alt="Logo" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display='none'" />
        </div>` : ''}
        <h3 class="fp-form-title">${formTitle}</h3>
        <form
          class="lp-form lp-lead-form"
          data-api="__EXPORT_API_URL__"
          data-campaign="${cid}"
          data-lp=""
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
</section>
`;
}
