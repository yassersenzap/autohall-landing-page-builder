import { describe, expect, it } from '@jest/globals';
import { buildDefaultStudioV2Document } from './default-document';
import { ensurePuckIds } from './ensure-puck-ids';

describe('ensurePuckIds', () => {
  it('adds ids to nested puck nodes', () => {
    const withIds = ensurePuckIds({
      root: { props: {} },
      content: [
        {
          type: 'Section',
          props: {
            items: [{ type: 'HeroAutoHall', props: { title: 'Hi' } }],
          },
        },
      ],
    });

    const section = (
      withIds.content as Array<{ props: { id?: string; items: unknown[] } }>
    )[0];
    expect(section.props.id).toBeTruthy();
    const hero = section.props.items[0] as { props: { id?: string } };
    expect(hero.props.id).toBeTruthy();
  });

  it('default document includes ids for all components', () => {
    const doc = buildDefaultStudioV2Document();
    const section = (doc.content as Array<{ props: { id?: string } }>)[0];
    expect(section.props.id).toBeTruthy();
  });
});
