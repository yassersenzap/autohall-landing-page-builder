import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import type { InspectorTab } from '@/features/builder/block-registry/inspector-control.types';
import { DefinitionDrivenBlockInspector } from './inspector/DefinitionDrivenBlockInspector';

type CampaignLeadHeroInspectorFieldsProps = {
  block: BuilderDocumentBlock;
  patch: (p: Record<string, unknown>) => void;
  tab?: InspectorTab;
};

/** Thin wrapper — fields are driven by campaign-lead-hero.inspector-controls.ts */
export function CampaignLeadHeroInspectorFields({
  block,
  patch,
  tab = 'content',
}: CampaignLeadHeroInspectorFieldsProps) {
  return <DefinitionDrivenBlockInspector block={block} tab={tab} onPatch={patch} />;
}

export function isCampaignLeadHeroBlock(type: string): boolean {
  return type === 'campaign_lead_hero';
}
