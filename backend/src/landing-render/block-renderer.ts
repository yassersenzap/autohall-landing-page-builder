import { Prisma } from '@prisma/client';
import { renderCoreCampaignFormLandingHtml } from './core-campaign-form-landing.render';
import { isBlockHiddenForExport } from './block-visibility';
import type { LandingRenderContext } from './render-asset.types';

type BlockRenderFn = (
  props: Record<string, unknown>,
  context?: LandingRenderContext,
) => string;

const BLOCK_RENDER_MAP = new Map<string, BlockRenderFn>([
  ['core_campaign_form_landing', renderCoreCampaignFormLandingHtml],
]);

export type RenderBlockInput = {
  blockType: string;
  sortOrder: number;
  propsJson: Prisma.JsonValue;
};

export type RenderPageShell = {
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

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderBlockHtml(
  block: RenderBlockInput,
  context?: LandingRenderContext,
): string {
  const props = propsAsRecord(block.propsJson);

  if (isBlockHiddenForExport(props)) {
    return '';
  }

  const type = block.blockType.toLowerCase();
  const renderFn = BLOCK_RENDER_MAP.get(type);

  if (renderFn) {
    return renderFn(props, context);
  }

  return `
    <section class="lp-block lp-unknown">
      <div class="lp-section">
        <p>Type de bloc non supporté : ${escapeHtml(block.blockType)}</p>
      </div>
    </section>`;
}

export function renderPageShellHeader(shell: RenderPageShell): string {
  return `
  <header class="lp-site-header">
    <div class="lp-site-header__inner lp-section">
      <div class="lp-site-header__brand-group">
        <p class="lp-site-header__brand">${escapeHtml(shell.brand)}</p>
        <p class="lp-site-header__campaign">${escapeHtml(shell.campaignName)}</p>
      </div>
      <a class="lp-btn lp-btn--primary lp-btn--md lp-site-header__cta" href="#lead-form">Demander un essai</a>
    </div>
  </header>`;
}

export function renderPageShellFooter(): string {
  const year = new Date().getFullYear();
  return `
  <footer class="lp-site-footer">
    <div class="lp-site-footer__inner lp-section">
      <p>&copy; ${year} Auto Hall. Tous droits réservés.</p>
    </div>
  </footer>`;
}

export function renderBlocksHtml(
  blocks: RenderBlockInput[],
  context?: LandingRenderContext,
): string {
  return blocks.map((block) => renderBlockHtml(block, context)).join('\n');
}
