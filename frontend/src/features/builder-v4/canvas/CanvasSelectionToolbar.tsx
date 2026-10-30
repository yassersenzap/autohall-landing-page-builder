import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useBuilderV4Store } from '../store/document.store';
import { canDeletePageNode, canDuplicatePageNode, isPageBlock } from '../lib/page-builder-ops';
import { getLayerDisplayName } from '../lib/layer-display';

/**
 * Single floating toolbar — Framer-style.
 * Edit · Duplicate · Hide · Delete
 * Reorder is done via Layers panel (drag & drop).
 */
export function CanvasSelectionToolbar() {
  const selectedNodeId = useBuilderV4Store((s) => s.selectedNodeId);
  const document = useBuilderV4Store((s) => s.document);
  const nodes = document.nodes;
  const deleteNode = useBuilderV4Store((s) => s.deleteNode);
  const duplicateNode = useBuilderV4Store((s) => s.duplicateNode);
  const updateNodeVisibility = useBuilderV4Store((s) => s.updateNodeVisibility);
  const previewMode = useBuilderV4Store((s) => s.previewMode);

  const visible = !previewMode && Boolean(selectedNodeId);
  const node = selectedNodeId ? nodes[selectedNodeId] : null;
  const isSection = node ? isPageBlock(document, node) : false;
  const isHidden = node?.visibility?.hidden ?? false;
  const label = node ? getLayerDisplayName(node, nodes) : '';
  const canDelete = node && selectedNodeId ? canDeletePageNode(document, selectedNodeId) : false;
  const canDuplicate = node && selectedNodeId ? canDuplicatePageNode(document, selectedNodeId) : false;

  return (
    <AnimatePresence>
      {visible && node ? (
        <motion.div
          key="toolbar"
          className="v4-floating-toolbar"
          data-testid="canvas-selection-toolbar"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Node label */}
          <span className="v4-floating-toolbar__label">{label}</span>
          <span className="v4-floating-toolbar__divider" aria-hidden />

          {/* Duplicate */}
          <button
            type="button"
            className="v4-floating-toolbar__btn"
            disabled={!canDuplicate}
            onClick={() => selectedNodeId && duplicateNode(selectedNodeId)}
            title="Dupliquer (Ctrl+D)"
            data-testid="toolbar-duplicate"
          >
            <Copy size={12} strokeWidth={2} />
          </button>

          {/* Visibility — section only */}
          {isSection ? (
            <button
              type="button"
              className={`v4-floating-toolbar__btn ${isHidden ? 'v4-floating-toolbar__btn--dim' : ''}`}
              onClick={() => selectedNodeId && updateNodeVisibility(selectedNodeId, { hidden: !isHidden })}
              title={isHidden ? 'Afficher' : 'Masquer'}
              data-testid="toolbar-visibility"
            >
              {isHidden ? <EyeOff size={12} strokeWidth={2} /> : <Eye size={12} strokeWidth={2} />}
            </button>
          ) : null}

          <span className="v4-floating-toolbar__divider" aria-hidden />

          {/* Delete */}
          <button
            type="button"
            className="v4-floating-toolbar__btn v4-floating-toolbar__btn--danger"
            disabled={!canDelete}
            onClick={() => selectedNodeId && deleteNode(selectedNodeId)}
            title={`Supprimer (Delete)`}
            data-testid="toolbar-delete"
          >
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
