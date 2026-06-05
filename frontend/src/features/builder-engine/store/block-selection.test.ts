import { describe, expect, it } from 'vitest';
import type { BuilderDocumentBlock } from '../types';
import { sanitizeBlockSelection } from './block-selection';

describe('sanitizeBlockSelection', () => {
  const blocks: BuilderDocumentBlock[] = [
    { id: 'a', type: 'hero', label: 'Hero', sortOrder: 0, propsJson: {} },
  ];

  it('clears orphaned selectedBlockId', () => {
    expect(
      sanitizeBlockSelection(blocks, 'missing', null),
    ).toEqual({ selectedBlockId: null, hoveredBlockId: null });
  });

  it('preserves valid selection', () => {
    expect(
      sanitizeBlockSelection(blocks, 'a', 'a'),
    ).toEqual({ selectedBlockId: 'a', hoveredBlockId: 'a' });
  });
});
