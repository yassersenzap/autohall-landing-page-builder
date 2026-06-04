import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/page-assets-api', () => ({
  listPageVersionAssets: vi.fn().mockResolvedValue([]),
  uploadPageVersionAsset: vi.fn(),
  assetPublicFileUrl: (id: string) => `http://localhost:3000/api/public/assets/${id}/file`,
}));

vi.mock('grapesjs', () => ({
  default: {
    init: vi.fn(() => ({
      on: vi.fn(),
      destroy: vi.fn(),
      getProjectData: () => ({}),
      getHtml: () => '<main></main>',
      getCss: () => '',
      loadProjectData: vi.fn(),
      setDevice: vi.fn(),
      BlockManager: { add: vi.fn() },
      AssetManager: { add: vi.fn() },
      DeviceManager: { add: vi.fn() },
      StyleManager: { getSectors: () => ({ reset: vi.fn() }) },
    })),
  },
}));

vi.mock('../hooks/useDesignStudioProject', () => ({
  useDesignStudioProject: () => ({
    project: { engine: 'grapesjs', projectJson: {}, htmlSnapshot: '', cssSnapshot: '', updatedAt: '' },
    loading: false,
    error: null,
    dirty: false,
    saving: false,
    markDirty: vi.fn(),
    persist: vi.fn(),
    enableStudio: vi.fn(),
    reload: vi.fn(),
  }),
}));

import { DesignStudioPage } from './DesignStudioPage';

describe('DesignStudioPage', () => {
  it('mounts Visual Design Studio shell', () => {
    render(
      <MemoryRouter>
        <DesignStudioPage
          pageVersionId="00000000-0000-0000-0000-000000000001"
          previewTo="/preview"
          backTo={{ to: '/', label: 'Retour' }}
          canWrite
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Visual Design Studio/i)).toBeInTheDocument();
    expect(screen.getByText('Blocs')).toBeInTheDocument();
  });
});
