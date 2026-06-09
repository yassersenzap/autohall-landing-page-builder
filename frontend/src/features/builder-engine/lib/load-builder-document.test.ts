import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { loadBuilderDocumentFromApi } from './load-builder-document';

const fetchEditorBlocks = vi.fn();
const fetchPageVersionById = vi.fn();
const readLocalDraft = vi.fn();

vi.mock('@/features/editor/api/editorApi', () => ({
  fetchEditorBlocks: (...args: unknown[]) => fetchEditorBlocks(...args),
}));

vi.mock('@/lib/page-versions', () => ({
  fetchPageVersionById: (...args: unknown[]) => fetchPageVersionById(...args),
}));

vi.mock('./builder-local-draft', () => ({
  readLocalDraft: (...args: unknown[]) => readLocalDraft(...args),
}));

describe('loadBuilderDocumentFromApi', () => {
  beforeEach(() => {
    fetchEditorBlocks.mockReset();
    fetchPageVersionById.mockReset();
    readLocalDraft.mockReset();
  });

  it('prefers server blocks and loads theme from page-version API', async () => {
    fetchEditorBlocks.mockResolvedValue({
      data: [
        {
          id: 'server-1',
          pageVersionId: 'pv-1',
          blockKey: 'hero',
          blockType: 'hero_campaign',
          sortOrder: 1,
          propsJson: { title: 'Server' },
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    fetchPageVersionById.mockResolvedValue({
      data: {
        id: 'pv-1',
        landingPageId: 'lp-1',
        versionNumber: 1,
        label: null,
        status: 'DRAFT',
        createdAt: '',
        updatedAt: '',
        themeJson: {
          page: {
            theme: { primaryColor: '#111111' },
            seo: { title: 'SEO titre', ogImageAssetId: 'asset-1' },
          },
        },
      },
    });
    readLocalDraft.mockReturnValue(null);

    const loaded = await loadBuilderDocumentFromApi('pv-1');

    expect(loaded.source).toBe('server');
    expect(loaded.blocks[0]?.id).toBe('server-1');
    expect(loaded.landingPageId).toBe('lp-1');
    expect(loaded.pageTheme.primaryColor).toBe('#111111');
    expect(loaded.pageSettings.ogImageAssetId).toBe('asset-1');
    expect(fetchPageVersionById).toHaveBeenCalledWith('pv-1');
  });

  it('loads theme from page-version API even when server has no blocks', async () => {
    fetchEditorBlocks.mockResolvedValue({ data: [] });
    fetchPageVersionById.mockResolvedValue({
      data: {
        id: 'pv-1',
        landingPageId: 'lp-1',
        versionNumber: 1,
        label: null,
        status: 'DRAFT',
        createdAt: '',
        updatedAt: '',
        themeJson: {
          page: { theme: { primaryColor: '#222222' }, seo: { title: 'Meta' } },
        },
      },
    });
    readLocalDraft.mockReturnValue(null);

    const loaded = await loadBuilderDocumentFromApi('pv-1');

    expect(loaded.source).toBe('localStorage');
    expect(loaded.pageTheme.primaryColor).toBe('#222222');
    expect(loaded.pageSettings.metaTitle).toBe('Meta');
  });

  it('falls back to local draft when server has no blocks', async () => {
    fetchEditorBlocks.mockResolvedValue({ data: [] });
    fetchPageVersionById.mockResolvedValue({
      data: {
        id: 'pv-1',
        landingPageId: 'lp-1',
        versionNumber: 1,
        label: null,
        status: 'DRAFT',
        createdAt: '',
        updatedAt: '',
        themeJson: null,
      },
    });
    readLocalDraft.mockReturnValue({
      version: 1,
      pageVersionId: 'pv-1',
      updatedAt: Date.now(),
      blocks: [
        {
          id: 'draft-1',
          type: 'lead_form',
          label: 'Form',
          sortOrder: 0,
          propsJson: {},
        } satisfies BuilderDocumentBlock,
      ],
      pageTheme: {
        primaryColor: '#b91c1c',
        secondaryColor: '#18181b',
        mode: 'dark',
        fontFamily: 'Inter',
        headingFont: 'Inter',
        bodyFont: 'Roboto',
        headingScale: 'normal',
        sectionSpacing: 'normal',
        buttonStyle: 'pill',
        seoTitle: '',
        seoDescription: '',
      },
      themeDirty: true,
      selectedBlockId: null,
    });

    const loaded = await loadBuilderDocumentFromApi('pv-1');

    expect(loaded.source).toBe('localDraft');
    expect(loaded.blocks[0]?.id).toBe('draft-1');
  });
});
