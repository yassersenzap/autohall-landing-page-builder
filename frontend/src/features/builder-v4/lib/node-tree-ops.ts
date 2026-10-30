import type { BuilderDocument, BuilderNode, NodeKind } from '../types/nodes.types';
import { canReparentCampaignNode } from './campaign-structure';
import { IMAGE_LAYER_NAME } from './hero-layers';
import { createNodeId } from './node-factory';

const CONTAINER_KINDS: NodeKind[] = ['frame', 'stack', 'section', 'card'];

export function isContainerKind(kind: NodeKind): boolean {
  return CONTAINER_KINDS.includes(kind);
}

function canAcceptSubtreeChild(parent: BuilderNode, subtreeRoot: BuilderNode): boolean {
  if (isContainerKind(parent.kind)) return true;
  if (parent.name === IMAGE_LAYER_NAME && subtreeRoot.kind === 'text') return true;
  return false;
}

export function isDescendant(
  nodes: Record<string, BuilderNode>,
  ancestorId: string,
  nodeId: string,
): boolean {
  let current = nodes[nodeId];
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = nodes[current.parentId];
  }
  return false;
}

export function canReparent(
  nodes: Record<string, BuilderNode>,
  nodeId: string,
  newParentId: string,
): boolean {
  if (nodeId === newParentId) return false;
  if (isDescendant(nodes, nodeId, newParentId)) return false;
  const parent = nodes[newParentId];
  if (!parent || !isContainerKind(parent.kind)) return false;
  return true;
}

export function collectSubtreeIds(nodes: Record<string, BuilderNode>, rootId: string): string[] {
  const node = nodes[rootId];
  if (!node) return [];
  const ids = [rootId];
  for (const childId of node.children) {
    ids.push(...collectSubtreeIds(nodes, childId));
  }
  return ids;
}

export function detachNode(
  nodes: Record<string, BuilderNode>,
  nodeId: string,
): Record<string, BuilderNode> {
  const node = nodes[nodeId];
  if (!node?.parentId) return nodes;
  const parent = nodes[node.parentId];
  if (!parent) return nodes;
  return {
    ...nodes,
    [node.parentId]: {
      ...parent,
      children: parent.children.filter((id) => id !== nodeId),
    },
    [nodeId]: { ...node, parentId: null },
  };
}

export function insertChildAt(
  nodes: Record<string, BuilderNode>,
  parentId: string,
  childId: string,
  index: number,
): Record<string, BuilderNode> {
  const parent = nodes[parentId];
  const child = nodes[childId];
  if (!parent || !child) return nodes;

  const children = parent.children.filter((id) => id !== childId);
  const safeIndex = Math.max(0, Math.min(index, children.length));
  children.splice(safeIndex, 0, childId);

  return {
    ...nodes,
    [parentId]: { ...parent, children },
    [childId]: { ...child, parentId },
  };
}

export function moveNodeInDocument(
  document: BuilderDocument,
  nodeId: string,
  newParentId: string,
  index: number,
): BuilderDocument {
  const { nodes, rootId } = document;
  if (nodeId === rootId) return document;

  const node = nodes[nodeId];
  if (!node) return document;

  if (node.parentId === newParentId) {
    const parent = nodes[newParentId];
    if (!parent) return document;
    const oldIndex = parent.children.indexOf(nodeId);
    if (oldIndex < 0 || oldIndex === index) return document;

    const children = [...parent.children];
    children.splice(oldIndex, 1);
    const safeIndex = Math.max(0, Math.min(index, children.length));
    children.splice(safeIndex, 0, nodeId);

    return {
      ...document,
      nodes: {
        ...nodes,
        [newParentId]: { ...parent, children },
      },
    };
  }

  if (!canReparent(nodes, nodeId, newParentId)) return document;
  if (!canReparentCampaignNode(document, nodeId, newParentId)) return document;

  let nextNodes = detachNode(nodes, nodeId);
  nextNodes = insertChildAt(nextNodes, newParentId, nodeId, index);
  return { ...document, nodes: nextNodes };
}

export function reorderSibling(
  document: BuilderDocument,
  activeId: string,
  overId: string,
): BuilderDocument {
  const { nodes } = document;
  const activeNode = nodes[activeId];
  const overNode = nodes[overId];
  if (!activeNode?.parentId || !overNode?.parentId) return document;
  if (activeNode.parentId !== overNode.parentId) return document;

  const parent = nodes[activeNode.parentId];
  const oldIndex = parent.children.indexOf(activeId);
  const newIndex = parent.children.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return document;

  return moveNodeInDocument(document, activeId, activeNode.parentId, newIndex);
}

export type ClipboardPayload = {
  rootId: string;
  nodes: Record<string, BuilderNode>;
};

export function extractSubtree(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): ClipboardPayload | null {
  const root = nodes[rootId];
  if (!root) return null;

  const ids = collectSubtreeIds(nodes, rootId);
  const subtree: Record<string, BuilderNode> = {};
  for (const id of ids) {
    const node = nodes[id];
    if (node) subtree[id] = { ...node };
  }
  return { rootId, nodes: subtree };
}

export function cloneSubtreeWithNewIds(
  payload: ClipboardPayload,
  nameSuffix = ' copy',
): ClipboardPayload {
  const idMap = new Map<string, string>();

  function mapId(oldId: string): string {
    const existing = idMap.get(oldId);
    if (existing) return existing;
    const kind = payload.nodes[oldId]?.kind ?? 'frame';
    const newId = createNodeId(kind);
    idMap.set(oldId, newId);
    return newId;
  }

  const clonedNodes: Record<string, BuilderNode> = {};
  for (const oldId of collectSubtreeIds(payload.nodes, payload.rootId)) {
    const original = payload.nodes[oldId];
    if (!original) continue;
    const newId = mapId(oldId);
    clonedNodes[newId] = {
      ...original,
      id: newId,
      parentId: original.parentId ? mapId(original.parentId) : null,
      children: original.children.map((childId) => mapId(childId)),
      name: oldId === payload.rootId ? `${original.name}${nameSuffix}` : original.name,
    };
  }

  return { rootId: mapId(payload.rootId), nodes: clonedNodes };
}

export function mergeNodes(
  base: Record<string, BuilderNode>,
  incoming: Record<string, BuilderNode>,
): Record<string, BuilderNode> {
  return { ...base, ...incoming };
}

export function deleteNodeFromDocument(document: BuilderDocument, nodeId: string): BuilderDocument {
  const { nodes, rootId } = document;
  if (nodeId === rootId) return document;

  const idsToRemove = new Set(collectSubtreeIds(nodes, nodeId));
  let nextNodes = detachNode(nodes, nodeId);
  nextNodes = Object.fromEntries(
    Object.entries(nextNodes).filter(([id]) => !idsToRemove.has(id)),
  ) as Record<string, BuilderNode>;

  return { ...document, nodes: nextNodes };
}

export function insertSubtree(
  document: BuilderDocument,
  payload: ClipboardPayload,
  parentId: string,
  index: number,
): BuilderDocument {
  const { nodes } = document;
  const parent = nodes[parentId];
  const subtreeRoot = payload.nodes[payload.rootId];
  if (!parent || !subtreeRoot || !canAcceptSubtreeChild(parent, subtreeRoot)) return document;
  if (nodes[payload.rootId] && !canReparent(nodes, payload.rootId, parentId)) return document;

  let nextNodes = mergeNodes(nodes, payload.nodes);
  nextNodes = insertChildAt(nextNodes, parentId, payload.rootId, index);
  return { ...document, nodes: nextNodes };
}

export function resolveDropTarget(
  document: BuilderDocument,
  activeId: string,
  overId: string,
): { parentId: string; index: number } | null {
  const { nodes } = document;
  const activeNode = nodes[activeId];
  const overNode = nodes[overId];
  if (!activeNode || !overNode || activeId === overId) return null;
  if (activeId === document.rootId) return null;
  if (isDescendant(nodes, activeId, overId)) return null;

  if (activeNode.parentId === overNode.parentId && overNode.parentId) {
    const parent = nodes[overNode.parentId];
    const index = parent.children.indexOf(overId);
    if (index >= 0) return { parentId: overNode.parentId, index };
  }

  if (isContainerKind(overNode.kind)) {
    return { parentId: overId, index: overNode.children.length };
  }

  if (overNode.parentId) {
    const parent = nodes[overNode.parentId];
    const index = parent.children.indexOf(overId) + 1;
    return { parentId: overNode.parentId, index };
  }

  return null;
}
