import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { InspectorAccordion, InspectorInput, InspectorSection, InspectorTextarea } from './InspectorPrimitives';
import { InspectorListField } from './InspectorListField';

export function VehicleRangeInspectorFields({ blockId, propsJson }: { blockId: string; propsJson: Record<string, unknown> }) {
  const { patchString, patchList } = useBlockPropsPatch(blockId);
  return (
    <InspectorAccordion defaultValue={['content', 'vehicles']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput label="Titre gamme" value={asPropString(propsJson.heading)} onChange={(e) => patchString('heading', e.target.value)} />
        <InspectorTextarea label="Sous-titre" rows={2} value={asPropString(propsJson.subtitle)} onChange={(e) => patchString('subtitle', e.target.value)} />
      </InspectorSection>
      <InspectorSection value="vehicles" title="Modèles">
        <InspectorListField
          listKey="vehicles"
          label="Véhicules"
          columns={[
            { key: 'name', label: 'Modèle' },
            { key: 'energy', label: 'Énergie' },
            { key: 'tag', label: 'Tag' },
            { key: 'ctaText', label: 'Bouton' },
          ]}
          propsJson={propsJson}
          maxItems={8}
          onListChange={patchList}
        />
        <p className="text-[0.65rem] text-muted-foreground">Image par modèle : sélectionnez le bloc puis uploadez via Médias (à venir par ligne).</p>
      </InspectorSection>
    </InspectorAccordion>
  );
}
