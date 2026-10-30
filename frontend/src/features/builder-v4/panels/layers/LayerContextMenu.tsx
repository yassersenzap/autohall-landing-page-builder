import { Copy, CopyPlus, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBuilderV4Store } from '../../store/document.store';
import { canDeleteCampaignNode, campaignDeleteLabel } from '../../lib/campaign-delete';
import { canDuplicateCampaignNode, duplicateUsesClipboard } from '../../lib/campaign-duplicate';
import { isHeroFormBlock } from '../../lib/studio-compat.js';
import type { BuilderNode } from '../../types/nodes.types';

export type LayerContextMenuState = {
  x: number;
  y: number;
  nodeId: string;
} | null;

type LayerContextMenuProps = {
  menu: LayerContextMenuState;
  onClose: () => void;
};

export function LayerContextMenu({ menu, onClose }: LayerContextMenuProps) {
  const document = useBuilderV4Store((s) => s.document);
  const deleteNode = useBuilderV4Store((s) => s.deleteNode);
  const duplicateNode = useBuilderV4Store((s) => s.duplicateNode);
  const copySelection = useBuilderV4Store((s) => s.copySelection);
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const setRenamingNodeId = useBuilderV4Store((s) => s.setRenamingNodeId);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const updateNodeVisibility = useBuilderV4Store((s) => s.updateNodeVisibility);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const node = document.nodes[menu.nodeId] as BuilderNode | undefined;
  if (!node) return null;

  const canDelete = canDeleteCampaignNode(document, menu.nodeId);
  const canDuplicate = canDuplicateCampaignNode(document, menu.nodeId);
  const copyInstead = duplicateUsesClipboard(node);
  const isHidden = node.visibility.hidden;
  const deleteLabel = campaignDeleteLabel(document, menu.nodeId);

  function handleRename() {
    if (isHeroFormBlock(node!)) {
      const current = (node!.props as { label?: string }).label ?? 'Hero + Form';
      const next = window.prompt('Renommer le bloc', current);
      if (next?.trim()) {
        updateNodeProps(menu!.nodeId, { label: next.trim() });
      }
    } else {
      selectNode(menu!.nodeId);
      setRenamingNodeId(menu!.nodeId);
    }
    onClose();
  }

  function handleDuplicate() {
    selectNode(menu!.nodeId);
    if (copyInstead) {
      copySelection();
    } else {
      duplicateNode(menu!.nodeId);
    }
    onClose();
  }

  function handleDelete() {
    selectNode(menu!.nodeId);
    deleteNode(menu!.nodeId);
    onClose();
  }

  function handleToggleHide() {
    updateNodeVisibility(menu!.nodeId, { hidden: !isHidden });
    onClose();
  }

  return createPortal(
    <div
      ref={menuRef}
      className="v4-layer-context-menu"
      style={{ top: menu.y, left: menu.x }}
      role="menu"
      data-testid="layer-context-menu"
    >
      <button type="button" className="v4-layer-context-menu__item" role="menuitem" onClick={handleRename}>
        <Pencil size={14} aria-hidden />
        Renommer
      </button>
      <button
        type="button"
        className="v4-layer-context-menu__item"
        role="menuitem"
        disabled={!canDuplicate && !copyInstead}
        onClick={handleDuplicate}
        data-testid="layer-context-duplicate"
      >
        <CopyPlus size={14} aria-hidden />
        {copyInstead ? 'Copier le bloc' : 'Dupliquer'}
      </button>
      <button type="button" className="v4-layer-context-menu__item" role="menuitem" onClick={() => { selectNode(menu.nodeId); copySelection(); onClose(); }}>
        <Copy size={14} aria-hidden />
        Copier
      </button>
      <button type="button" className="v4-layer-context-menu__item" role="menuitem" onClick={handleToggleHide}>
        {isHidden ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
        {isHidden ? 'Afficher' : 'Masquer'}
      </button>
      <div className="v4-layer-context-menu__sep" role="separator" />
      <button
        type="button"
        className="v4-layer-context-menu__item v4-layer-context-menu__item--danger"
        role="menuitem"
        disabled={!canDelete}
        onClick={handleDelete}
        data-testid="layer-context-delete"
      >
        <Trash2 size={14} aria-hidden />
        Supprimer {deleteLabel}
      </button>
    </div>,
    globalThis.document.body,
  );
}
