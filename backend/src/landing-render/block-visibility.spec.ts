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

  it('skips globally hidden basic content blocks in HTML output', () => {
    const richText = renderBlockHtml({
      blockType: 'rich_text',
      sortOrder: 0,
      propsJson: {
        hidden: true,
        titre: 'Masqué',
        contenu: 'Contenu invisible',
      },
    });
    expect(richText).toBe('');

    const spacer = renderBlockHtml({
      blockType: 'spacer_divider',
      sortOrder: 1,
      propsJson: {
        hidden: true,
        type: 'space',
        hauteur: 'M',
      },
    });
    expect(spacer).toBe('');

    const media = renderBlockHtml({
      blockType: 'media_only',
      sortOrder: 2,
      propsJson: {
        hidden: true,
        imageUrl: 'https://example.com/photo.jpg',
      },
    });
    expect(media).toBe('');

    const video = renderBlockHtml({
      blockType: 'video_embed',
      sortOrder: 3,
      propsJson: {
        hidden: true,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    });
    expect(video).toBe('');
  });

  it('skips globally hidden hero_campaign in HTML output', () => {
    const html = renderBlockHtml({
      blockType: 'hero_campaign',
      sortOrder: 0,
      propsJson: {
        hidden: true,
        title: 'Hidden hero',
        buttonText: 'Go',
      },
    });
    expect(html).toBe('');
  });

  it('still renders blocks without hidden flag', () => {
    const html = renderBlockHtml({
      blockType: 'faq',
      sortOrder: 0,
      propsJson: {
        heading: 'FAQ',
        items: [{ question: 'Q?', answer: 'A.' }],
      },
    });
    expect(html).toContain('lp-faq');
  });

  it('still renders visible basic content blocks', () => {
    const html = renderBlockHtml({
      blockType: 'rich_text',
      sortOrder: 0,
      propsJson: {
        titre: 'Visible',
        contenu: 'Texte publié',
      },
    });
    expect(html).toContain('lp-rich-text');
  });
});
