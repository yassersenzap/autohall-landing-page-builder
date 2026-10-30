import type { BuilderNode } from '../types/nodes.types';
import { FORM_LAYER_NAME, isFormLayerNode } from './hero-layers';

/** Canvas/Layers select FormLayer shell, never internal field nodes. */
export function resolveFormLayerSelection(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
): string {
  if (isFormLayerNode(node)) return node.id;

  let current: BuilderNode | undefined = node;
  while (current) {
    if (isFormLayerNode(current)) return current.id;
    if (current.name === FORM_LAYER_NAME) return current.id;
    current = current.parentId ? nodes[current.parentId] : undefined;
  }

  return node.id;
}

export function isFormInternalNode(node: BuilderNode): boolean {
  return node.kind === 'form' && node.name !== FORM_LAYER_NAME;
}
