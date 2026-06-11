import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import type { InspectorTab } from '@/features/builder/block-registry/inspector-control.types';
import { getInspectorControlsForTab } from '@/features/builder/block-registry/inspector-controls-registry';
import { filterVisibleControls } from './inspector-control-utils';
import { InspectorControlRenderer } from './InspectorControlRenderer';

type DefinitionDrivenBlockInspectorProps = {
  block: BuilderDocumentBlock;
  tab: InspectorTab;
  onPatch: (patch: Record<string, unknown>) => void;
};

const TAB_EMPTY_MESSAGES: Record<InspectorTab, string> = {
  content: 'Aucun champ contenu pour ce bloc.',
  design: 'Aucune option de design pour ce bloc.',
  layout: 'Aucune option de mise en page pour ce bloc.',
  media: 'Aucun champ média pour ce bloc.',
  advanced: 'Aucun paramètre avancé pour ce bloc.',
};

export function DefinitionDrivenBlockInspector({
  block,
  tab,
  onPatch,
}: DefinitionDrivenBlockInspectorProps) {
  const controls = filterVisibleControls(
    block.propsJson,
    getInspectorControlsForTab(block.type, tab),
  );

  return (
    <InspectorControlRenderer
      controls={controls}
      propsJson={block.propsJson}
      blockId={block.id}
      onPatch={onPatch}
      emptyMessage={TAB_EMPTY_MESSAGES[tab]}
    />
  );
}
