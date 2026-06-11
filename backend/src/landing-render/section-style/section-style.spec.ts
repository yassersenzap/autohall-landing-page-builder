import { describe, expect, it } from '@jest/globals';
import { renderBlockHtml } from '../block-renderer';
import { renderCtaBandHtml } from '../v3-content-blocks.render';
import { renderCampaignLeadHeroHtml } from '../campaign-lead-hero.render';
import { buildSectionStyleClasses } from './section-style.classes';
import { parseSectionStyle } from './section-style.registry';

describe('section-style export parity', () => {
  it('builds whitelisted section style classes', () => {
    const classes = buildSectionStyleClasses(
      parseSectionStyle({
        sectionStyle: {
          sectionPaddingY: 'lg',
          containerWidth: 'narrow',
          sectionBackground: 'muted',
        },
      }),
    );
    expect(classes).toContain('lp-section-style--pad-y-lg');
    expect(classes).toContain('lp-section-style--container-narrow');
    expect(classes).not.toContain('data-studio-only');
    expect(classes).not.toContain('v3-block-toolbar');
  });

  it('faq export includes section style classes', () => {
    const html = renderBlockHtml({
      blockType: 'faq',
      sortOrder: 1,
      propsJson: {
        heading: 'FAQ',
        items: [{ question: 'Q?', answer: 'Réponse.' }],
        sectionStyle: {
          sectionPaddingY: 'xl',
          containerWidth: 'narrow',
          sectionBackground: 'brand',
        },
      },
    });

    expect(html).toContain('lp-section-style--pad-y-xl');
    expect(html).toContain('lp-section-style--bg-brand');
    expect(html).not.toContain('data-studio-only');
    expect(html).not.toContain('v3-block-toolbar');
  });

  it('cta band export includes container width classes', () => {
    const html = renderCtaBandHtml({
      title: 'Réservez',
      buttonText: 'Essai',
      sectionStyle: { containerWidth: 'wide', sectionBackground: 'dark' },
    });

    expect(html).toContain('lp-section-style--container-wide');
    expect(html).toContain('lp-section-style--bg-dark');
  });

  it('campaign lead hero export includes section padding classes', () => {
    const html = renderCampaignLeadHeroHtml({
      brandId: 'ford',
      campaignTitle: 'Ford',
      formTitle: 'Contact',
      formCtaLabel: 'Continuer',
      sectionStyle: { sectionPaddingY: 'sm', verticalDensity: 'compact' },
    });

    expect(html).toContain('lp-section-style--pad-y-sm');
    expect(html).toContain('lp-section-style--density-compact');
    expect(html).not.toMatch(/\{%|\{\{/);
  });
});
