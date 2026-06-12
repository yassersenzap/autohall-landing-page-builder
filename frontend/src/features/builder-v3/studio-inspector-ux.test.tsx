import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { BlockInspectorPanel } from './panels/BlockInspectorPanel';
import { injectIframeStyles } from './canvas/inject-iframe-styles';

vi.mock('@/features/builder-engine/hooks/use-page-assets', () => ({
  usePageAssets: () => ({
    assets: [],
    loading: false,
    uploading: false,
    error: null,
    reload: vi.fn(),
    upload: vi.fn(),
    setAssets: vi.fn(),
  }),
}));

function campaignBlock(): BuilderDocumentBlock {
  return {
    id: 'clh-1',
    type: 'campaign_lead_hero',
    label: 'Hero campagne',
    sortOrder: 0,
    propsJson: {
      brandId: 'chery',
      campaignTitle: 'Test',
      formTitle: 'Contact',
      formCtaLabel: 'Continuer',
      layoutVariant: 'media_left_form_right',
      design: { formTheme: 'light', tone: 'light', showOfferBadge: true, showProgressBar: true },
    },
  };
}

function renderInspector(block = campaignBlock()) {
  return render(
    <div className="flex h-[520px] w-[320px] min-h-0 flex-col overflow-hidden">
      <BlockInspectorPanel
        block={block}
        updateBlockProps={vi.fn()}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDelete={() => {}}
        canMoveUp={false}
        canMoveDown={false}
      />
    </div>,
  );
}

describe('Studio inspector UX stabilization', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('renders all block inspector tab labels in a horizontal scroll container', () => {
    renderInspector();

    expect(screen.getByTestId('studio-scrollable-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('studio-tabs-scroll-viewport')).toHaveClass('overflow-x-auto');

    for (const label of ['Contenu', 'Design', 'Layout', 'Media', 'Avancé']) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
    }
  });

  it('can select the Avancé tab and reach export/provider fields', () => {
    renderInspector();

    fireEvent.click(screen.getByRole('tab', { name: 'Avancé' }));
    expect(screen.getByRole('tab', { name: 'Avancé' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Fournisseur formulaire')).toBeInTheDocument();
    expect(screen.getByLabelText('Cible d’export')).toBeInTheDocument();
  });

  it('keeps inspector body scrollable with bottom padding for long forms', () => {
    renderInspector();

    const scroll = screen.getByTestId('block-inspector-scroll');
    expect(scroll).toHaveClass('overflow-y-auto');
    expect(scroll.querySelector('.pb-10')).toBeTruthy();
  });

  it('applyPageStarter works when crypto.randomUUID is unavailable', () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto) },
    });

    try {
      useBuilderDocumentStore.getState().applyPageStarter(['campaign_lead_hero'], 'replace');
      expect(useBuilderDocumentStore.getState().blocks.length).toBeGreaterThan(0);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: originalCrypto,
      });
    }
  });

  it('injectIframeStyles completes without crypto.randomUUID', async () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto) },
    });

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    expect(doc).toBeTruthy();

    try {
      await expect(injectIframeStyles(doc!)).resolves.toBeUndefined();
      expect(doc!.head.querySelector('[data-builder-v3-styles]')).toBeTruthy();
    } finally {
      iframe.remove();
      Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: originalCrypto,
      });
    }
  });
});
