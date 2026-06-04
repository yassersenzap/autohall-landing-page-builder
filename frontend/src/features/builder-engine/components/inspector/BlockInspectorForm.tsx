import { useBlockPropsJson } from '../../lib/use-block-props-json';
import type { BuilderDocumentBlock } from '../../types';
import { FeaturesInspectorFields } from './FeaturesInspectorFields';
import { FinalCtaInspectorFields } from './FinalCtaInspectorFields';
import { FooterInspectorFields } from './FooterInspectorFields';
import { FormInspectorFields } from './FormInspectorFields';
import { HeroInspectorFields } from './HeroInspectorFields';
import { TrustInspectorFields } from './TrustInspectorFields';

type BlockInspectorFormProps = {
  block: BuilderDocumentBlock;
};

function UnsupportedBlockInspector({ block }: BlockInspectorFormProps) {
  return (
    <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      Type de bloc « {block.type} » non pris en charge dans le lab.
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
    default:
      return <UnsupportedBlockInspector block={block} />;
  }
}
