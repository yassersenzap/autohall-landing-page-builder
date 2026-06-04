import type { BuilderDocumentBlock } from '../../types';
import { FormInspectorFields } from './FormInspectorFields';
import { HeroInspectorFields } from './HeroInspectorFields';

type BlockInspectorFormProps = {
  block: BuilderDocumentBlock;
};

function UnsupportedBlockInspector({ block }: BlockInspectorFormProps) {
  return (
    <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      Inspecteur avancé disponible pour Hero et Formulaire de contact. « {block.label} » sera
      pris en charge prochainement.
    </p>
  );
}

export function BlockInspectorForm({ block }: BlockInspectorFormProps) {
  const type = block.type.toLowerCase();
  const inspectorKey = `${block.id}:${type}`;

  switch (type) {
    case 'hero':
      return (
        <HeroInspectorFields
          key={inspectorKey}
          blockId={block.id}
          propsJson={block.propsJson}
        />
      );
    case 'lead_form':
      return (
        <FormInspectorFields
          key={inspectorKey}
          blockId={block.id}
          propsJson={block.propsJson}
        />
      );
    default:
      return <UnsupportedBlockInspector block={block} />;
  }
}
