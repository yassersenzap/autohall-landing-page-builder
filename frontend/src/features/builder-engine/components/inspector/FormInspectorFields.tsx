import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';

type FormInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function FormInspectorFields({ blockId, propsJson }: FormInspectorFieldsProps) {
  const { patchString } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['content', 'submit']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre du formulaire"
          value={asPropString(propsJson.title)}
          onChange={(e) => patchString('title', e.target.value)}
        />
        <InspectorTextarea
          label="Texte d'aide"
          rows={3}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="submit" title="Soumission">
        <InspectorInput
          label="Texte du bouton"
          value={asPropString(propsJson.submitText)}
          onChange={(e) => patchString('submitText', e.target.value)}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
