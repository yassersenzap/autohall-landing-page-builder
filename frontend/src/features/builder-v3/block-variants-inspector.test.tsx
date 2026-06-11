import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { BlockInspectorPanel } from './panels/BlockInspectorPanel';
import { BlockVariantPicker } from './panels/inspector/BlockVariantPicker';

function campaignHeroBlock(): BuilderDocumentBlock {
  return {
    id: 'hero-1',
    type: 'campaign_lead_hero',
    label: 'Hero campagne',
    sortOrder: 0,
    propsJson: {
      campaignTitle: 'Titre conservé',
      formCtaLabel: 'CTA conservé',
      layoutVariant: 'media_left_form_right',
      design: { tone: 'light', formTheme: 'light' },
    },
  };
}

function leadFormBlock(): BuilderDocumentBlock {
  return {
    id: 'form-1',
    type: 'lead_form',
    label: 'Formulaire',
    sortOrder: 1,
    propsJson: { title: 'Contact' },
  };
}

describe('block variant inspector', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('renders variant cards for supported blocks', () => {
    render(<BlockVariantPicker block={campaignHeroBlock()} />);
    expect(screen.getByTestId('block-variant-picker')).toBeInTheDocument();
    expect(screen.getByTestId('variant-card-campaign-hero-split-premium-form')).toBeInTheDocument();
    expect(screen.getByText('Styles rapides')).toBeInTheDocument();
  });

  it('does not render variant section for unsupported blocks', () => {
    const { container } = render(<BlockVariantPicker block={leadFormBlock()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('applying variant from inspector updates block and marks dirty', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([campaignHeroBlock()]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    render(
      <BlockInspectorPanel
        block={campaignHeroBlock()}
        updateBlockProps={useBuilderDocumentStore.getState().updateBlockProps}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDelete={() => {}}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: /design/i }));
    fireEvent.click(screen.getByTestId('variant-card-campaign-hero-background-image'));

    const state = useBuilderDocumentStore.getState();
    expect(state.themeDirty).toBe(true);
    expect(state.blocks[0]?.propsJson.campaignTitle).toBe('Titre conservé');
    expect(state.blocks[0]?.propsJson.layoutVariant).toBe('background_media_form_right');
    expect(state.selectedBlockId).toBe('hero-1');
  });
});
