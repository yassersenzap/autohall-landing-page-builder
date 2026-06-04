import type { HeroBlockProps } from '../types';

export function asPropString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function parseHeroProps(propsJson: Record<string, unknown>): HeroBlockProps {
  return {
    eyebrow: asPropString(propsJson.eyebrow),
    title: asPropString(propsJson.title),
    subtitle: asPropString(propsJson.subtitle),
    buttonText: asPropString(propsJson.buttonText),
    buttonTarget: asPropString(propsJson.buttonTarget) || '#lead-form',
    secondaryButtonText: asPropString(propsJson.secondaryButtonText),
    secondaryButtonTarget: asPropString(propsJson.secondaryButtonTarget) || '#offer',
    imageUrl: asPropString(propsJson.imageUrl),
    alt: asPropString(propsJson.alt) || 'Véhicule Auto Hall',
  };
}
