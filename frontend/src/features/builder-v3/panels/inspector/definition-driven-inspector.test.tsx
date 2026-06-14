import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { getInspectorControlsForBlock } from '@/features/builder/block-registry/inspector-controls-registry';
import { BLOCK_STUDIO_VISIBILITY_CONTROLS } from '@/features/builder/block-registry/block-studio-controls';
import { BlockInspectorPanel } from '../BlockInspectorPanel';
import { DefinitionDrivenBlockInspector } from './DefinitionDrivenBlockInspector';
import { InspectorControlRenderer } from './InspectorControlRenderer';
import { buildControlPatch } from './inspector-control-utils';

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

function heroOfferBlock(): BuilderDocumentBlock {
  return {
    id: 'block-hvo',
    type: 'hero_vehicle_offer',
    label: 'Hero offre',
    sortOrder: 0,
    propsJson: {
      brandId: 'ford',
      modelName: 'Ranger',
      headline: 'Test headline',
      subheadline: '',
      offerLabel: 'Offre',
      priceText: '100 000 DH',
      primaryCtaLabel: 'Essai',
      secondaryCtaLabel: 'Voir',
      layoutVariant: 'split-media-right',
      cropPreset: 'center',
      design: { tone: 'brand', density: 'comfortable', ctaStyle: 'primary', showOfferBadge: true, alignContent: 'left' },
    },
  };
}

function campaignBlock(): BuilderDocumentBlock {
  return {
    id: 'block-clh',
    type: 'campaign_lead_hero',
    label: 'Hero campagne',
    sortOrder: 0,
    propsJson: {
      brandId: 'chery',
      campaignTitle: 'Campagne test',
      formTitle: 'Contact',
      formCtaLabel: 'Continuer',
      layoutVariant: 'media_left_form_right',
      design: { formTheme: 'light', tone: 'light', showOfferBadge: true, showProgressBar: true },
    },
  };
}

describe('definition-driven inspector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes inspector controls for premium blocks', () => {
    expect(getInspectorControlsForBlock('hero_vehicle_offer').length).toBeGreaterThan(10);
    expect(getInspectorControlsForBlock('campaign_lead_hero').length).toBeGreaterThan(10);
    expect(getInspectorControlsForBlock('hero_campaign')).toHaveLength(0);
    expect(BLOCK_STUDIO_VISIBILITY_CONTROLS.find((c) => c.propKey === 'hidden')?.propKey).toBe(
      'hidden',
    );
  });

  it('renders tabbed controls with groups', () => {
    const block = heroOfferBlock();
    const controls = getInspectorControlsForBlock('hero_vehicle_offer').filter((c) => c.tab === 'content');

    render(
      <InspectorControlRenderer
        controls={controls}
        blockType="hero_vehicle_offer"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={() => {}}
      />,
    );

    expect(screen.getByTestId('definition-driven-inspector')).toBeInTheDocument();
    expect(screen.getByLabelText('Marque')).toBeInTheDocument();
    expect(screen.getByLabelText('Titre principal')).toBeInTheDocument();
    expect(screen.getByText('Identité')).toBeInTheDocument();
  });

  it('emits correct patch when text control changes', () => {
    const onPatch = vi.fn();
    const block = heroOfferBlock();
    const headlineControl = getInspectorControlsForBlock('hero_vehicle_offer').find(
      (c) => c.key === 'hvo-headline',
    )!;

    render(
      <InspectorControlRenderer
        controls={[headlineControl]}
        blockType="hero_vehicle_offer"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={onPatch}
      />,
    );

    fireEvent.change(screen.getByLabelText('Titre principal'), {
      target: { value: 'Nouveau titre' },
    });

    expect(onPatch).toHaveBeenCalledWith({ headline: 'Nouveau titre' });
  });

  it('emits design patch for design-stored controls', () => {
    const block = heroOfferBlock();
    const toneControl = getInspectorControlsForBlock('hero_vehicle_offer').find(
      (c) => c.key === 'hvo-tone',
    )!;

    const patch = buildControlPatch(block.propsJson, toneControl, 'dark');
    expect(patch).toEqual({
      design: expect.objectContaining({ tone: 'dark' }),
    });
  });

  it('renders select and range-style number controls on media tab', () => {
    const block = heroOfferBlock();
    const mediaControls = getInspectorControlsForBlock('hero_vehicle_offer').filter(
      (c) => c.tab === 'media' && (c.type === 'select' || c.type === 'image'),
    );

    render(
      <InspectorControlRenderer
        controls={mediaControls}
        blockType="hero_vehicle_offer"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={() => {}}
      />,
    );

    expect(screen.getByLabelText('Ajustement image')).toBeInTheDocument();
    expect(screen.getByText('Image principale (desktop)')).toBeInTheDocument();
  });

  it('hero_vehicle_offer uses definition-driven inspector fields', () => {
    const onPatch = vi.fn();
    render(
      <DefinitionDrivenBlockInspector block={heroOfferBlock()} tab="content" onPatch={onPatch} />,
    );

    fireEvent.change(screen.getByLabelText('Modèle'), { target: { value: 'Mustang' } });
    expect(onPatch).toHaveBeenCalledWith({ modelName: 'Mustang' });
  });

  it('campaign_lead_hero uses definition-driven inspector fields', () => {
    const onPatch = vi.fn();
    render(
      <DefinitionDrivenBlockInspector block={campaignBlock()} tab="content" onPatch={onPatch} />,
    );

    fireEvent.change(screen.getByLabelText('Titre campagne'), {
      target: { value: 'Nouvelle campagne' },
    });
    expect(onPatch).toHaveBeenCalledWith({ campaignTitle: 'Nouvelle campagne' });
  });

  it('legacy hero_campaign still uses fallback inspector fields', () => {
    const updateBlockProps = vi.fn();
    const block: BuilderDocumentBlock = {
      id: 'legacy-hero',
      type: 'hero_campaign',
      label: 'Hero',
      sortOrder: 0,
      propsJson: { title: 'Legacy', subtitle: '', buttonText: 'Go' },
    };

    render(
      <BlockInspectorPanel
        block={block}
        updateBlockProps={updateBlockProps}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDelete={() => {}}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    expect(screen.queryByTestId('definition-driven-inspector')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Titre')).toBeInTheDocument();
  });

  it('basic rich_text block exposes universal hide controls on advanced tab', () => {
    const updateBlockProps = vi.fn();
    const block: BuilderDocumentBlock = {
      id: 'rich-1',
      type: 'rich_text',
      label: 'Bloc texte',
      sortOrder: 0,
      propsJson: { titre: 'Titre', contenu: 'Corps' },
    };

    render(
      <BlockInspectorPanel
        block={block}
        updateBlockProps={updateBlockProps}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDelete={() => {}}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Avancé' }));
    expect(screen.getByTestId('block-visibility-inspector')).toBeInTheDocument();
    expect(screen.getByLabelText('Masquer le bloc')).toBeInTheDocument();
    expect(screen.getByLabelText('Masquer sur mobile')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Masquer le bloc'));
    expect(updateBlockProps).toHaveBeenCalledWith('rich-1', { hidden: true });
  });

  it('core_campaign_form_landing exposes universal hide controls on advanced tab', () => {
    const updateBlockProps = vi.fn();
    const block: BuilderDocumentBlock = {
      id: 'core-1',
      type: 'core_campaign_form_landing',
      label: 'Landing métier',
      sortOrder: 0,
      propsJson: { title: 'Campagne', formTitle: 'Formulaire' },
    };

    render(
      <BlockInspectorPanel
        block={block}
        updateBlockProps={updateBlockProps}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDelete={() => {}}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Avancé' }));
    expect(screen.getByLabelText('Masquer le bloc')).toBeInTheDocument();
  });
});
