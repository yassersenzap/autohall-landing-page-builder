import Selecto from 'react-selecto';
import type Moveable from 'react-moveable';
import { useEffect, useRef } from 'react';
import { useBuilderV4Store } from '../../store/document.store';
import { useEditingStore } from '../../store/editing.store';
import { resolveBusinessLayerSelection } from '../../lib/layer-selection';
import { resolveSelectionFromDomTarget } from '../../lib/canvas-selection';

type SelectoLayerProps = {
  container: HTMLElement | null;
  moveableRef: React.RefObject<Moveable | null>;
};

export function SelectoLayer({ container, moveableRef }: SelectoLayerProps) {
  const selectNodes = useBuilderV4Store((s) => s.selectNodes);
  const selectoRef = useRef<Selecto>(null);

  useEffect(() => {
    if (!import.meta.env.DEV || !container) return;
    type SelectoHandle = {
      selectTargetsByPoints: (point1: number[], point2: number[]) => void;
    };
    (window as Window & { __V4_SELECTO__?: () => SelectoHandle | null }).__V4_SELECTO__ = () =>
      (selectoRef.current as unknown as SelectoHandle | null) ?? null;
  }, [container]);

  if (!container) return null;

  function resolveSelectionIds(rawIds: string[]): string[] {
    const nodes = useBuilderV4Store.getState().document.nodes;
    return [...new Set(rawIds.map((id) => {
      const node = nodes[id];
      return node ? resolveBusinessLayerSelection(node, nodes) : id;
    }))];
  }

  function finalizeSelection(ids: string[], inputEvent: Event) {
    if (ids.length === 0) {
      const nodes = useBuilderV4Store.getState().document.nodes;
      const resolved = resolveSelectionFromDomTarget(inputEvent.target, nodes);
      if (resolved) {
        selectNodes([resolved]);
      }
      // Deselect only via canvas background (CanvasLayer) — never clear here (race with node onClick).
      return;
    }
    selectNodes(ids);
  }

  return (
    <Selecto
      ref={selectoRef}
      container={container}
      dragContainer={typeof window !== 'undefined' ? window : container}
      selectableTargets={[
        '[data-v4-selectable="true"]',
        '[data-v4-hero-media="true"]',
        '[data-v4-name="HeroBlock"]',
      ]}
      selectByClick
      selectFromInside
      continueSelect={false}
      toggleContinueSelect="shift"
      keyContainer={typeof window !== 'undefined' ? window : undefined}
      hitRate={0}
      ratio={0}
      scrollOptions={{ container, throttleTime: 30 }}
      onSelect={(event) => {
        if (!event.isDragStartEnd) return;
        const ids = resolveSelectionIds(
          event.selected
            .map((element) => element.getAttribute('data-v4-node-id'))
            .filter((id): id is string => Boolean(id)),
        );
        if (ids.length === 0) return;
        selectNodes(ids);
      }}
      onDragStart={(event) => {
        const target = event.inputEvent.target;
        if (!(target instanceof HTMLElement)) return;

        if (useEditingStore.getState().isAnyEditing()) return false;

        if (target.closest('[data-v4-editable="true"]')) return false;

        const moveable = moveableRef.current;
        if (moveable?.isMoveableElement(target)) return false;

        const shell = target.closest('[data-v4-node-id]');
        if (
          shell instanceof HTMLElement &&
          (shell.getAttribute('data-v4-draggable') === 'true' ||
            shell.getAttribute('data-v4-resizable') === 'true') &&
          shell.getAttribute('data-v4-selected') === 'true'
        ) {
          return false;
        }
      }}
      onSelectEnd={(event) => {
        const ids = resolveSelectionIds(
          event.selected
            .map((element) => element.getAttribute('data-v4-node-id'))
            .filter((id): id is string => Boolean(id)),
        );
        const shiftKey =
          event.inputEvent instanceof MouseEvent || event.inputEvent instanceof PointerEvent
            ? event.inputEvent.shiftKey
            : false;

        if (ids.length === 0) {
          if (!event.isDragStartEnd) {
            finalizeSelection([], event.inputEvent);
          }
          return;
        }

        if (shiftKey) {
          const current = useBuilderV4Store.getState().selectedNodeIds;
          selectNodes([...new Set([...current, ...ids])]);
          return;
        }

        selectNodes(ids);
      }}
    />
  );
}
