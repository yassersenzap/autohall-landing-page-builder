import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { InspectorAccordion, InspectorSection } from './InspectorPrimitives';
import { InspectorListField } from './InspectorListField';

type TrustInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function TrustInspectorFields({ blockId, propsJson }: TrustInspectorFieldsProps) {
  const { patchList } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['metrics']}>
      <InspectorSection value="metrics" title="Indicateurs">
        <InspectorListField
          label="Métriques de confiance"
          listKey="metrics"
          columns={[
            { key: 'value', label: 'Valeur', placeholder: '4.8/5' },
            { key: 'label', label: 'Libellé', placeholder: 'Satisfaction clients' },
          ]}
          propsJson={propsJson}
          maxItems={4}
          onListChange={patchList}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
