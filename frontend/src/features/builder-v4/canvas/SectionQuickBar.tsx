import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, CopyPlus, Trash2 } from 'lucide-react';
import { useBuilderV4Store } from '../store/document.store';
import { canDeletePageNode, canDuplicatePageNode } from '../lib/page-builder-ops';
import { getLayerDisplayName } from '../lib/layer-display';

/**
 * Section-level quick action bar.
 * Appears when hovering ANY direct child section of the root frame,
 * completely independent of the selection system — so even "stuck"
 * hero-form blocks that absorb clicks can be deleted.
 */
export function SectionQuickBar({ container }: { container: HTMLElement | null }) {
  const document = useBuilderV4Store((s) => s.document);
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const deleteNode = useBuilderV4Store((s) => s.deleteNode);
  const duplicateNode = useBuilderV4Store((s) => s.duplicateNode);
  const moveSection = useBuilderV4Store((s) => s.moveSection);
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [barTop, setBarTop] = useState(0);
  const [barLeft, setBarLeft] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Root frame's direct children — these are the top-level sections
  const rootNode = document.nodes[document.rootId];
  const sectionIds = rootNode?.children ?? [];

  useEffect(() => {
    if (!container || previewMode) return;

    function onSectionPointerEnter(this: HTMLElement) {
      const nodeId = this.dataset.sectionQuick;
      if (!nodeId) return;
      if (hideTimer.current) clearTimeout(hideTimer.current);

      const containerRect = container!.getBoundingClientRect();
      const elRect = this.getBoundingClientRect();
      setBarTop(elRect.top - containerRect.top + container!.scrollTop);
      setBarLeft(elRect.left - containerRect.left + container!.scrollLeft + elRect.width / 2);
      setActiveId(nodeId);
    }

    function onSectionPointerLeave(this: HTMLElement) {
      hideTimer.current = setTimeout(() => setActiveId(null), 300);
    }

    const attached: HTMLElement[] = [];
    for (const id of sectionIds) {
      const el = container.querySelector<HTMLElement>(`[data-section-quick="${id}"]`);
      if (el) {
        el.addEventListener('pointerenter', onSectionPointerEnter);
        el.addEventListener('pointerleave', onSectionPointerLeave);
        attached.push(el);
      }
    }
    return () => {
      for (const el of attached) {
        el.removeEventListener('pointerenter', onSectionPointerEnter);
        el.removeEventListener('pointerleave', onSectionPointerLeave);
      }
    };
  }, [container, previewMode, sectionIds]);

  function keepBarOpen() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }

  function startHideBar() {
    hideTimer.current = setTimeout(() => setActiveId(null), 300);
  }

  if (!activeId || previewMode) return null;

  const node = document.nodes[activeId];
  if (!node) return null;

  const canDelete = canDeletePageNode(document, activeId);
  const canDup = canDuplicatePageNode(document, activeId);
  const parentId = node.parentId;
  const parent = parentId ? document.nodes[parentId] : null;
  const idx = parent ? parent.children.indexOf(activeId) : -1;
  const canMoveUp = idx > 0;
  const canMoveDown = parent ? idx < parent.children.length - 1 : false;
  const label = getLayerDisplayName(node, document.nodes);

  return (
    <div
      ref={barRef}
      className="v4-section-quickbar"
      style={{ top: barTop + 8, left: barLeft }}
      onPointerEnter={keepBarOpen}
      onPointerLeave={startHideBar}
      role="toolbar"
      aria-label={`Actions — ${label}`}
    >
      <span className="v4-section-quickbar__label">{label}</span>
      <span className="v4-section-quickbar__sep" aria-hidden />

      <button type="button" className="v4-section-quickbar__btn" disabled={!canMoveUp}
        onClick={() => moveSection(activeId, 'up')} title="Monter">
        <ArrowUp size={12} />
      </button>
      <button type="button" className="v4-section-quickbar__btn" disabled={!canMoveDown}
        onClick={() => moveSection(activeId, 'down')} title="Descendre">
        <ArrowDown size={12} />
      </button>

      <span className="v4-section-quickbar__sep" aria-hidden />

      <button type="button" className="v4-section-quickbar__btn" disabled={!canDup}
        onClick={() => duplicateNode(activeId)} title="Dupliquer">
        <CopyPlus size={12} />
      </button>
      <button
        type="button"
        className="v4-section-quickbar__btn v4-section-quickbar__btn--inspect"
        onClick={() => { selectNode(activeId); setRightPanelOpen(true); setActiveId(null); }}
        title="Inspecter"
      >
        Edit
      </button>

      <span className="v4-section-quickbar__sep" aria-hidden />

      <button type="button"
        className="v4-section-quickbar__btn v4-section-quickbar__btn--danger"
        disabled={!canDelete}
        onClick={() => { deleteNode(activeId); setActiveId(null); }}
        title="Supprimer cette section">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
