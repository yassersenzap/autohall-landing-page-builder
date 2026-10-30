import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  PanelTop,
  PanelBottom,
  SlidersHorizontal,
  LayoutGrid,
  Image,
  Sparkles,
  FormInput,
  Type,
  Layers,
  Box,
} from 'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useRef, useState } from 'react';
import { LayerContextMenu, type LayerContextMenuState } from './LayerContextMenu';
import { useBuilderV4Store } from '../../store/document.store';
import { isLayerDragEnabled } from '../../lib/campaign-structure';
import { isHeroFormBlock } from '../../lib/studio-compat.js';
import type { BuilderNode } from '../../types/nodes.types';
import { resolveBusinessLayerSelection } from '../../lib/layer-selection';
import {
  getLayerDisplayName,
  resolveLayerEntryId,
  resolveLayerTreeEntries,
} from '../../lib/layer-display';
import { cn } from '@/lib/utils';

function getLayerIcon(node: BuilderNode) {
  const bt = (node.props as any)?.blockType;
  if (bt === 'brand-navbar' || node.name === 'BrandNavbar' || node.name === 'brand-navbar') return PanelTop;
  if (bt === 'multi-step-test-drive' || node.name === 'MultiStepTestDrive' || node.name === 'multi-step-test-drive') return SlidersHorizontal;
  if (bt === 'footer-block' || node.name === 'Footer' || node.name === 'footer-block') return PanelBottom;
  if (bt === 'specs-grid' || node.name === 'specs-grid') return LayoutGrid;
  if (bt === 'model-showcase-gallery' || bt === 'immersive-gallery' || node.kind === 'image' || node.name === 'ImageLayer') return Image;
  if (isHeroFormBlock(node) || bt?.startsWith('hero-')) return Sparkles;
  if (node.kind === 'form' || node.name === 'FormLayer') return FormInput;
  if (node.kind === 'text') return Type;
  if (node.kind === 'section') return Layers;
  return Box;
}

type LayerRowContentProps = {
  node: BuilderNode;
  depth: number;
  hasChildren: boolean;
  collapsed: boolean;
  isRoot?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  labelOverride?: string;
  selectionId?: string;
};

function LayerRowContent({
  node,
  depth,
  hasChildren,
  collapsed,
  isRoot = false,
  dragHandleProps,
  isDragging = false,
  labelOverride,
  selectionId,
}: LayerRowContentProps) {
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const isNodeSelected = useBuilderV4Store((s) => s.isNodeSelected);
  const toggleLayerCollapsed = useBuilderV4Store((s) => s.toggleLayerCollapsed);
  const renamingNodeId = useBuilderV4Store((s) => s.renamingNodeId);
  const setRenamingNodeId = useBuilderV4Store((s) => s.setRenamingNodeId);
  const updateNodeName = useBuilderV4Store((s) => s.updateNodeName);
  const setInspectorFocusTab = useBuilderV4Store((s) => s.setInspectorFocusTab);
  const [contextMenu, setContextMenu] = useState<LayerContextMenuState>(null);

  const resolvedSelectionId = selectionId ?? node.id;
  const isSelected = isNodeSelected(resolvedSelectionId) || isNodeSelected(node.id);
  const isRenaming = renamingNodeId === node.id;
  const inputRef = useRef<HTMLInputElement>(null);
  const displayName = labelOverride ?? getLayerDisplayName(node, nodes);
  const LayerIcon = getLayerIcon(node);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  function commitRename(value: string) {
    const trimmed = value.trim();
    if (trimmed && trimmed !== node.name) {
      updateNodeName(node.id, trimmed);
    } else {
      setRenamingNodeId(null);
    }
  }

  return (
    <>
      <div
        className={cn('v4-layers-tree__row-inner', isDragging && 'v4-layers-tree__row-inner--dragging')}
        style={{ paddingLeft: depth * 12 }}
        data-testid={`layer-row-${node.name}`}
        data-node-id={node.id}
        data-depth={depth}
        onContextMenu={(event) => {
          if (isRoot) return;
          event.preventDefault();
          selectNode(resolveBusinessLayerSelection(node, nodes));
          setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
        }}
      >
      {hasChildren ? (
        <button
          type="button"
          className="v4-layers-tree__toggle"
          onClick={() => toggleLayerCollapsed(node.id)}
          aria-label={collapsed ? 'Déplier' : 'Replier'}
          data-testid={`layer-toggle-${node.name}`}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>
      ) : (
        <span className="v4-layers-tree__toggle-spacer" />
      )}

      {!isRoot && dragHandleProps ? (
        <button
          type="button"
          className="v4-layers-tree__handle"
          aria-label={`Déplacer ${displayName}`}
          data-testid={`layer-drag-${node.name}`}
          {...dragHandleProps}
        >
          <GripVertical size={12} />
        </button>
      ) : (
        <span className="v4-layers-tree__toggle-spacer" />
      )}

      {isRenaming ? (
        <input
          ref={inputRef}
          className="v4-layers-tree__rename"
          defaultValue={node.name}
          data-testid={`layer-rename-${node.name}`}
          onBlur={(event) => commitRename(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitRename(event.currentTarget.value);
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              setRenamingNodeId(null);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={cn('v4-layers-tree__item flex-1 flex items-center gap-1.5 min-w-0', isSelected && 'v4-layers-tree__item--selected')}
          onClick={() => {
            const id = resolveBusinessLayerSelection(
              nodes[resolvedSelectionId] ?? node,
              nodes,
            );
            selectNode(id);
            setRightPanelOpen(true);
            if (isHeroFormBlock(node)) setInspectorFocusTab('hero');
            if (node.name === 'FormLayer') setInspectorFocusTab('form');
            if (node.name === 'ImageLayer') setInspectorFocusTab('image');
            if (node.name === 'ContentLayer') setInspectorFocusTab('content');
          }}
          onDoubleClick={() => {
            if (!isHeroFormBlock(node)) setRenamingNodeId(node.id);
          }}
          data-testid={`layer-select-${node.name}`}
        >
          <LayerIcon size={12} className="shrink-0 text-zinc-400" />
          <span className="truncate">{displayName}</span>
        </button>
      )}
      </div>
      <LayerContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    </>
  );
}

function ContentTabLayerRow({
  heroBlockId,
  depth,
}: {
  heroBlockId: string;
  depth: number;
}) {
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const setInspectorFocusTab = useBuilderV4Store((s) => s.setInspectorFocusTab);
  const inspectorActiveTab = useBuilderV4Store((s) => s.inspectorActiveTab);
  const selectedNodeId = useBuilderV4Store((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === heroBlockId && inspectorActiveTab === 'content';

  return (
    <li className="v4-layers-tree__row" role="treeitem">
      <div
        className="v4-layers-tree__row-inner"
        style={{ paddingLeft: depth * 12 }}
        data-testid="layer-row-content-tab"
      >
        <span className="v4-layers-tree__toggle-spacer" />
        <span className="v4-layers-tree__toggle-spacer" />
        <button
          type="button"
          className={cn('v4-layers-tree__item flex-1', isSelected && 'v4-layers-tree__item--selected')}
          onClick={() => {
            selectNode(heroBlockId);
            setInspectorFocusTab('content');
          }}
        >
          <span className="truncate">Contenu</span>
        </button>
      </div>
    </li>
  );
}

export function SortableLayerBranch({
  nodeId,
  depth,
}: {
  nodeId: string;
  depth: number;
}) {
  const getNode = useBuilderV4Store((s) => s.getNode);
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const layersCollapsed = useBuilderV4Store((s) => s.layersCollapsed);
  const documentRootId = useBuilderV4Store((s) => s.document.rootId);
  const document = useBuilderV4Store((s) => s.document);

  const node = getNode(nodeId);
  if (!node) return null;

  const isRoot = nodeId === documentRootId;
  const treeEntries = resolveLayerTreeEntries(node, nodes, documentRootId);
  const nodeEntries = treeEntries.filter((entry): entry is { type: 'node'; node: BuilderNode } => entry.type === 'node');
  const collapsed = layersCollapsed[nodeId] ?? false;
  const hasChildren = treeEntries.length > 0;
  const dragEnabled = isLayerDragEnabled(document, node);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled: isRoot || !dragEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className="v4-layers-tree__row" role="treeitem" aria-expanded={hasChildren ? !collapsed : undefined}>
      <LayerRowContent
        node={node}
        depth={depth}
        hasChildren={hasChildren}
        collapsed={collapsed}
        isRoot={isRoot}
        isDragging={isDragging}
        dragHandleProps={isRoot || !dragEnabled ? undefined : { ...attributes, ...listeners }}
      />
      {hasChildren && !collapsed ? (
        <SortableContext
          items={nodeEntries.map((entry) => entry.node.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="v4-layers-tree__children" role="group" aria-label={`Enfants de ${getLayerDisplayName(node, nodes)}`}>
            {treeEntries.map((entry) => {
              if (entry.type === 'content-tab') {
                return (
                  <ContentTabLayerRow
                    key={resolveLayerEntryId(entry)}
                    heroBlockId={entry.heroBlockId}
                    depth={depth + 1}
                  />
                );
              }
              return (
                <SortableLayerBranch
                  key={resolveLayerEntryId(entry)}
                  nodeId={entry.node.id}
                  depth={depth + 1}
                />
              );
            })}
          </ul>
        </SortableContext>
      ) : null}
    </li>
  );
}

export function LayerRowOverlay({ node }: { node: BuilderNode }) {
  return (
    <div className="v4-layers-tree__overlay">
      <span>{getLayerDisplayName(node)}</span>
    </div>
  );
}
