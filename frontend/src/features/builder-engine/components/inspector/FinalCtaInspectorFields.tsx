import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';
import { BlockStyleInspectorFields } from './BlockStyleInspectorFields';

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
          placeholder="Ex : Prêt à passer à l’action ?"
        />
        <InspectorTextarea
          label="Sous-titre"
          rows={2}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>

      <BlockStyleInspectorFields blockId={blockId} blockType="final_cta" propsJson={propsJson} />

      <InspectorSection value="action" title="Appel à l'action">
        <InspectorInput
          label="Texte du bouton"
          value={asPropString(propsJson.buttonText)}
          onChange={(e) => patchString('buttonText', e.target.value)}
          placeholder="Ex : Demander un essai"
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
