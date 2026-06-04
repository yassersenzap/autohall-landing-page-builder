import type { BuilderDocumentBlock } from '../../types';
import { HeroInspectorFields } from './HeroInspectorFields';

type BlockInspectorFormProps = {
  block: BuilderDocumentBlock;
};

export function BlockInspectorForm({ block }: BlockInspectorFormProps) {
  const type = block.type.toLowerCase();

  if (type === 'hero') {
    return <HeroInspectorFields blockId={block.id} propsJson={block.propsJson} />;
  }

  return (
    <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      Inspecteur dynamique disponible pour le bloc Hero. Les champs pour « {block.label} »
      seront ajoutés dans une prochaine itération.
    </p>
  );
}
