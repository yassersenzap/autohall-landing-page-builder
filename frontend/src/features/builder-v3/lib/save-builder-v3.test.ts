import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveBuilderDocumentDesign } from './save-builder-v3';

const fetchEditorBlocks = vi.fn();
const persistBuilderDocument = vi.fn();
const updatePageVersionById = vi.fn();
const writeLocalDraft = vi.fn();
const forcePersistBuilderDocument = vi.fn();
const applyServerSnapshot = vi.fn();

const mockState = {
  blocks: [{ id: 'b1', type: 'hero_campaign', label: 'Hero', sortOrder: 0, propsJson: {} }],
  pageTheme: {
    primaryColor: '#b91c1c',
    secondaryColor: '#18181b',
    mode: 'dark' as const,
    fontFamily: 'Inter',
    headingFont: 'Inter',
    bodyFont: 'Roboto',
    headingScale: 'normal' as const,
    sectionSpacing: 'normal' as const,
    buttonStyle: 'pill' as const,
    seoTitle: '',
    seoDescription: '',
  },
  pageSettings: {
    metaTitle: 'Titre SEO',
    metaDescription: 'Description SEO',
    ogImageUrl: '',
    ogImageAssetId: 'asset-og-1',
    faviconUrl: '',
    faviconAssetId: '',
  },
  selectedBlockId: null,
  buildThemeJsonPayload: () => ({
    page: {
      theme: { primaryColor: '#b91c1c' },
      seo: { title: 'Titre SEO', ogImageAssetId: 'asset-og-1' },
    },
  }),
};

vi.mock('@/features/editor/api/editorApi', () => ({
  fetchEditorBlocks: (...args: unknown[]) => fetchEditorBlocks(...args),
}));

vi.mock('@/features/builder-engine/lib/persist-builder-document', () => ({
  persistBuilderDocument: (...args: unknown[]) => persistBuilderDocument(...args),
}));

vi.mock('@/lib/page-versions', () => ({
  updatePageVersionById: (...args: unknown[]) => updatePageVersionById(...args),
}));

vi.mock('@/features/builder-engine/lib/builder-local-draft', () => ({
  writeLocalDraft: (...args: unknown[]) => writeLocalDraft(...args),
}));

vi.mock('@/features/builder-engine/store/builder-document.store', () => ({
  forcePersistBuilderDocument: (...args: unknown[]) => forcePersistBuilderDocument(...args),
  useBuilderDocumentStore: {
    getState: () => ({
      ...mockState,
      applyServerSnapshot,
    }),
  },
}));

describe('saveBuilderDocumentDesign', () => {
  beforeEach(() => {
    fetchEditorBlocks.mockReset();
    persistBuilderDocument.mockReset();
    updatePageVersionById.mockReset();
    writeLocalDraft.mockReset();
    forcePersistBuilderDocument.mockReset();
    applyServerSnapshot.mockReset();

    fetchEditorBlocks.mockResolvedValue({ data: [] });
    persistBuilderDocument.mockResolvedValue(mockState.blocks);
    updatePageVersionById.mockResolvedValue({ data: {} });
  });

  it('persists blocks and theme via pageVersionId without landingPageId context', async () => {
    await saveBuilderDocumentDesign('page-version-1');

    expect(fetchEditorBlocks).toHaveBeenCalledWith('page-version-1');
    expect(persistBuilderDocument).toHaveBeenCalledWith(
      'page-version-1',
      mockState.blocks,
      [],
    );
    expect(updatePageVersionById).toHaveBeenCalledWith('page-version-1', {
      themeJson: mockState.buildThemeJsonPayload(),
    });
    expect(applyServerSnapshot).toHaveBeenCalled();
    expect(writeLocalDraft).toHaveBeenCalled();
    expect(forcePersistBuilderDocument).toHaveBeenCalled();
  });

  it('still attempts theme save when blocks sync succeeds (independent of preview)', async () => {
    updatePageVersionById.mockRejectedValueOnce(new Error('theme patch failed'));

    await expect(saveBuilderDocumentDesign('page-version-1')).rejects.toThrow(
      'theme patch failed',
    );

    expect(updatePageVersionById).toHaveBeenCalledWith(
      'page-version-1',
      expect.objectContaining({ themeJson: expect.any(Object) }),
    );
  });

  it('rejects blob URLs in page settings before API calls', async () => {
    mockState.pageSettings.ogImageUrl = 'blob:http://localhost/dead';
    mockState.pageSettings.ogImageAssetId = '';

    await expect(saveBuilderDocumentDesign('page-version-1')).rejects.toThrow(
      /Médias non enregistrés/,
    );

    expect(updatePageVersionById).not.toHaveBeenCalled();
    mockState.pageSettings.ogImageUrl = '';
    mockState.pageSettings.ogImageAssetId = 'asset-og-1';
  });
});
