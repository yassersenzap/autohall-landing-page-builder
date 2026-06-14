import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { buildControlPatch } from './panels/inspector/inspector-control-utils';
import {
  buildSectionStyleInspectorControls,
  parseSectionStyle,
} from '@/features/builder/section-style';
import { BLOCK_STUDIO_VISIBILITY_CONTROLS } from '@/features/builder/block-registry/block-studio-controls';
import { CanvasToolbar } from './layout/CanvasToolbar';
import { DefinitionDrivenBlockInspector } from './panels/inspector/DefinitionDrivenBlockInspector';
import { StudioLayout } from './layout/StudioLayout';

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

vi.mock('./canvas/IframeCanvas', () => ({
  IframeCanvas: () => <div data-testid="iframe-canvas-mock" />,
}));

function faqBlock(): BuilderDocumentBlock {
  return {
    id: 'faq-1',
    type: 'faq',
    label: 'FAQ',
    sortOrder: 0,
    propsJson: {
      heading: 'Questions',
      items: [{ question: 'Q?', answer: 'A.' }],
    },
  };
}

describe('viewport and section style V1', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('viewport switcher updates studio device mode', () => {
    render(
      <CanvasToolbar
        deviceMode="desktop"
        onDeviceModeChange={(mode) => useBuilderDocumentStore.getState().setDeviceMode(mode)}
      />,
    );

    fireEvent.click(screen.getByTestId('studio-viewport-tablet'));
    expect(useBuilderDocumentStore.getState().deviceMode).toBe('tablet');

    fireEvent.click(screen.getByTestId('studio-viewport-mobile'));
    expect(useBuilderDocumentStore.getState().deviceMode).toBe('mobile');
  });

  it('preserves selection when switching viewport', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([faqBlock()]);
    useBuilderDocumentStore.getState().selectBlock('faq-1');

    render(
      <CanvasToolbar
        deviceMode="desktop"
        onDeviceModeChange={(mode) => useBuilderDocumentStore.getState().setDeviceMode(mode)}
      />,
    );

    fireEvent.click(screen.getByTestId('studio-viewport-mobile'));
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe('faq-1');
  });

  it('renders section style controls for supported premium blocks', () => {
    const controls = buildSectionStyleInspectorControls('campaign_lead_hero');
    expect(controls.some((c) => c.label === 'Espacement vertical')).toBe(true);
    expect(controls.some((c) => c.label === 'Largeur du contenu')).toBe(true);
  });

  it('emits correct patch when changing section padding', () => {
    const control = buildSectionStyleInspectorControls('faq').find(
      (c) => c.propKey === 'sectionPaddingY',
    )!;
    const patch = buildControlPatch({}, control, 'lg');
    expect(patch).toEqual({ sectionStyle: { sectionPaddingY: 'lg' } });
  });

  it('emits correct patch for container width and hide flags', () => {
    const widthControl = buildSectionStyleInspectorControls('cta_band').find(
      (c) => c.propKey === 'containerWidth',
    )!;
    const hideControl = BLOCK_STUDIO_VISIBILITY_CONTROLS.find(
      (c) => c.propKey === 'hideOnMobile',
    )!;

    expect(buildControlPatch({}, widthControl, 'wide')).toEqual({
      sectionStyle: { containerWidth: 'wide' },
    });
    expect(buildControlPatch({}, hideControl, true)).toEqual({
      sectionStyle: { hideOnMobile: true },
    });
  });

  it('does not expose section style controls for unsupported blocks', () => {
    expect(buildSectionStyleInspectorControls('hero_campaign')).toHaveLength(0);
  });

  it('inspector design tab renders section style group for faq', () => {
    render(
      <DefinitionDrivenBlockInspector block={faqBlock()} tab="design" onPatch={vi.fn()} />,
    );
    expect(screen.getByLabelText('Espacement vertical')).toBeInTheDocument();
    expect(screen.getByLabelText('Largeur du contenu')).toBeInTheDocument();
  });

  it('campaign templates still apply with valid section style defaults', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('chery-campaign-offer');
    const hero = useBuilderDocumentStore
      .getState()
      .blocks.find((b) => b.type === 'campaign_lead_hero');
    expect(hero).toBeTruthy();
    expect(parseSectionStyle(hero!.propsJson).sectionPaddingY).toBe('lg');
  });

  it('studio route still loads', () => {
    render(
      <DndContext>
        <StudioLayout documentHydrated />
      </DndContext>,
    );
    expect(document.querySelector('[data-studio-shell]')).toBeInTheDocument();
    expect(screen.getByTestId('studio-viewport-switcher')).toBeInTheDocument();
  });
});
