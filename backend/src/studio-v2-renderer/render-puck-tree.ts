import {
  renderBenefits,
  renderCtaSection,
  renderFaq,
  renderFooterLegal,
  renderSlotChildren,
  renderVehicleOffer,
  renderVehicleRange,
} from './components/content.render';
import { renderHeroAutoHall } from './components/hero.render';
import { renderLeadFormAutoHall } from './components/lead-form.render';
import {
  renderColumns,
  renderContainer,
  renderSection,
} from './components/layout.render';
import type {
  AllowedStudioV2Component,
  PuckDocument,
  PuckNode,
  StudioV2RenderContext,
} from './types';
import { ALLOWED_STUDIO_V2_COMPONENTS } from './types';

export class UnknownStudioV2ComponentError extends Error {
  constructor(type: string) {
    super(`Unknown Studio V2 component: ${type}`);
    this.name = 'UnknownStudioV2ComponentError';
  }
}

function isAllowed(type: string): type is AllowedStudioV2Component {
  return (ALLOWED_STUDIO_V2_COMPONENTS as readonly string[]).includes(type);
}

export function createRenderContext(
  base: Omit<StudioV2RenderContext, 'renderNode'>,
): StudioV2RenderContext & { renderNode: (node: PuckNode) => string } {
  const ctx = { ...base, renderNode: (node: PuckNode) => '' };

  ctx.renderNode = (node: PuckNode): string => {
    if (!isAllowed(node.type)) {
      throw new UnknownStudioV2ComponentError(node.type);
    }

    const props = node.props ?? {};

    switch (node.type) {
      case 'Section':
        return renderSection(props, (p) => renderSlotChildren(p, 'items', ctx.renderNode));
      case 'Container':
        return renderContainer(props, (p) => renderSlotChildren(p, 'items', ctx.renderNode));
      case 'Columns':
        return renderColumns(props, (p) => '', ctx);
      case 'HeroAutoHall':
        return renderHeroAutoHall(props, ctx);
      case 'LeadFormAutoHall':
        return renderLeadFormAutoHall(props, ctx);
      case 'VehicleOffer':
        return renderVehicleOffer(props, ctx);
      case 'VehicleRange':
        return renderVehicleRange(props, ctx);
      case 'Benefits':
        return renderBenefits(props);
      case 'FAQ':
        return renderFaq(props);
      case 'CTASection':
        return renderCtaSection(props);
      case 'FooterLegal':
        return renderFooterLegal(props);
      default:
        throw new UnknownStudioV2ComponentError(node.type);
    }
  };

  return ctx;
}

export function renderPuckDocumentHtml(
  document: PuckDocument,
  ctx: StudioV2RenderContext & { renderNode: (node: PuckNode) => string },
): string {
  const content = document.content ?? [];
  return content.map((node) => ctx.renderNode(node)).join('\n');
}
