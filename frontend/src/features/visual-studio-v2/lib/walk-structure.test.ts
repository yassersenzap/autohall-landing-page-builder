import { describe, expect, it } from 'vitest';
import type { Data } from '@puckeditor/core';
import { studioV2PuckConfig } from '../puck-config/index';
import { flattenDocumentStructure } from './walk-structure';

describe('flattenDocumentStructure', () => {
  it('flattens nested slot content with readable labels', () => {
    const data: Data = {
      root: { props: { title: 'Test' } },
      content: [
        {
          type: 'Section',
          props: {
            id: 'sec-1',
            items: [
              {
                type: 'HeroAutoHall',
                props: { id: 'hero-1', title: 'Offre SAV' },
              },
            ],
          },
        },
      ],
    };

    const entries = flattenDocumentStructure(data, studioV2PuckConfig);
    expect(entries.some((e) => e.label.includes('Hero — Offre SAV'))).toBe(true);
  });
});
