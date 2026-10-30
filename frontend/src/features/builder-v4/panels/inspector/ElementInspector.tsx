/**
 * Contextual inspector for elements inside regular sections
 * (text, image, button, card, stack, form, divider, spacer).
 *
 * Shows element-specific controls with a slim context breadcrumb
 * identifying the parent section.
 */
import { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useBuilderV4Store } from '../../store/document.store';
import { getLayerDisplayName } from '../../lib/layer-display';
import { canDeletePageNode } from '../../lib/page-builder-ops';
import { isSectionBlock } from '../../lib/studio-compat.js';
import {
  TextInspector,
  ImageInspector,
  ButtonInspector,
  CardInspector,
  StackInspector,
  FormInspector,
} from './NodeInspectors';
import { FillSection, BorderSection, LayoutSection } from './InspectorSections';

const KIND_ICON: Record<string, string> = {
  text: 'T',
  image: '⬜',
  button: '▶',
  form: '⊟',
  card: '▣',
  stack: '⊞',
  section: '▬',
};

function NodeKindInspector({ nodeId, kind }: { nodeId: string; kind: string }) {
  switch (kind) {
    case 'text': return <TextInspector nodeId={nodeId} />;
    case 'image': return <ImageInspector nodeId={nodeId} />;
    case 'button': return <ButtonInspector nodeId={nodeId} />;
    case 'card': return <CardInspector nodeId={nodeId} />;
    case 'stack': return <StackInspector nodeId={nodeId} />;
    case 'form': return <FormInspector nodeId={nodeId} />;
    default:
      return (
        <div className="v4-inspector-v2">
          <FillSection nodeId={nodeId} />
          <BorderSection nodeId={nodeId} />
          <LayoutSection nodeId={nodeId} />
        </div>
      );
  }
}

export function ElementInspector({ nodeId, sectionId }: { nodeId: string; sectionId?: string }) {
  const document = useBuilderV4Store((s) => s.document);
  const nodes = document.nodes;
  const node = nodes[nodeId];
  const sectionNode = sectionId ? nodes[sectionId] : undefined;
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const deleteNode = useBuilderV4Store((s) => s.deleteNode);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!node) return null;

  const nodeLabel = getLayerDisplayName(node, nodes);
  const sectionLabel = sectionNode && isSectionBlock(sectionNode)
    ? ((sectionNode.props as { label?: string }).label?.trim() || 'Section')
    : null;
  const kindIcon = KIND_ICON[node.kind] ?? '◻';
  const canDelete = canDeletePageNode(document, nodeId);

  return (
    <div className="v4-element-inspector">
      {/* Context breadcrumb */}
      <div className="v4-element-inspector__crumb">
        {sectionLabel ? (
          <>
            <button
              type="button"
              className="v4-element-inspector__crumb-link"
              onClick={() => sectionId && selectNode(sectionId)}
              title={`Aller à la section ${sectionLabel}`}
            >
              {sectionLabel}
            </button>
            <ChevronRight size={10} className="v4-element-inspector__crumb-sep" aria-hidden />
          </>
        ) : null}
        <span className="v4-element-inspector__crumb-current">
          <span className="v4-element-inspector__kind-badge">{kindIcon}</span>
          {nodeLabel}
        </span>

        {/* Delete element button */}
        {canDelete ? (
          confirmDelete ? (
            <div className="v4-element-inspector__confirm">
              <button type="button" className="v4-element-inspector__confirm-cancel" onClick={() => setConfirmDelete(false)}>
                Annuler
              </button>
              <button
                type="button"
                className="v4-element-inspector__confirm-delete"
                onClick={() => { deleteNode(nodeId); setConfirmDelete(false); }}
              >
                Supprimer
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="v4-element-inspector__delete"
              onClick={() => setConfirmDelete(true)}
              title="Supprimer cet élément"
            >
              <Trash2 size={12} />
            </button>
          )
        ) : null}
      </div>

      {/* Element-specific controls */}
      <div className="v4-element-inspector__body">
        <NodeKindInspector nodeId={nodeId} kind={node.kind} />
      </div>
    </div>
  );
}
