import type { NodeLayout } from '../../types/nodes.types';
import type { HeroRootGeometry } from '../../types/geometry.types';
import { DEFAULT_HERO_MIN_HEIGHT } from '../../types/geometry.types';

export function resolveHeroFrameColumns(hero: HeroRootGeometry): string {
  if (hero.layoutMode === 'split') {
    if (hero.formColumnMode === 'fixed' && hero.formColumnWidth) {
      return `1fr ${hero.formColumnWidth}px`;
    }
    return `${hero.leftRatio}fr ${hero.rightRatio}fr`;
  }
  return '1fr';
}

/** HeroBlock grid — sole layout owner (Frame stays neutral flex column). */
export function resolveHeroRootLayout(hero: HeroRootGeometry): Partial<NodeLayout> {
  const minHeight = hero.minHeight ?? DEFAULT_HERO_MIN_HEIGHT;
  const base: Partial<NodeLayout> = {
    display: 'grid',
    rows: 'minmax(0, 1fr)',
    minHeight,
    height: '100%',
    width: '100%',
    align: 'stretch',
    overflow: 'hidden',
    gap: hero.gap,
    padding: hero.padding,
    position: 'relative',
    gridColumn: '1 / -1',
  };

  if (hero.layoutMode === 'split') {
    return {
      ...base,
      columns: resolveHeroFrameColumns(hero),
    };
  }

  return {
    ...base,
    columns: '1fr',
  };
}

export function heroLayoutModeLabel(mode: HeroRootGeometry['layoutMode']): string {
  return mode === 'split' ? 'Split' : 'Floating Card';
}
