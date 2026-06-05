import { useBlockPropsJson } from '../../lib/use-block-props-json';
import { useBuilderDocumentStore } from '../../store/builder-document.store';
import type { BuilderDocumentBlock } from '../../types';
import { FeaturesInspectorFields } from './FeaturesInspectorFields';
import { FinalCtaInspectorFields } from './FinalCtaInspectorFields';
import { FooterInspectorFields } from './FooterInspectorFields';
import { FormInspectorFields } from './FormInspectorFields';
import { FaqInspectorFields } from './FaqInspectorFields';
import { HeroInspectorFields } from './HeroInspectorFields';
import { ImageInspectorFields } from './ImageInspectorFields';
import { TextInspectorFields } from './TextInspectorFields';
import { TrustInspectorFields } from './TrustInspectorFields';
import { BenefitsInspectorFields } from './BenefitsInspectorFields';
import { OfferInspectorFields } from './OfferInspectorFields';
import { FinancingInspectorFields } from './FinancingInspectorFields';
import { VehicleRangeInspectorFields } from './VehicleRangeInspectorFields';
import { HeroFormCampaignInspectorFields } from './HeroFormCampaignInspectorFields';
import { getRegistryEntry } from '../../registry/block-registry';
import { isBackendSupportedBlockType } from '../../registry/backend-block-types';

type BlockInspectorFormProps = {
  block: BuilderDocumentBlock;
};

function UnsupportedBlockInspector({ block }: BlockInspectorFormProps) {
  const entry = getRegistryEntry(block.type);
  const backendOk = isBackendSupportedBlockType(block.type);
  return (
    <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      {entry?.availability === 'disabled' || !backendOk
        ? `Le bloc « ${entry?.label ?? block.type} » sera disponible prochainement.`
        : `Le bloc « ${block.type} » n’a pas encore d’inspecteur dédié.`}
    </p>
  );
}

export function BlockInspectorForm({ block }: BlockInspectorFormProps) {
  const liveBlock = useBuilderDocumentStore((s) =>
    s.blocks.find((entry) => entry.id === block.id),
  );

  if (!liveBlock) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Cette section n’existe plus dans le document.
      </p>
    );
  }

  const propsJson = useBlockPropsJson(liveBlock.id);
  const type = liveBlock.type.toLowerCase();
  const inspectorKey = `${liveBlock.id}:${type}`;
  const common = { key: inspectorKey, blockId: liveBlock.id, propsJson };

  switch (type) {
    case 'hero':
    case 'hero_campaign':
      return <HeroInspectorFields {...common} />;
    case 'hero_form_campaign':
      return <HeroFormCampaignInspectorFields {...common} />;
    case 'lead_form':
      return <FormInspectorFields {...common} />;
    case 'trust_bar':
      return <TrustInspectorFields {...common} />;
    case 'features':
      return <FeaturesInspectorFields {...common} />;
    case 'final_cta':
      return <FinalCtaInspectorFields {...common} />;
    case 'footer_legal':
      return <FooterInspectorFields {...common} />;
    case 'text':
      return <TextInspectorFields {...common} />;
    case 'image':
      return <ImageInspectorFields {...common} />;
    case 'faq':
      return <FaqInspectorFields {...common} />;
    case 'benefits':
      return <BenefitsInspectorFields {...common} />;
    case 'offer_highlights':
    case 'vehicle_offer':
      return <OfferInspectorFields {...common} />;
    case 'financing':
      return <FinancingInspectorFields {...common} />;
    case 'vehicle_range':
      return <VehicleRangeInspectorFields {...common} />;
    default:
      return <UnsupportedBlockInspector block={block} />;
  }
}
