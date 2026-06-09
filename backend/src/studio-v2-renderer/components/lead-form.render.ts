import {
  renderLeadFormConsentHtml,
  renderLeadFormFieldsHtml,
  renderLeadFormRequiredNoteHtml,
} from '../../landing-render/lead-form-fields.render';
import { escapeHtml } from '../escape-html';
import type { StudioV2RenderContext } from '../types';

function mapV2PropsToLeadFormProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const splitFullName = props.splitFullName !== false;
  return {
    title: props.title,
    subtitle: props.subtitle,
    submitText: props.submitText,
    consentLabel:
      typeof props.consentText === 'string' && props.consentText.trim()
        ? props.consentText.trim()
        : undefined,
    requiredFieldsNote:
      typeof props.privacyNote === 'string' && props.privacyNote.trim()
        ? props.privacyNote.trim()
        : '* Champs obligatoires.',
    formConfig: {
      showCivility: props.showCivility !== false,
      useSplitName: splitFullName,
      showEmail: props.showEmail !== false,
      showCity: props.showCity !== false,
      showVehicleModel: props.showVehicleModel !== false,
      showMessage: props.showMessage === true,
      showConsent: true,
    },
  };
}

export function renderLeadFormAutoHall(
  props: Record<string, unknown>,
  _ctx: StudioV2RenderContext,
): string {
  const mapped = mapV2PropsToLeadFormProps(props);
  const layout = typeof props.layout === 'string' ? props.layout : 'card';
  const title =
    typeof mapped.title === 'string' && mapped.title.trim()
      ? `<h2 class="vs2-form__title">${escapeHtml(mapped.title.trim())}</h2>`
      : '';
  const subtitle =
    typeof mapped.subtitle === 'string' && mapped.subtitle.trim()
      ? `<p class="vs2-form__subtitle">${escapeHtml(mapped.subtitle.trim())}</p>`
      : '';
  const submitText =
    typeof mapped.submitText === 'string' && mapped.submitText.trim()
      ? mapped.submitText.trim()
      : 'Envoyer votre demande';

  return `<div id="lead-form" class="vs2-form vs2-form--${escapeHtml(layout)}"><div class="vs2-form__card"><form class="lp-lead-form" novalidate>${title}${subtitle}<div class="vs2-form__fields lp-lead-form__grid">${renderLeadFormFieldsHtml(mapped)}</div>${renderLeadFormConsentHtml(mapped)}${renderLeadFormRequiredNoteHtml(mapped)}<button type="submit" class="lp-btn lp-btn--primary vs2-form__submit">${escapeHtml(submitText)}</button><p class="lp-lead-form__feedback" role="status" aria-live="polite"></p></form></div></div>`;
}
