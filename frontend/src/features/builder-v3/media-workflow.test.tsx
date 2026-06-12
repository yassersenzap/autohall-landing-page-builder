import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import {
  setBuilderPersistPageVersionId,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import type { PageAsset } from '@/lib/page-assets-api';
import { getInspectorControlsForBlock } from '@/features/builder/block-registry/inspector-controls-registry';
import { AssetsPanel } from './panels/AssetsPanel';
import { MediaFieldControl } from './components/MediaFieldControl';
import { buildMediaValuePatch } from './components/media-field-utils';
import { DefinitionDrivenBlockInspector } from './panels/inspector/DefinitionDrivenBlockInspector';
import { InspectorControlRenderer } from './panels/inspector/InspectorControlRenderer';
import { filterVisibleControls } from './panels/inspector/inspector-control-utils';
import {
  assertNoBlobUrlsInBlocks,
  BlobUrlValidationError,
} from '@/features/builder-engine/lib/blob-url-guard';

const pageAssetsState = vi.hoisted(() => ({
  assets: [] as PageAsset[],
}));

const mockAssets: PageAsset[] = [
  {
    id: 'asset-hero-1',
    landingPageId: 'lp-1',
    originalName: 'ranger-hero.jpg',
    storedName: 'stored.jpg',
    mimeType: 'image/jpeg',
    fileSize: 2048,
    storagePath: '/uploads/stored.jpg',
    publicPath: '/assets/stored.jpg',
    url: '/api/assets/asset-hero-1/file',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'asset-mobile-2',
    landingPageId: 'lp-1',
    originalName: 'ranger-mobile.png',
    storedName: 'mobile.png',
    mimeType: 'image/png',
    fileSize: 1024,
    storagePath: '/uploads/mobile.png',
    publicPath: '/assets/mobile.png',
    url: '/api/assets/asset-mobile-2/file',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

vi.mock('@/features/builder-engine/hooks/use-page-assets', () => ({
  usePageAssets: () => ({
    assets: pageAssetsState.assets,
    loading: false,
    uploading: false,
    error: null,
    reload: vi.fn(),
    upload: vi.fn(),
    setAssets: vi.fn(),
  }),
}));

function heroBlock(overrides: Record<string, unknown> = {}): BuilderDocumentBlock {
  return {
    id: 'block-hvo',
    type: 'hero_vehicle_offer',
    label: 'Hero offre',
    sortOrder: 0,
    propsJson: {
      brandId: 'ford',
      modelName: 'Ranger',
      headline: 'Test',
      layoutVariant: 'split-media-right',
      cropPreset: 'center',
      heroImage: '',
      heroImageUrl: '',
      design: { tone: 'brand' },
      ...overrides,
    },
  };
}

function textBlock(): BuilderDocumentBlock {
  return {
    id: 'block-text',
    type: 'text',
    label: 'Texte',
    sortOrder: 1,
    propsJson: { heading: 'Hello', content: 'World' },
  };
}

function campaignBlock(overrides: Record<string, unknown> = {}): BuilderDocumentBlock {
  return {
    id: 'block-clh',
    type: 'campaign_lead_hero',
    label: 'Hero campagne',
    sortOrder: 0,
    propsJson: {
      brandId: 'chery',
      campaignTitle: 'Campagne',
      formTitle: 'Contact',
      layoutVariant: 'media_left_form_right',
      cropPreset: 'center',
      design: { formTheme: 'light' },
      ...overrides,
    },
  };
}

describe('studio media workflow', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
    setBuilderPersistPageVersionId('pv-test-1');
    pageAssetsState.assets = [...mockAssets];
    vi.clearAllMocks();
  });

  it('Assets panel renders creative library grid', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock()]);
    useBuilderDocumentStore.getState().selectBlock('block-hvo');

    render(<AssetsPanel />);

    expect(screen.getByTestId('studio-assets-panel')).toBeInTheDocument();
    expect(screen.getByTestId('studio-assets-grid')).toBeInTheDocument();
    expect(screen.getByTestId('studio-asset-asset-hero-1')).toBeInTheDocument();
    expect(screen.getByText('ranger-hero.jpg')).toBeInTheDocument();
    expect(screen.getByTestId('assets-selected-block')).toHaveTextContent('Hero offre');
  });

  it('Assets panel shows empty state when no assets', () => {
    pageAssetsState.assets = [];
    render(<AssetsPanel />);
    expect(screen.getByTestId('studio-assets-empty')).toBeInTheDocument();
  });

  it('shows selected asset preview and target field when block is compatible', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock()]);
    useBuilderDocumentStore.getState().selectBlock('block-hvo');

    render(<AssetsPanel />);

    expect(screen.getByTestId('assets-target-field')).toBeInTheDocument();
    expect(screen.getByTestId('assets-selected-preview')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('studio-asset-asset-hero-1'));
    expect(screen.getByTestId('assets-selected-preview')).toHaveTextContent('ranger-hero.jpg');
  });

  it('shows apply disabled reason until asset is selected', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock()]);
    useBuilderDocumentStore.getState().selectBlock('block-hvo');

    render(<AssetsPanel />);

    expect(screen.getByTestId('assets-apply-disabled-reason')).toHaveTextContent(
      /Choisissez un visuel/,
    );
    expect(screen.getByTestId('assets-apply-button')).toBeDisabled();
  });

  it('applies selected asset and shows success feedback', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock()]);
    useBuilderDocumentStore.getState().selectBlock('block-hvo');

    render(<AssetsPanel />);

    fireEvent.click(screen.getByTestId('studio-asset-asset-hero-1'));
    fireEvent.click(screen.getByTestId('assets-apply-button'));

    expect(screen.getByTestId('assets-apply-feedback')).toHaveTextContent(/Visuel appliqué/);
    const updated = useBuilderDocumentStore.getState().blocks[0];
    expect(updated?.propsJson.heroImage).toBe('asset-hero-1');
    expect(updated?.propsJson.heroImageUrl).toBe('');
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe('block-hvo');
  });

  it('shows disabled reason when selected block has no image fields', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([textBlock()]);
    useBuilderDocumentStore.getState().selectBlock('block-text');

    render(<AssetsPanel />);

    expect(screen.getByTestId('assets-no-compatible-block')).toBeInTheDocument();
    expect(screen.getByTestId('assets-apply-disabled-reason')).toHaveTextContent(
      /pas de champ image compatible/,
    );
    expect(screen.queryByTestId('assets-apply-button')).not.toBeInTheDocument();
  });

  it('MediaFieldControl renders premium empty state', () => {
    render(
      <MediaFieldControl
        label="Image principale"
        value={{ imageAssetId: '', imageUrl: '' }}
        onChange={() => {}}
        showAlt={false}
        showObjectFit={false}
      />,
    );

    expect(screen.getByTestId('media-field-empty')).toBeInTheDocument();
    expect(screen.getByText('Ajouter un visuel')).toBeInTheDocument();
  });

  it('MediaFieldControl clear action emits empty asset patch', () => {
    const onChange = vi.fn();
    render(
      <MediaFieldControl
        label="Image principale"
        assetKey="heroImage"
        urlKey="heroImageUrl"
        value={{ imageAssetId: 'asset-hero-1', imageUrl: '' }}
        onChange={onChange}
        showAlt={false}
        showObjectFit={false}
      />,
    );

    fireEvent.click(screen.getByTestId('media-field-clear'));
    expect(onChange).toHaveBeenCalledWith({
      imageAssetId: '',
      imageUrl: '',
    });
  });

  it('buildMediaValuePatch strips unsafe URLs and keeps asset id', () => {
    const patch = buildMediaValuePatch('heroImage', 'heroImageUrl', 'heroImageAlt', {
      imageAssetId: 'asset-1',
      imageUrl: 'http://localhost:5173/tmp.jpg',
      alt: 'Alt',
    });

    expect(patch).toEqual({
      heroImage: 'asset-1',
      heroImageUrl: '',
      heroImageAlt: 'Alt',
    });
  });

  it('hides focal controls unless crop preset is custom', () => {
    const propsJson = heroBlock().propsJson;
    const controls = filterVisibleControls(
      propsJson,
      getInspectorControlsForBlock('hero_vehicle_offer').filter((c) => c.tab === 'media'),
    );

    render(
      <InspectorControlRenderer
        controls={controls}
        propsJson={propsJson}
        blockId="block-hvo"
        onPatch={() => {}}
      />,
    );

    expect(screen.queryByLabelText('Horizontal')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Vertical')).not.toBeInTheDocument();
  });

  it('shows focal controls when crop preset is custom', () => {
    const propsJson = heroBlock({ cropPreset: 'custom' }).propsJson;
    const controls = filterVisibleControls(
      propsJson,
      getInspectorControlsForBlock('hero_vehicle_offer').filter((c) => c.tab === 'media'),
    );

    render(
      <InspectorControlRenderer
        controls={controls}
        propsJson={propsJson}
        blockId="block-hvo"
        onPatch={() => {}}
      />,
    );

    expect(screen.getByLabelText('Horizontal')).toBeInTheDocument();
    expect(screen.getByLabelText('Vertical')).toBeInTheDocument();
  });

  it('hero_vehicle_offer Media tab groups Visuels, Responsive and Recadrage', () => {
    render(
      <InspectorControlRenderer
        controls={getInspectorControlsForBlock('hero_vehicle_offer').filter((c) => c.tab === 'media')}
        propsJson={heroBlock().propsJson}
        blockId="block-hvo"
        onPatch={() => {}}
      />,
    );

    expect(screen.getByText('Image principale (desktop)')).toBeInTheDocument();
    expect(screen.getByText('Responsive')).toBeInTheDocument();
    expect(screen.getAllByText('Recadrage').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText('Ajustement image')).toBeInTheDocument();
    expect(screen.getByLabelText('Overlay')).toBeInTheDocument();
    expect(screen.getByLabelText('Texte alternatif (alt)')).toBeInTheDocument();
  });

  it('campaign_lead_hero Media tab remains usable with aligned labels', () => {
    render(
      <DefinitionDrivenBlockInspector block={campaignBlock()} tab="media" onPatch={() => {}} />,
    );

    expect(screen.getByText('Image principale (desktop)')).toBeInTheDocument();
    expect(screen.getByText('Image mobile (optionnel)')).toBeInTheDocument();
    expect(screen.getByText('Responsive')).toBeInTheDocument();
    expect(screen.getAllByText('Recadrage').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText('Ajustement image')).toBeInTheDocument();
    expect(screen.getByLabelText('Overlay')).toBeInTheDocument();
  });

  it('blob URL persistence guard still blocks save payloads with blob URLs', () => {
    expect(() =>
      assertNoBlobUrlsInBlocks([
        {
          ...heroBlock(),
          propsJson: { heroImageUrl: 'blob:http://localhost/deadbeef' },
        },
      ]),
    ).toThrow(BlobUrlValidationError);
  });
});
