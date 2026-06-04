import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';

type TextInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function TextInspectorFields({ blockId, propsJson }: TextInspectorFieldsProps) {
  const { patchString } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['content']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre de section"
          value={asPropString(propsJson.heading)}
          onChange={(e) => patchString('heading', e.target.value)}
          placeholder="Ex : Une expérience en concession"
        />
        <InspectorTextarea
          label="Texte (saut de ligne = paragraphe)"
          rows={6}
          value={asPropString(propsJson.content)}
          onChange={(e) => patchString('content', e.target.value)}
          placeholder="Rédigez votre paragraphe ici…"
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
