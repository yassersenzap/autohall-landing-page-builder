import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { TemplatesPanel } from './panels/TemplatesPanel';

describe('TemplatesPanel campaign presets', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('renders premium campaign templates', () => {
    render(<TemplatesPanel />);

    expect(screen.getByTestId('studio-templates-panel')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-template-card-chery-campaign-offer')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-template-card-ford-offer-campaign')).toBeInTheDocument();
    expect(screen.getByText('Campagne offre Chery')).toBeInTheDocument();
    expect(screen.getByText('Essai Opel')).toBeInTheDocument();
  });

  it('applies template directly on empty page without confirmation', () => {
    render(<TemplatesPanel />);

    fireEvent.click(screen.getByTestId('campaign-template-use-chery-model-landing'));

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks.length).toBeGreaterThan(4);
    expect(state.blocks[0]?.type).toBe('hero_vehicle_offer');
    expect(screen.queryByTestId('campaign-template-replace-warning')).not.toBeInTheDocument();
  });

  it('shows replace warning before wiping existing blocks', () => {
    useBuilderDocumentStore.getState().applyPageStarter(['faq'], 'replace');

    render(<TemplatesPanel />);

    fireEvent.click(screen.getByTestId('campaign-template-use-ford-offer-campaign'));

    expect(screen.getByTestId('campaign-template-replace-warning')).toBeInTheDocument();
    expect(useBuilderDocumentStore.getState().blocks[0]?.type).toBe('faq');

    fireEvent.click(screen.getByTestId('campaign-template-confirm-replace'));

    expect(useBuilderDocumentStore.getState().blocks[0]?.type).toBe('campaign_lead_hero');
  });

  it('cancel keeps current document intact', () => {
    useBuilderDocumentStore.getState().applyPageStarter(['faq'], 'replace');
    const beforeId = useBuilderDocumentStore.getState().blocks[0]?.id;

    render(<TemplatesPanel />);
    fireEvent.click(screen.getByTestId('campaign-template-use-opel-test-drive'));
    fireEvent.click(screen.getByTestId('campaign-template-cancel-replace'));

    expect(useBuilderDocumentStore.getState().blocks[0]?.id).toBe(beforeId);
    expect(useBuilderDocumentStore.getState().blocks[0]?.type).toBe('faq');
  });
});
