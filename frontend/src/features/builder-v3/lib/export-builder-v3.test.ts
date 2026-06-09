import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportBuilderV3Zip } from './export-builder-v3';

const saveBuilderDocumentDesign = vi.fn();
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

describe('exportBuilderV3Zip', () => {
  beforeEach(() => {
    saveBuilderDocumentDesign.mockReset();
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
      pageTheme: {},
    });

    await expect(exportBuilderV3Zip('pv-1')).rejects.toThrow(/Médias non enregistrés/);
    expect(saveBuilderDocumentDesign).not.toHaveBeenCalled();
  });
});
