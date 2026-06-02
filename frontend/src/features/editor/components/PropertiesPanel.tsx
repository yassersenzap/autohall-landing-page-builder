import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { EditorPageBlock } from '../types/editor.types';
import { BlockInspector } from './BlockInspector';

type PropertiesPanelProps = {
  selectedBlock: EditorPageBlock | null;
  canWrite: boolean;
  onChangeProps: (blockId: string, nextProps: Record<string, unknown>) => void;
};

export function PropertiesPanel({
  selectedBlock,
  canWrite,
  onChangeProps,
}: PropertiesPanelProps) {
  return (
    <Card title="Propriétés" className="editor-panel">
      {selectedBlock ? (
        <div className="editor-properties">
          <p className="editor-properties__meta">
            {selectedBlock.blockType} · {selectedBlock.blockKey}
          </p>
          <BlockInspector
            block={selectedBlock}
            disabled={!canWrite}
            onChangeProps={(next) => onChangeProps(selectedBlock.id, next)}
          />
        </div>
      ) : (
        <EmptyState title="Aucun bloc sélectionné" description="Sélectionnez un bloc sur le canvas pour éditer ses propriétés." />
      )}
    </Card>
  );
}
