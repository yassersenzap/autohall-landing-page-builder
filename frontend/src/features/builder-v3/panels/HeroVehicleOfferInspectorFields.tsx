import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import type { InspectorTab } from '@/features/builder/block-registry/inspector-control.types';
import { DefinitionDrivenBlockInspector } from './inspector/DefinitionDrivenBlockInspector';

type HeroVehicleOfferInspectorFieldsProps = {
  block: BuilderDocumentBlock;
  patch: (p: Record<string, unknown>) => void;
  /** When omitted, renders all tabs content via parent tab routing. */
  tab?: InspectorTab;
};

/** Thin wrapper — fields are driven by hero-vehicle-offer.inspector-controls.ts */
export function HeroVehicleOfferInspectorFields({
  block,
  patch,
  tab = 'content',
}: HeroVehicleOfferInspectorFieldsProps) {
  return <DefinitionDrivenBlockInspector block={block} tab={tab} onPatch={patch} />;
}

export function isHeroVehicleOfferBlock(type: string): boolean {
  return type === 'hero_vehicle_offer';
}
