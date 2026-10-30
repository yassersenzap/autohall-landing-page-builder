import { describe, expect, it } from '@jest/globals';
import { renderBlockHtml } from './block-renderer';

describe('block-visibility export', () => {
  it('skips globally hidden core campaign landing in HTML output', () => {
    const html = renderBlockHtml({
      blockType: 'core_campaign_form_landing',
      sortOrder: 0,
      propsJson: {
        hidden: true,
        title: 'Hidden campaign',
        formTitle: 'Form',
      },
    });
    expect(html).toBe('');
  });

  it('still renders visible core campaign landing', () => {
    const html = renderBlockHtml({
      blockType: 'core_campaign_form_landing',
      sortOrder: 0,
      propsJson: {
        title: 'Visible campaign',
        formTitle: 'Form',
      },
    });
    expect(html).toContain('lp-core-campaign-landing');
  });

  it('returns unsupported message for legacy block types', () => {
    const html = renderBlockHtml({
      blockType: 'faq',
      sortOrder: 0,
      propsJson: {
        heading: 'FAQ',
        items: [{ question: 'Q?', answer: 'A.' }],
      },
    });
    expect(html).toContain('Type de bloc non supporté');
  });
});
