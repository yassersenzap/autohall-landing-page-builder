import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';

type HeroInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function HeroInspectorFields({ blockId, propsJson }: HeroInspectorFieldsProps) {
  const { patchString } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['content', 'media', 'cta']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre"
          value={asPropString(propsJson.title)}
          onChange={(e) => patchString('title', e.target.value)}
        />
        <InspectorTextarea
          label="Sous-titre"
          rows={3}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="media" title="Média">
        <InspectorInput
          label="URL de l'image"
          value={asPropString(propsJson.imageUrl)}
          onChange={(e) => patchString('imageUrl', e.target.value)}
          hint="URL complète du visuel"
        />
      </InspectorSection>

      <InspectorSection value="cta" title="Appel à l'action">
        <InspectorInput
          label="Texte du bouton principal"
          value={asPropString(propsJson.buttonText)}
          onChange={(e) => patchString('buttonText', e.target.value)}
        />
        <InspectorInput
          label="Texte du bouton secondaire"
          value={asPropString(propsJson.secondaryButtonText)}
          onChange={(e) => patchString('secondaryButtonText', e.target.value)}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
