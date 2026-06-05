import type { Data } from '@puckeditor/core';

type PuckNode = {
  type: string;
  props: Record<string, unknown>;
};

function isPuckNode(value: unknown): value is PuckNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as PuckNode).type === 'string' &&
    'props' in value &&
    typeof (value as PuckNode).props === 'object' &&
    (value as PuckNode).props !== null
  );
}

function walkNode(node: PuckNode, counter: { value: number }): void {
  if (!node.props.id || typeof node.props.id !== 'string') {
    counter.value += 1;
    node.props.id = `${node.type}-${counter.value}`;
  }

  for (const value of Object.values(node.props)) {
    if (!Array.isArray(value)) continue;
    for (const child of value) {
      if (isPuckNode(child)) {
        walkNode(child, counter);
      }
    }
  }
}

/** Garantit un id Puck sur chaque composant (requis pour le rendu canvas). */
export function ensurePuckIds(data: Data): Data {
  const clone = JSON.parse(JSON.stringify(data)) as Data;
  const counter = { value: 0 };

  for (const item of clone.content ?? []) {
    if (isPuckNode(item)) {
      walkNode(item, counter);
    }
  }

  return clone;
}
