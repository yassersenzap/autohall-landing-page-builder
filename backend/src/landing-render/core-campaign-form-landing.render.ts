import type { LandingRenderContext } from './render-asset.types';
import { resolveHeroImageSrc } from './render-asset.resolve';
import { sanitizeExportHref } from './safe-export-link';
import {
  buildLeadFormFieldSpecs,
} from './lead-form-fields.builder';
import {
  renderLeadFormConsentHtml,
  renderLeadFormFieldsHtml,
} from './lead-form-fields.render';
import {
  appendSectionStyleToClass,
  appendSectionStyleToInlineStyle,
} from './section-style/section-style.classes';
import { AUTOHALL_FEATURED_MODELS } from './constants/autohall-featured-models';
import {
  buildCoreCampaignFormLandingHtml,
  type CoreCampaignHtmlDeps,
} from './core-campaign-form-landing-html';

function createCoreCampaignHtmlDeps(
  context?: LandingRenderContext,
): CoreCampaignHtmlDeps {
  return {
    resolveImageSrc: (props) => resolveHeroImageSrc(props, context),
    sanitizeHref: sanitizeExportHref,
    buildLeadFormFieldSpecs,
    renderLeadFormFieldsHtml,
    renderLeadFormConsentHtml,
    appendSectionStyleToClass,
    appendSectionStyleToInlineStyle,
    featuredModels: AUTOHALL_FEATURED_MODELS,
  };
}

export function renderCoreCampaignFormLandingHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  return buildCoreCampaignFormLandingHtml(props, createCoreCampaignHtmlDeps(context));
}
