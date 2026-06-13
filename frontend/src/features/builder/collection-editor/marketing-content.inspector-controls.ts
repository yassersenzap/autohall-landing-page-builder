import type { InspectorControl } from '../block-registry/inspector-control.types';

function sectionHeadingControls(
  blockType: string,
  options?: { subtitle?: boolean },
): InspectorControl[] {
  const controls: InspectorControl[] = [
    {
      key: `${blockType}-heading`,
      propKey: 'heading',
      type: 'text',
      label: 'Titre section',
      tab: 'content',
      group: 'Section',
      placeholder: 'Titre affiché au-dessus du contenu',
    },
  ];
  if (options?.subtitle !== false) {
    controls.push({
      key: `${blockType}-subtitle`,
      propKey: 'subtitle',
      type: 'textarea',
      label: 'Sous-titre',
      tab: 'content',
      group: 'Section',
      placeholder: 'Complément optionnel',
    });
  }
  return controls;
}

export const MARKETING_CONTENT_INSPECTOR_CONTROLS: Record<string, InspectorControl[]> = {
  faq: sectionHeadingControls('faq'),
  benefits: sectionHeadingControls('benefits'),
  vehicle_features: sectionHeadingControls('vehicle_features'),
  gallery: sectionHeadingControls('gallery'),
  pricing_trim: sectionHeadingControls('pricing_trim'),
  testimonials: sectionHeadingControls('testimonials', { subtitle: false }),
  offer_highlights: sectionHeadingControls('offer_highlights'),
  financing: [
    ...sectionHeadingControls('financing'),
    {
      key: 'financing-bullets',
      propKey: 'bullets',
      type: 'string-list',
      label: 'Points clés',
      tab: 'content',
      group: 'Contenu',
      placeholder: 'Un point par ligne',
    },
    {
      key: 'financing-cta-label',
      propKey: 'ctaLabel',
      type: 'text',
      label: 'Libellé CTA',
      tab: 'content',
      group: 'Action',
    },
    {
      key: 'financing-cta-target',
      propKey: 'ctaTarget',
      type: 'text',
      label: 'Lien CTA',
      tab: 'content',
      group: 'Action',
      placeholder: '#lead-form',
    },
  ],
};

export function getMarketingContentInspectorControls(blockType: string): InspectorControl[] {
  return MARKETING_CONTENT_INSPECTOR_CONTROLS[blockType] ?? [];
}
