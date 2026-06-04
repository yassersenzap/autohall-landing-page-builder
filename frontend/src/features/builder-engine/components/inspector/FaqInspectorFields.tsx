import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';
import { InspectorListField } from './InspectorListField';

type FaqInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function FaqInspectorFields({ blockId, propsJson }: FaqInspectorFieldsProps) {
  const { patchString, patchList } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['content', 'items']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre"
          value={asPropString(propsJson.heading)}
          onChange={(e) => patchString('heading', e.target.value)}
        />
        <InspectorTextarea
          label="Introduction"
          rows={2}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>
      <InspectorSection value="items" title="Questions">
        <InspectorListField
          label="Liste FAQ"
          listKey="items"
          columns={[
            {
              key: 'question',
              label: 'Question',
              placeholder: 'Ex : Quelles sont les conditions de l’offre ?',
            },
            { key: 'answer', label: 'Réponse', placeholder: 'Réponse…' },
          ]}
          propsJson={propsJson}
          maxItems={8}
          onListChange={patchList}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
