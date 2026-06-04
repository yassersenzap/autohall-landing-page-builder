import { useBlockPropsJson } from '../../lib/use-block-props-json';
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
  const propsJson = useBlockPropsJson(block.id);
  const type = block.type.toLowerCase();
  const inspectorKey = `${block.id}:${type}`;
  const common = { key: inspectorKey, blockId: block.id, propsJson };

  switch (type) {
    case 'hero':
      return <HeroInspectorFields {...common} />;
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
    default:
      return <UnsupportedBlockInspector block={block} />;
  }
}
