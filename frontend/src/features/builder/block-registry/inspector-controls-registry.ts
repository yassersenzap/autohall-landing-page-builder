import { campaignLeadHeroInspectorControls } from '../blocks/campaign-lead-hero/campaign-lead-hero.inspector-controls';
import { heroVehicleOfferInspectorControls } from '../blocks/hero-vehicle-offer/hero-vehicle-offer.inspector-controls';
import { getBlockTypographyInspectorControls } from '../block-typography/block-typography.inspector-controls';
import { getBlockVisualInspectorControls } from '../block-visual/block-visual.inspector-controls';
import { buildSectionStyleInspectorControls } from '../section-style/section-style.inspector-controls';
import type { InspectorControl, InspectorTab } from './inspector-control.types';

const INSPECTOR_CONTROLS_BY_TYPE = new Map<string, InspectorControl[]>([
  ['hero_vehicle_offer', heroVehicleOfferInspectorControls],
  ['campaign_lead_hero', campaignLeadHeroInspectorControls],
]);

export function getInspectorControlsForBlock(blockType: string): InspectorControl[] {
  const blockControls = INSPECTOR_CONTROLS_BY_TYPE.get(blockType) ?? [];
  const visualControls = getBlockVisualInspectorControls(blockType);
  const typographyControls = getBlockTypographyInspectorControls(blockType);
  const styleControls = buildSectionStyleInspectorControls(blockType);
  return [...blockControls, ...typographyControls, ...visualControls, ...styleControls];
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
