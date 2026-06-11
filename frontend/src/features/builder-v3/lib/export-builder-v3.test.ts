import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportBuilderV3Zip } from './export-builder-v3';

const saveBuilderDocumentDesign = vi.fn().mockResolvedValue(undefined);
const getState = vi.fn();

vi.mock('./save-builder-v3', () => ({
  saveBuilderDocumentDesign: (...args: unknown[]) => saveBuilderDocumentDesign(...args),
}));

vi.mock('@/features/builder-engine/store/builder-document.store', () => ({
  forcePersistBuilderDocument: vi.fn(),
  useBuilderDocumentStore: {
    getState: () => getState(),
  },
}));

vi.mock('@/lib/auth-storage', () => ({
  getAccessToken: () => 'token',
}));

const validPageTheme = {
  primaryColor: '#000',
  secondaryColor: '#111',
  mode: 'dark' as const,
  fontFamily: 'Inter',
  headingFont: 'Inter',
  bodyFont: 'Roboto',
  headingScale: 'normal' as const,
  sectionSpacing: 'normal' as const,
  buttonStyle: 'pill' as const,
  seoTitle: '',
  seoDescription: '',
};

describe('exportBuilderV3Zip', () => {
  beforeEach(() => {
    saveBuilderDocumentDesign.mockReset();
    saveBuilderDocumentDesign.mockResolvedValue(undefined);
    getState.mockReset();
  });

  it('blocks export when blob URLs are present in block props', async () => {
    getState.mockReturnValue({
      blocks: [
        {
          id: 'b1',
          type: 'media_only',
          label: 'Media',
          sortOrder: 0,
          propsJson: { imageUrl: 'blob:http://localhost/dead' },
        },
      ],
      pageSettings: {
        metaTitle: '',
        metaDescription: '',
        ogImageUrl: '',
        faviconUrl: '',
      },
      pageTheme: validPageTheme,
    });

    await expect(exportBuilderV3Zip('pv-1')).rejects.toThrow(/Médias non enregistrés/);
    expect(saveBuilderDocumentDesign).not.toHaveBeenCalled();
  });

  it('does not send history metadata in export payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['zip']),
      headers: { get: () => 'attachment; filename="test.zip"' },
    });
    vi.stubGlobal('fetch', fetchMock);

    getState.mockReturnValue({
      blocks: [
        {
          id: 'b1',
          type: 'hero_campaign',
          label: 'Hero',
          sortOrder: 0,
          propsJson: { title: 'Hello' },
        },
      ],
      pageSettings: {
        metaTitle: '',
        metaDescription: '',
        ogImageUrl: '',
        faviconUrl: '',
      },
      pageTheme: validPageTheme,
      historyPast: [{ blocks: [] }],
      historyFuture: [{ blocks: [] }],
    });

    await exportBuilderV3Zip('pv-1');

    const body = fetchMock.mock.calls[0]?.[1]?.body as string;
    expect(body).not.toContain('historyPast');
    expect(body).not.toContain('historyFuture');
    vi.unstubAllGlobals();
  });
});
