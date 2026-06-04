import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';

type FinalCtaInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function FinalCtaInspectorFields({ blockId, propsJson }: FinalCtaInspectorFieldsProps) {
  const { patchString } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['content', 'action']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre"
          value={asPropString(propsJson.title)}
          onChange={(e) => patchString('title', e.target.value)}
        />
        <InspectorTextarea
          label="Sous-titre"
          rows={2}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="action" title="Appel à l'action">
        <InspectorInput
          label="Texte du bouton"
          value={asPropString(propsJson.buttonText)}
          onChange={(e) => patchString('buttonText', e.target.value)}
        />
        <InspectorInput
          label="Lien du bouton"
          value={asPropString(propsJson.buttonTarget)}
          onChange={(e) => patchString('buttonTarget', e.target.value)}
          hint="Ancre ou URL (#lead-form)"
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
