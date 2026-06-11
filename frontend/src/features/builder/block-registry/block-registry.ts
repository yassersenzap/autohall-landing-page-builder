import type { BlockDefinition } from './block-definition.types';
import { campaignLeadHeroDefinition } from '../blocks/campaign-lead-hero';
import { heroVehicleOfferDefinition } from '../blocks/hero-vehicle-offer';

const FOUNDATION_DEFINITIONS: BlockDefinition[] = [
  heroVehicleOfferDefinition,
  campaignLeadHeroDefinition,
];

const REGISTRY = new Map<string, BlockDefinition>(
  FOUNDATION_DEFINITIONS.map((definition) => [definition.type, definition]),
);

export function registerBlockDefinition(definition: BlockDefinition): void {
  REGISTRY.set(definition.type, definition);
}

export function getPremiumBlockDefinition(type: string): BlockDefinition | undefined {
  return REGISTRY.get(type);
}

export function getAllPremiumBlockDefinitions(): BlockDefinition[] {
  return [...REGISTRY.values()];
}

export function hasPremiumBlockDefinition(type: string): boolean {
  return REGISTRY.has(type);
}

export function getPremiumBlocksByCategory(
  category: BlockDefinition['category'],
): BlockDefinition[] {
  return getAllPremiumBlockDefinitions().filter((d) => d.category === category);
}
