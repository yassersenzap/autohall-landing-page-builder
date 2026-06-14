import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { BLOCK_STUDIO_VISIBILITY_CONTROLS } from '@/features/builder/block-registry/block-studio-controls';
import { InspectorControlRenderer } from './InspectorControlRenderer';

type BlockVisibilityInspectorProps = {
  block: BuilderDocumentBlock;
  onPatch: (patch: Record<string, unknown>) => void;
};

/** Commutateurs de visibilité globale et responsive — toujours rendus, sans filtre de type. */
export function BlockVisibilityInspector({ block, onPatch }: BlockVisibilityInspectorProps) {
  return (
    <div data-testid="block-visibility-inspector">
      <InspectorControlRenderer
        controls={BLOCK_STUDIO_VISIBILITY_CONTROLS}
        blockType={block.type}
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={onPatch}
      />
    </div>
  );
}
