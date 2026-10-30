import { describe, expect, it } from 'vitest';
import { isHeroMediaHitTarget, resolveCanvasClickSelection } from './canvas-selection';
import type { BuilderNode } from '../types/nodes.types';

function node(name: string, kind: BuilderNode['kind'] = 'stack', parentId?: string): BuilderNode {
  return {
    id: `${name}-id`,
    kind,
    name,
    parentId: parentId ?? null,
    children: [],
    layout: {},
    style: {},
    props: {} as BuilderNode['props'],
    visibility: {},
    responsive: {},
    advanced: {},
  };
}

describe('canvas-selection P5.8-R1', () => {
  const heroImage = node('ImageLayer', 'image');
  const heroSafeArea = node('ContentLayer', 'stack', heroImage.id);
  const heroGroup = node('HeroContentGroup', 'stack', heroSafeArea.id);
  const title = node('Title', 'text', heroGroup.id);
  const nodes = {
    [heroImage.id]: heroImage,
    [heroSafeArea.id]: heroSafeArea,
    [heroGroup.id]: heroGroup,
    [title.id]: title,
  };

  it('selects HeroImage on media hit', () => {
    const media = document.createElement('div');
    media.setAttribute('data-v4-hero-media', 'true');
    const shell = document.createElement('div');
    shell.setAttribute('data-v4-name', 'ImageLayer');
    shell.setAttribute('data-v4-node-id', heroImage.id);
    shell.appendChild(media);

    expect(isHeroMediaHitTarget(media)).toBe(true);
    expect(resolveCanvasClickSelection(heroImage, nodes, media)).toBe(heroImage.id);
  });

  it('selects section container when clicking editable hero text', () => {
    const overlay = node('HeroText', 'text', heroSafeArea.id);
    const overlayNodes = { ...nodes, [overlay.id]: overlay };
    const editable = document.createElement('span');
    editable.setAttribute('data-v4-editable', 'true');
    const shell = document.createElement('div');
    shell.setAttribute('data-v4-geometry-role', 'hero-overlay-text');
    shell.setAttribute('data-v4-node-id', overlay.id);
    shell.appendChild(editable);
    expect(resolveCanvasClickSelection(overlay, overlayNodes, editable)).toBe(heroSafeArea.id);
  });
});
