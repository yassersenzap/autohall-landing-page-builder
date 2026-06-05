import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { InspectorAccordion, InspectorInput, InspectorSection, InspectorTextarea } from './InspectorPrimitives';
import { InspectorListField } from './InspectorListField';

export function BenefitsInspectorFields({ blockId, propsJson }: { blockId: string; propsJson: Record<string, unknown> }) {
  const { patchString, patchList } = useBlockPropsPatch(blockId);
  return (
    <InspectorAccordion defaultValue={['content', 'items']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput label="Titre" value={asPropString(propsJson.heading)} onChange={(e) => patchString('heading', e.target.value)} />
        <InspectorTextarea label="Sous-titre" rows={2} value={asPropString(propsJson.subtitle)} onChange={(e) => patchString('subtitle', e.target.value)} />
      </InspectorSection>
      <InspectorSection value="items" title="Avantages">
        <InspectorListField listKey="items" label="Cartes avantages" columns={[{ key: 'title', label: 'Titre' }, { key: 'description', label: 'Description' }]} propsJson={propsJson} maxItems={6} onListChange={patchList} />
      </InspectorSection>
    </InspectorAccordion>
  );
}
