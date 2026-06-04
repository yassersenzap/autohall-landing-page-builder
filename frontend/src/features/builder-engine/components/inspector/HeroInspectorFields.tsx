import { ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { asPropString } from '../../lib/block-props';
import { useBuilderDocumentStore } from '../../store/builder-document.store';

type HeroInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function HeroInspectorFields({ blockId, propsJson }: HeroInspectorFieldsProps) {
  const updateBlockProps = useBuilderDocumentStore((s) => s.updateBlockProps);

  function patch(key: string, value: string) {
    updateBlockProps(blockId, { [key]: value });
  }

  return (
    <div className="space-y-4">
      <ShadInput
        label="Titre"
        value={asPropString(propsJson.title)}
        onChange={(e) => patch('title', e.target.value)}
      />
      <ShadTextarea
        label="Sous-titre"
        rows={3}
        value={asPropString(propsJson.subtitle)}
        onChange={(e) => patch('subtitle', e.target.value)}
      />
      <ShadInput
        label="URL de l'image"
        value={asPropString(propsJson.imageUrl)}
        onChange={(e) => patch('imageUrl', e.target.value)}
        hint="URL complète du visuel véhicule"
      />
      <ShadInput
        label="Texte du bouton"
        value={asPropString(propsJson.buttonText)}
        onChange={(e) => patch('buttonText', e.target.value)}
      />
    </div>
  );
}
