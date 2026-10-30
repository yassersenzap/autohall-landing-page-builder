import Moveable from 'react-moveable';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBuilderV4Store } from '../../store/document.store';
import {
  CANVAS_SNAP_THRESHOLD,
  getFrameSnapGuides,
  getSnapElements,
  isCanvasDraggable,
  isCanvasMoveable,
  isCanvasResizable,
  readElementBox,
} from '../../lib/canvas-geometry';
import { layoutFromDragBox, layoutFromResizeBox } from '../../lib/canvas-layout-commit';
import {
  computeMoveableBounds,
  clampSize,
} from '../../lib/geometry/constraints-engine';
import { getNodeConstraints } from '../../lib/geometry/geometry-roles';
import { isMoveableEngineEnabled } from '../../lib/engine-node-matrix';
import type { CanvasGuide } from '../../lib/canvas-geometry';

type MoveableLayerProps = {
  container: HTMLElement | null;
  onMoveableReady?: (moveable: Moveable | null) => void;
};

function clearMoveableInlineStyles(element: HTMLElement) {
  element.style.transform = '';
  element.style.width = '';
  element.style.height = '';
}

function parentShellOf(element: HTMLElement): HTMLElement | null {
  return element.parentElement?.closest('[data-v4-node-id]') as HTMLElement | null;
}

export function MoveableLayer({ container, onMoveableReady }: MoveableLayerProps) {
  const selectedNodeIds = useBuilderV4Store((s) => s.selectedNodeIds);
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const updateNodesLayout = useBuilderV4Store((s) => s.updateNodesLayout);
  const setCanvasGuides = useBuilderV4Store((s) => s.setCanvasGuides);

  const moveableRef = useRef<Moveable>(null);
  const [targets, setTargets] = useState<(HTMLElement | SVGElement)[]>([]);
  const engineOn = isMoveableEngineEnabled();

  const moveableIds = useMemo(
    () =>
      selectedNodeIds.filter((id) => {
        const node = nodes[id];
        return node ? isCanvasMoveable(node, rootId, nodes) : false;
      }),
    [selectedNodeIds, nodes, rootId],
  );

  const canDrag = useMemo(
    () => moveableIds.some((id) => isCanvasDraggable(nodes[id]!, rootId, nodes)),
    [moveableIds, nodes, rootId],
  );

  const canResize = useMemo(
    () => moveableIds.some((id) => isCanvasResizable(nodes[id]!, rootId, nodes)),
    [moveableIds, nodes, rootId],
  );

  const primaryTarget = targets[0] as HTMLElement | undefined;
  const primaryNode = primaryTarget
    ? nodes[primaryTarget.getAttribute('data-v4-node-id') ?? '']
    : undefined;

  const moveableBounds = useMemo(() => {
    if (!container || !primaryTarget || !primaryNode) return undefined;
    const constraints = getNodeConstraints(primaryNode, nodes);
    if (!constraints?.boundsParent) return undefined;
    return computeMoveableBounds(container, primaryTarget, constraints.boundsParent) ?? undefined;
  }, [container, primaryTarget, primaryNode]);

  useEffect(() => {
    onMoveableReady?.(engineOn && moveableIds.length > 0 ? moveableRef.current : null);
  }, [onMoveableReady, targets, moveableIds.length, engineOn]);

  useEffect(() => {
    if (!container || !engineOn) {
      setTargets([]);
      return;
    }
    const frame = requestAnimationFrame(() => {
      const nextTargets = moveableIds
        .map((id) => container.querySelector<HTMLElement>(`[data-v4-node-id="${id}"]`))
        .filter((element): element is HTMLElement => Boolean(element));
      setTargets(nextTargets);
    });
    return () => cancelAnimationFrame(frame);
  }, [container, moveableIds, selectedNodeIds, nodes, engineOn]);

  const selectedSet = useMemo(() => new Set(moveableIds), [moveableIds]);
  const snapElements = container ? getSnapElements(container, selectedSet) : [];
  const frameElement = container?.querySelector<HTMLElement>(`[data-v4-node-id="${rootId}"]`) ?? null;
  const frameGuides = getFrameSnapGuides(frameElement);

  if (!engineOn || targets.length === 0) return null;

  return (
    <Moveable
      ref={moveableRef}
      className="v4-moveable"
      target={targets}
      draggable={canDrag}
      resizable={canResize}
      bounds={moveableBounds}
      snappable
      snapThreshold={CANVAS_SNAP_THRESHOLD}
      elementGuidelines={snapElements}
      verticalGuidelines={frameGuides.vertical}
      horizontalGuidelines={frameGuides.horizontal}
      snapDirections={{
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
      }}
      renderDirections={
        canResize ? ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] : []
      }
      edgeDraggable={false}
      rotatable={false}
      origin={false}
      onDrag={({ target, transform }) => {
        if (!canDrag) return;
        (target as HTMLElement).style.transform = transform;
      }}
      onDragEnd={({ target }) => {
        const element = target as HTMLElement;
        const nodeId = element.getAttribute('data-v4-node-id');
        if (!nodeId || !container) return;
        const node = nodes[nodeId];
        if (!node) return;
        const box = readElementBox(element, parentShellOf(element));
        updateNodesLayout({
          [nodeId]: layoutFromDragBox(node, box, rootId, container, nodes),
        });
        clearMoveableInlineStyles(element);
        setCanvasGuides([]);
      }}
      onResize={({ target, width, height, drag }) => {
        if (!canResize || !primaryNode) return;
        const element = target as HTMLElement;
        const constraints = getNodeConstraints(primaryNode, nodes);
        const sized = constraints
          ? clampSize(width, height, constraints)
          : { width, height };
        element.style.width = `${sized.width}px`;
        element.style.height = `${sized.height}px`;
        if (canDrag && drag.transform) element.style.transform = drag.transform;
      }}
      onResizeEnd={({ target, lastEvent }) => {
        if (!lastEvent || !container) return;
        const element = target as HTMLElement;
        const nodeId = element.getAttribute('data-v4-node-id');
        if (!nodeId) return;
        const node = nodes[nodeId];
        if (!node) return;
        updateNodesLayout({
          [nodeId]: layoutFromResizeBox(
            node,
            { left: 0, top: 0, width: lastEvent.width, height: lastEvent.height },
            rootId,
            container,
            nodes,
          ),
        });
        clearMoveableInlineStyles(element);
        setCanvasGuides([]);
      }}
      onSnap={({ guidelines }) => {
        const nextGuides: CanvasGuide[] = [];
        guidelines.forEach((guide, index) => {
          const positions = Array.isArray(guide.pos) ? guide.pos : [guide.pos];
          positions.forEach((position, positionIndex) => {
            nextGuides.push({
              id: `moveable-snap-${index}-${positionIndex}`,
              orientation: guide.direction === 'horizontal' ? 'horizontal' : 'vertical',
              position,
            });
          });
        });
        setCanvasGuides(nextGuides);
      }}
    />
  );
}

export type { MoveableLayerProps };
