import { useBuilderV4Store } from '../../store/document.store';
import type { BuilderNode, NodeAdvanced, NodeKind, NodeLayout, NodePropsByKind, NodeStyle, NodeVisibility } from '../../types/nodes.types';

export function useInspectorNode(nodeId: string) {
  const node = useBuilderV4Store((s) => s.getNode(nodeId));
  const deviceMode = useBuilderV4Store((s) => s.deviceMode);
  const updateNodeLayout = useBuilderV4Store((s) => s.updateNodeLayout);
  const updateNodeStyle = useBuilderV4Store((s) => s.updateNodeStyle);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const updateNodeVisibility = useBuilderV4Store((s) => s.updateNodeVisibility);
  const updateNodeAdvanced = useBuilderV4Store((s) => s.updateNodeAdvanced);
  const setLeftSidebarTab = useBuilderV4Store((s) => s.setLeftSidebarTab);

  return {
    node,
    deviceMode,
    updateNodeLayout: (layout: Partial<NodeLayout>) => updateNodeLayout(nodeId, layout),
    updateNodeStyle: (style: Partial<NodeStyle>) => updateNodeStyle(nodeId, style),
    updateNodeProps: <K extends NodeKind>(props: Partial<NodePropsByKind[K]>) =>
      updateNodeProps(nodeId, props),
    updateNodeVisibility: (visibility: Partial<NodeVisibility>) =>
      updateNodeVisibility(nodeId, visibility),
    updateNodeAdvanced: (advanced: Partial<NodeAdvanced>) => updateNodeAdvanced(nodeId, advanced),
    setLeftSidebarTab,
  };
}

export function readNumber(value: number | string | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function isStackLike(node: BuilderNode | undefined): boolean {
  return node?.kind === 'stack' || node?.kind === 'frame' || node?.kind === 'card' || node?.kind === 'section';
}
