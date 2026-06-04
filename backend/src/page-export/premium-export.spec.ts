import { describe, expect, it } from '@jest/globals';
import { buildIndexHtml } from '../page-export/static-export.builder';
import { getLandingPageStylesheet } from '../landing-render/landing-styles';
import { renderBlockHtml } from '../landing-render/block-renderer';

describe('premium landing export', () => {
  it('stylesheet contains premium kit rules', () => {
    const css = getLandingPageStylesheet();
    expect(css).toContain('Premium Landing Kit');
    expect(css).toContain('.lp-hero--bg-light .lp-btn--primary');
    expect(css).toContain('.lp-trust-bar__item::before');
    expect(css).toContain('data-section-spacing');
  });

  it('hero light renders premium classes', () => {
    const html = renderBlockHtml({
      blockType: 'hero',
      sortOrder: 0,
      propsJson: {
        title: 'Offre Auto Hall',
        subtitle: 'Essai en concession',
        buttonText: 'Réserver',
        design: {
          layoutVariant: 'split_image_right',
          backgroundMode: 'light',
          mediaPosition: 'right',
        },
      },
    });
    expect(html).toContain('lp-hero--bg-light');
    expect(html).toContain('lp-hero--layout-split_image_right');
    expect(html).toContain('Visuel véhicule');
  });

  it('lead form renders premium card layout', () => {
    const html = renderBlockHtml({
      blockType: 'lead_form',
      sortOrder: 1,
      propsJson: {
        title: 'Contact',
        submitText: 'Envoyer',
        design: { layoutVariant: 'card_right' },
        fields: [{ name: 'fullName', label: 'Nom', type: 'text', required: true }],
      },
    });
    expect(html).toContain('lp-lead-form__card');
    expect(html).toContain('lp-lead-form__submit');
  });

  it('index.html references lead-form.js and relative assets', () => {
    const html = buildIndexHtml(
      { title: 'LP', campaignName: 'Camp', brand: 'Auto Hall' },
      [
        {
          blockType: 'hero',
          sortOrder: 0,
          propsJson: { title: 'Test', buttonText: 'CTA' },
        },
        {
          blockType: 'lead_form',
          sortOrder: 1,
          propsJson: { title: 'Form', submitText: 'Go', fields: [] },
        },
      ],
      null,
    );
    expect(html).toContain('js/lead-form.js');
    expect(html).toContain('js/landing-config.js');
    expect(html).toContain('assets/style.css');
    expect(html).toContain('data-section-spacing');
  });
});
