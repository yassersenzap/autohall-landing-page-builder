import { Trash2 } from 'lucide-react';
import { useBuilderV4Store } from '../../store/document.store';
import { canDeletePageNode, pageDeleteLabel } from '../../lib/page-builder-ops';
import { InspectorField, InspectorHint, InspectorSection } from './InspectorPrimitives';

export function DeleteBlockSection({ nodeId, compact = false }: { nodeId: string; compact?: boolean }) {
  const document = useBuilderV4Store((s) => s.document);
  const deleteNode = useBuilderV4Store((s) => s.deleteNode);

  if (!canDeletePageNode(document, nodeId)) return null;

  const label = pageDeleteLabel(document, nodeId);

  if (compact) {
    return (
      <button
        type="button"
        className="v4-inspector-delete-compact"
        onClick={() => deleteNode(nodeId)}
        title={`Supprimer ${label}`}
        data-testid="inspector-delete-block"
      >
        <Trash2 size={14} aria-hidden />
      </button>
    );
  }

  return (
    <InspectorSection title="Actions" value="delete-block">
      <InspectorField label="Supprimer">
        <button
          type="button"
          className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block v4-inspector-v2__preset-btn--danger"
          onClick={() => deleteNode(nodeId)}
          data-testid="inspector-delete-block"
        >
          <Trash2 size={14} aria-hidden />
          Supprimer {label}
        </button>
      </InspectorField>
      <InspectorHint>Raccourci : Suppr ou Retour arrière</InspectorHint>
    </InspectorSection>
  );
}
