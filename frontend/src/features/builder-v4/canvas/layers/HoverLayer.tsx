import { useEffect, useState } from 'react';
import { useBuilderV4Store } from '../../store/document.store';
import { readElementBox } from '../../lib/canvas-geometry';
import { getLayerDisplayName } from '../../lib/layer-display';

type HoverBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  name: string;
};

export function HoverLayer({ container }: { container: HTMLElement | null }) {
  const hoveredNodeId = useBuilderV4Store((s) => s.hoveredNodeId);
  const nodes = useBuilderV4Store((s) => s.document.nodes);
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const [box, setBox] = useState<HoverBox | null>(null);

  useEffect(() => {
    if (!container || !hoveredNodeId || previewMode) {
      setBox(null);
      return;
    }

    const element = container.querySelector<HTMLElement>(`[data-v4-node-id="${hoveredNodeId}"]`);
    if (!element) {
      setBox(null);
      return;
    }

    const measured = readElementBox(element, container);
    const hoveredNode = nodes[hoveredNodeId];
    const name = hoveredNode ? getLayerDisplayName(hoveredNode, nodes) : hoveredNodeId;
    setBox({ ...measured, name });
  }, [container, hoveredNodeId, nodes, previewMode]);

  if (!box) return null;

  return (
    <div
      className="v4-hover-layer"
      data-testid="hover-layer"
      style={{
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
      }}
      aria-hidden
    >
      <span className="v4-hover-layer__label">{box.name}</span>
    </div>
  );
}
