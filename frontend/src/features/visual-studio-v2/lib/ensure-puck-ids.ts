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

function walkNode(
  node: PuckNode,
  counter: { value: number },
  seenIds: Set<string>,
): void {
  const existingId =
    typeof node.props.id === 'string' && node.props.id.trim()
      ? node.props.id.trim()
      : null;

  if (!existingId || seenIds.has(existingId)) {
    let nextId: string;
    do {
      counter.value += 1;
      nextId = `${node.type}-${counter.value}`;
    } while (seenIds.has(nextId));
    node.props.id = nextId;
  }

  seenIds.add(String(node.props.id));

  for (const value of Object.values(node.props)) {
    if (!Array.isArray(value)) continue;
    for (const child of value) {
      if (isPuckNode(child)) {
        walkNode(child, counter, seenIds);
      }
    }
  }
}

/** Garantit un id Puck sur chaque composant (requis pour le rendu canvas). */
export function ensurePuckIds(data: Data): Data {
  const clone = JSON.parse(JSON.stringify(data)) as Data;
  const counter = { value: 0 };
  const seenIds = new Set<string>();

  for (const item of clone.content ?? []) {
    if (isPuckNode(item)) {
      walkNode(item, counter, seenIds);
    }
  }

  return clone;
}
