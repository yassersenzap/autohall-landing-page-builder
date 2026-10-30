import type { NodeLayout } from '../../types/nodes.types';
import { HERO_CONTENT_MAX_WIDTH } from '../../types/geometry.types';

export type ContentVerticalAlign = 'top' | 'center' | 'bottom';
export type ContentHorizontalAlign = 'left' | 'center' | 'right';

export type ContentLayerAlign = {
  vertical: ContentVerticalAlign;
  horizontal: ContentHorizontalAlign;
  offsetX?: number;
  offsetY?: number;
  maxWidth?: number;
};

export function flexAlignForContentLayer(align: ContentLayerAlign): Pick<NodeLayout, 'display' | 'align' | 'justify'> {
  const verticalMap: Record<ContentVerticalAlign, NodeLayout['align']> = {
    top: 'start',
    center: 'center',
    bottom: 'end',
  };
  const horizontalMap: Record<ContentHorizontalAlign, NodeLayout['justify']> = {
    left: 'start',
    center: 'center',
    right: 'end',
  };
  return {
    display: 'flex',
    align: verticalMap[align.vertical],
    justify: horizontalMap[align.horizontal],
  };
}

/** ContentLayer — absolute overlay sibling; never nested under image. */
export function layoutForContentLayer(
  align: ContentLayerAlign = { vertical: 'center', horizontal: 'left' },
  padding = 48,
): NodeLayout {
  return {
    ...flexAlignForContentLayer(align),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    padding,
    overflow: 'visible',
    pointerEvents: 'none',
    maxWidth: align.maxWidth ?? HERO_CONTENT_MAX_WIDTH,
    width: 'auto',
    marginLeft: align.offsetX ?? 0,
    marginTop: align.offsetY ?? 0,
  };
}
