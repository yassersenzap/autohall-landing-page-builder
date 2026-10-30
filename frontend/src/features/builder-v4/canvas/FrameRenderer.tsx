import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useBuilderV4Store } from '../store/document.store';
import { useAssetsStore } from '../store/assets.store';
import { resolveHeroAspectRatio } from '../lib/geometry/hero-media-aspect';
import { useEditingStore } from '../store/editing.store';
import {
  getCanvasNodeCapabilities,
  isCanvasMoveable,
  isCanvasSelectable,
} from '../lib/canvas-node-capabilities';
import { resolveCanvasClickSelection } from '../lib/canvas-selection';
import { resolveCanvasInspectorTab } from '../lib/hero-block-lifecycle';
import { getLayerDisplayName } from '../lib/layer-display';
import { HERO_BLOCK_NAME } from '../lib/hero-block';
import { isFlowLayoutChild } from '../lib/layout-flow';
import { resolveShellStyles } from '../lib/resolve-shell-layout';
import { getNodeGeometryRole, isBoundsZoneNode } from '../lib/geometry/geometry-roles';
import {
  isHeroContentElement,
  isHeroFormBlock,
  resolveHeroFormEditorState,
  resolveHeroFormProductState,
} from '../lib/studio-compat.js';
import { findImageLayer } from '../lib/hero-layers';
import { HeroFormBuildingBadge } from './nodes/HeroFormBuildingBadge';
import { resolveNodeForDevice } from './resolve-node-style';
import {
  ButtonNodeView,
  CardNodeView,
  ContainerNodeView,
  FormNodeView,
  HeroMarketingExtras,
  ImageNodeView,
  TextNodeView,
} from './nodes/NodeViews';
import { ProBlockView, isProBlockSection } from './blocks/ProBlockView';
import { isContainerKind } from '../types/nodes.types';
import type { BuilderNode } from '../types/nodes.types';
import { cn } from '@/lib/utils';

type FrameRendererProps = {
  nodeId: string;
  editorMode?: boolean;
};

function isMarketingNode(nodeName: string): boolean {
  return [
    'HeroContentGroup',
    'HeroBadge',
    'HeroTitle',
    'HeroSubtitle',
    'HeroCta',
    'HeroText',
  ].includes(nodeName);
}

export function FrameRenderer({ nodeId, editorMode = true }: FrameRendererProps) {
  const rawNode = useBuilderV4Store((s) => s.document.nodes[nodeId]);
  const deviceMode = useBuilderV4Store((s) => s.deviceMode);
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const selectedNodeId = useBuilderV4Store((s) => s.selectedNodeId);
  const hoveredNodeId = useBuilderV4Store((s) => s.hoveredNodeId);
  const hoverNode = useBuilderV4Store((s) => s.hoverNode);
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);
  const setInspectorFocusTab = useBuilderV4Store((s) => s.setInspectorFocusTab);
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const document = useBuilderV4Store((s) => s.document);
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  const getAsset = useAssetsStore((s) => s.getAsset);
  const parentId = rawNode?.parentId ?? null;
  const parentNode = useBuilderV4Store((s) =>
    parentId ? s.document.nodes[parentId] : undefined,
  );
  const isAnyEditing = useEditingStore((s) => s.isAnyEditing);

  const imageLayer = useBuilderV4Store((s) => findImageLayer(s.document.nodes, s.document.rootId));

  if (!rawNode) return null;

  const node = resolveNodeForDevice(rawNode, deviceMode);
  if (node.visibility.hidden) return null;

  const hasImageSrc = Boolean((imageLayer?.props as { src?: string })?.src?.trim());
  const showMarketingContent = (imageLayer?.props as { showMarketingContent?: boolean })?.showMarketingContent ?? !hasImageSrc;

  if (isMarketingNode(node.name) && !showMarketingContent) {
    return null;
  }

  const isPrimarySelected = !previewMode && selectedNodeId === node.id;
  const isSelected = isPrimarySelected;
  const interactive = editorMode && !previewMode && !node.visibility.locked;
  const isContentShell =
    node.name === 'HeroContentGroup' || node.name === 'ContentLayer' || node.name === 'HeroSafeArea';
  const showChildSelection = isSelected && interactive && !isContentShell;
  const showNodeBadge = false;
  const isHovered = !previewMode && hoveredNodeId === node.id;

  const shellStyle = resolveShellStyles(node, parentNode ?? null, rootId);
  const advancedClass = node.advanced?.customClass?.trim() ?? '';
  const geometryRole = getNodeGeometryRole(node, nodes);
  const boundsZone = isBoundsZoneNode(node, nodes);

  const shellClass = cn(
    'v4-node-shell',
    `v4-node-shell--${node.kind}`,
    isPrimarySelected && !isContentShell && 'v4-node-shell--selected',
    isHovered && !isSelected && 'v4-node-shell--hovered',
    node.visibility.locked && 'v4-node-shell--locked',
  );

  function handleClick(e: React.MouseEvent) {
    if (!interactive || isAnyEditing()) return;
    if (e.detail > 1) return;
    e.stopPropagation();
    const focusTab = resolveCanvasInspectorTab(e.target);
    if (focusTab) setInspectorFocusTab(focusTab);
    const selectionId = resolveCanvasClickSelection(node, nodes, e.target);
    const canSelect = interactive && isCanvasSelectable(node, rootId, nodes);
    if (canSelect || selectionId !== node.id) {
      selectNode(selectionId);
      setRightPanelOpen(true);
    }
  }

  function handleMouseEnter(e: React.MouseEvent) {
    if (!interactive) return;
    e.stopPropagation();
    hoverNode(resolveCanvasClickSelection(node, nodes, e.target));
  }

  function handleMouseLeave() {
    if (!interactive) return;
    hoverNode(null);
  }

  function handleDoubleClick(e: React.MouseEvent) {
    if (!interactive) return;
    const editable = (e.target as HTMLElement).closest('[data-v4-editable="true"]');
    if (editable) {
      e.stopPropagation();
    }
  }

  const childElements = node.children.map((childId) => (
    <FrameRenderer key={childId} nodeId={childId} editorMode={editorMode} />
  ));

  const selectable =
    interactive &&
    (node.name === HERO_BLOCK_NAME || isCanvasSelectable(node, rootId, nodes) || isHeroContentElement(node)) &&
    !isContentShell;
  const caps = getCanvasNodeCapabilities(node, rootId, nodes);
  const resizable = interactive && caps.canResize;
  const draggable = interactive && caps.canDrag;
  const moveable = interactive && isCanvasMoveable(node, rootId, nodes);
  const inFlow = isFlowLayoutChild(node, parentNode ?? null);
  const heroFormProductState = isHeroFormBlock(node)
    ? resolveHeroFormProductState(document, getAsset, previewMode)
    : undefined;
  const showBuildingBadge =
    interactive
    && isHeroFormBlock(node)
    && resolveHeroFormEditorState(document, getAsset) === 'building';

  // For ProBlock sections, the node's layout.height from the store would override
  // the block's own internal height (e.g. 85vh). We neutralize it here so the
  // ProBlock's <section> CSS takes full control.
  const isProBlock = node.kind === 'section' && isProBlockSection(node);
  const effectiveShellStyle: CSSProperties = isProBlock
    ? { ...shellStyle, height: 'auto', minHeight: 0 }
    : shellStyle;

  return (
    <div
      className={cn(shellClass, advancedClass || undefined)}
      style={effectiveShellStyle}
      data-v4-kind={node.kind}
      data-v4-name={node.name}
      data-v4-node-id={node.id}
      data-hero-form-state={heroFormProductState}
      data-v4-selectable={selectable ? 'true' : undefined}
      data-v4-moveable={moveable ? 'true' : undefined}
      data-v4-draggable={draggable ? 'true' : undefined}
      data-v4-resizable={resizable ? 'true' : undefined}
      data-v4-flow={inFlow ? 'flow' : undefined}
      data-v4-geometry-role={geometryRole ?? undefined}
      data-v4-bounds-zone={boundsZone ? 'true' : undefined}
      data-v4-selected={showChildSelection || (isSelected && !isContentShell) ? 'true' : undefined}
      data-testid={`canvas-node-${node.name}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={interactive ? -1 : undefined}
    >
      {renderNodeContent(node, childElements, editorMode, rootId)}
      {showBuildingBadge ? <HeroFormBuildingBadge /> : null}
      {showNodeBadge ? (
        <span className="v4-node-badge" aria-hidden>
          {getLayerDisplayName(node, nodes)}
        </span>
      ) : null}
    </div>
  );

}

function renderNodeContent(node: BuilderNode, children: React.ReactNode, editorMode: boolean, rootId: string): React.ReactNode {
  switch (node.kind) {
    case 'text':
      return <TextNodeView node={node as BuilderNode<'text'>} editorMode={editorMode} />;
    case 'image':
      return (
        <>
          <ImageNodeView node={node as BuilderNode<'image'>} editorMode={editorMode} />
          {children}
        </>
      );
    case 'button':
      return <ButtonNodeView node={node as BuilderNode<'button'>} editorMode={editorMode} />;
    case 'form':
      return <FormNodeView node={node as BuilderNode<'form'>} editorMode={editorMode} />;
    case 'card':
      return <CardNodeView node={node as BuilderNode<'card'>}>{children}</CardNodeView>;
    case 'section':
      // Pro-block sections render from their props schema — no node tree needed
      if (isProBlockSection(node)) {
        return <ProBlockView node={node} editorMode={editorMode} />;
      }
      if (isContainerKind(node.kind)) {
        return <ContainerNodeView node={node}>{children}</ContainerNodeView>;
      }
      return children;
    case 'frame':
    case 'stack':
      if (isContainerKind(node.kind)) {
        return (
          <>
            <ContainerNodeView node={node}>{children}</ContainerNodeView>
            {node.name === 'HeroContentGroup' ? <HeroMarketingExtras rootId={rootId} /> : null}
          </>
        );
      }
      return children;
    default:
      return children;
  }
}

export function FrameDocumentRenderer({ editorMode = true }: { editorMode?: boolean }) {
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  const templateId = useBuilderV4Store((s) => s.document.meta.templateId);
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const getAsset = useAssetsStore((s) => s.getAsset);

  const documentStyle = useMemo((): CSSProperties | undefined => {
    if (templateId !== 'campaign-hero-form') return undefined;
    return {
      ['--v4-hero-aspect-ratio' as string]: resolveHeroAspectRatio(nodes, getAsset),
    };
  }, [getAsset, nodes, templateId]);

  return (
    <div
      className={[
        'v4-document-root',
        templateId === 'campaign-hero-form' ? 'v4-document-root--autohall-campaign' : '',
        templateId === 'blank' ? 'v4-document-root--blank' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-template={templateId}
      style={documentStyle}
    >
      <FrameRenderer nodeId={rootId} editorMode={editorMode} />
    </div>
  );
}
