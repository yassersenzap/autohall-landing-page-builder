import { describe, expect, it } from 'vitest';
import { buildDefaultStudioV2Document } from '../default-document';
import { ensurePuckIds } from './ensure-puck-ids';

function collectIds(data: ReturnType<typeof buildDefaultStudioV2Document>): string[] {
  const ids: string[] = [];
  const walk = (node: { type: string; props: Record<string, unknown> }) => {
    if (typeof node.props.id === 'string') {
      ids.push(node.props.id);
    }
    for (const value of Object.values(node.props)) {
      if (!Array.isArray(value)) continue;
      for (const child of value) {
        if (child && typeof child === 'object' && 'type' in child) {
          walk(child as { type: string; props: Record<string, unknown> });
        }
      }
    }
  };

  for (const item of data.content ?? []) {
    walk(item as { type: string; props: Record<string, unknown> });
  }

  return ids;
}

describe('ensurePuckIds', () => {
  it('adds stable ids to every puck node', () => {
    const raw = {
      root: { props: { title: 'Test' } },
      content: [
        {
          type: 'Section',
          props: {
            items: [
              {
                type: 'HeroAutoHall',
                props: { title: 'Hello' },
              },
            ],
          },
        },
      ],
    };

    const withIds = ensurePuckIds(raw);
    const ids = collectIds(withIds);
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('reassigns duplicate puck ids', () => {
    const raw = {
      root: { props: { title: 'Test' } },
      content: [
        {
          type: 'ParagraphBlock',
          props: { id: 'ParagraphBlock-1', text: 'A' },
        },
        {
          type: 'ParagraphBlock',
          props: { id: 'ParagraphBlock-1', text: 'B' },
        },
      ],
    };

    const withIds = ensurePuckIds(raw);
    const ids = collectIds(withIds);
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('default document ships with puck ids', () => {
    const doc = buildDefaultStudioV2Document();
    const ids = collectIds(doc);
    expect(ids.length).toBeGreaterThanOrEqual(5);
  });
});
