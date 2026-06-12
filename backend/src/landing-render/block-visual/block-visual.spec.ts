import { renderBlockHtml } from '../block-renderer';
import { renderCtaBandHtml } from '../v3-content-blocks.render';

describe('block-visual export parity (content blocks)', () => {
  it('faq export reflects faqStyle and density controls', () => {
    const html = renderBlockHtml({
      blockType: 'faq',
      sortOrder: 1,
      propsJson: {
        heading: 'Questions fréquentes',
        items: [{ question: 'Q?', answer: 'A.' }],
        blockVisual: { faqStyle: 'boxed', faqDensity: 'compact', iconStyle: 'plus' },
      },
    });

    expect(html).toContain('lp-faq--bv-style-boxed');
    expect(html).toContain('lp-faq--bv-density-compact');
    expect(html).toContain('lp-faq--bv-icon-plus');
  });

  it('cta_band export reflects layout and intensity controls', () => {
    const html = renderCtaBandHtml({
      title: 'Prêt à essayer ?',
      buttonText: 'Réserver',
      blockVisual: { ctaLayout: 'split', ctaIntensity: 'dark', ctaAlignment: 'left' },
    });

    expect(html).toContain('lp-cta-band--bv-layout-split');
    expect(html).toContain('lp-cta-band--bv-intensity-dark');
    expect(html).toContain('lp-cta-band--bv-alignment-left');
  });

  it('trust_bar export reflects layout and style controls', () => {
    const html = renderBlockHtml({
      blockType: 'trust_bar',
      sortOrder: 2,
      propsJson: {
        metrics: [{ value: '24h', label: 'Réponse' }],
        blockVisual: { trustLayout: 'grid', trustDensity: 'compact', trustStyle: 'cards' },
      },
    });

    expect(html).toContain('lp-trust-bar--bv-layout-grid');
    expect(html).toContain('lp-trust-bar--bv-density-compact');
    expect(html).toContain('lp-trust-bar--bv-style-cards');
  });

  it('static export contains no Studio-only metadata in blockVisual', () => {
    const html = renderBlockHtml({
      blockType: 'campaign_lead_hero',
      sortOrder: 1,
      propsJson: {
        brandId: 'chery',
        campaignTitle: 'Test',
        formTitle: 'Form',
        layoutVariant: 'media_left_form_right',
        blockVisual: { heroHeight: 'default' },
        _studioAppliedVariantId: 'campaign-hero-split-premium-form',
      },
    });

    expect(html).not.toContain('_studio');
    expect(html).not.toContain('campaign-hero-split');
  });
});
