import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getInspectorControlsForBlock } from '../block-registry/inspector-controls-registry';
import { InspectorControlRenderer } from '@/features/builder-v3/panels/inspector/InspectorControlRenderer';
import { filterVisibleControls } from '@/features/builder-v3/panels/inspector/inspector-control-utils';
import { stripStudioOnlyBlockProps } from '../block-variants/studio-block-metadata';
import { sanitizePropsPatch } from '@/features/builder-engine/lib/sanitize-props-patch';

describe('block typography inspector', () => {
  it('renders typography controls for campaign_lead_hero and hero_vehicle_offer', () => {
    for (const blockType of ['campaign_lead_hero', 'hero_vehicle_offer'] as const) {
      const controls = filterVisibleControls(
        {},
        getInspectorControlsForBlock(blockType).filter(
          (c) => c.tab === 'design' && c.group === 'Typographie',
        ),
      );

      const { unmount } = render(
        <InspectorControlRenderer
          controls={controls}
          propsJson={{}}
          blockId={`block-${blockType}`}
          onPatch={() => {}}
        />,
      );

      expect(screen.getByLabelText('Échelle titre')).toBeInTheDocument();
      expect(screen.getByLabelText('Échelle sous-titre')).toBeInTheDocument();
      unmount();
    }
  });

  it('changing titleScale emits sanitized typography patch', () => {
    const onPatch = vi.fn();
    const controls = filterVisibleControls(
      {},
      getInspectorControlsForBlock('campaign_lead_hero').filter(
        (c) => c.propKey === 'titleScale' && c.store === 'typography',
      ),
    );

    render(
      <InspectorControlRenderer
        controls={controls}
        propsJson={{}}
        blockId="block-clh"
        onPatch={onPatch}
      />,
    );

    fireEvent.change(screen.getByLabelText('Échelle titre'), { target: { value: 'display' } });
    expect(onPatch).toHaveBeenCalledWith({
      typography: { titleScale: 'display' },
    });
  });

  it('export payload keeps typography and strips Studio-only metadata', () => {
    const propsJson = {
      campaignTitle: 'Titre',
      typography: { titleScale: 'xl', titleWeight: 'bold' },
      _studioPreviewHint: 'internal',
    };

    const safe = stripStudioOnlyBlockProps(
      sanitizePropsPatch(propsJson, 'campaign_lead_hero', propsJson),
    );

    expect(safe.typography).toEqual({ titleScale: 'xl', titleWeight: 'bold' });
    expect(safe._studioPreviewHint).toBeUndefined();
  });
});
