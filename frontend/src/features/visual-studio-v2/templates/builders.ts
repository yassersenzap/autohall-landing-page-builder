import type { Data } from '@puckeditor/core';
import { DEFAULT_AUTOHALL_CONSENT_LABEL } from '@/features/builder-engine/constants/autohall-lead-form';
import { IMAGE_STYLE_DEFAULTS } from '../fields/field-definitions';
import { ensurePuckIds } from '../lib/ensure-puck-ids';

export const DEFAULT_CONSENT = DEFAULT_AUTOHALL_CONSENT_LABEL;

export function buildDoc(data: Record<string, unknown>): Data {
  return ensurePuckIds(data as Data);
}

export function section(
  tone: string,
  spacing: string,
  items: unknown[],
  anchorId?: string,
  fullHeight = false,
) {
  return {
    type: 'Section',
    props: {
      backgroundTone: tone,
      spacingPreset: spacing,
      anchorId: anchorId ?? '',
      fullHeight,
      items,
    },
  };
}

export function container(maxWidth: string, alignment: string, items: unknown[]) {
  return {
    type: 'Container',
    props: { maxWidth, alignment, items },
  };
}

export function leadForm(overrides: Record<string, unknown> = {}) {
  return {
    type: 'LeadFormAutoHall',
    props: {
      title: 'Demandez votre offre',
      subtitle: 'Un conseiller Auto Hall vous recontacte sous 24 h ouvrées.',
      submitText: 'Envoyer ma demande',
      showCity: true,
      showVehicleModel: true,
      showMessage: false,
      consentText: DEFAULT_CONSENT,
      alignment: 'left',
      spacingPreset: 'normal',
      formPurpose: 'lead',
      ...overrides,
    },
  };
}

export function appointmentForm(overrides: Record<string, unknown> = {}) {
  return leadForm({
    title: 'Prenez rendez-vous',
    subtitle: 'Indiquez votre véhicule et votre ville — nous vous rappelons rapidement.',
    submitText: 'Demander un rendez-vous',
    showVehicleModel: true,
    showMessage: true,
    formPurpose: 'appointment',
    ...overrides,
  });
}

export function footer() {
  return {
    type: 'FooterLegal',
    props: {
      brandName: 'Auto Hall',
      legalText:
        'Offres soumises à conditions. Visuels non contractuels. Auto Hall se réserve le droit de modifier les offres.',
      links: [
        { label: 'Mentions légales', href: '#' },
        { label: 'Politique de confidentialité', href: '#' },
        { label: 'Contact', href: '#lead-form' },
      ],
    },
  };
}

export function hero(props: Record<string, unknown>) {
  return {
    type: 'HeroAutoHall',
    props: {
      layout: 'split_right',
      tone: 'brand',
      alignment: 'left',
      ctaPrimaryHref: '#lead-form',
      ...IMAGE_STYLE_DEFAULTS,
      ...props,
    },
  };
}
