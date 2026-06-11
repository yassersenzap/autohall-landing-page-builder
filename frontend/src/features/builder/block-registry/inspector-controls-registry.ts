import { campaignLeadHeroInspectorControls } from '../blocks/campaign-lead-hero/campaign-lead-hero.inspector-controls';
import { heroVehicleOfferInspectorControls } from '../blocks/hero-vehicle-offer/hero-vehicle-offer.inspector-controls';
import type { InspectorControl, InspectorTab } from './inspector-control.types';

const INSPECTOR_CONTROLS_BY_TYPE = new Map<string, InspectorControl[]>([
  ['hero_vehicle_offer', heroVehicleOfferInspectorControls],
  ['campaign_lead_hero', campaignLeadHeroInspectorControls],
]);

export function getInspectorControlsForBlock(blockType: string): InspectorControl[] {
  return INSPECTOR_CONTROLS_BY_TYPE.get(blockType) ?? [];
}

export function hasDefinitionDrivenInspector(blockType: string): boolean {
  return getInspectorControlsForBlock(blockType).length > 0;
}

export function getInspectorControlsForTab(
  blockType: string,
  tab: InspectorTab,
): InspectorControl[] {
  return getInspectorControlsForBlock(blockType).filter((control) => control.tab === tab);
}
