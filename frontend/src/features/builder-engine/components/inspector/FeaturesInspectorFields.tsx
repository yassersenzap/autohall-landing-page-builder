import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
} from './InspectorPrimitives';
import { BlockDesignLayoutFields } from './BlockDesignLayoutFields';
import { InspectorListField } from './InspectorListField';

type FeaturesInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function FeaturesInspectorFields({ blockId, propsJson }: FeaturesInspectorFieldsProps) {
  const { patchString, patchList } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['content', 'model', 'design', 'specs']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre de section"
          value={asPropString(propsJson.heading)}
          onChange={(e) => patchString('heading', e.target.value)}
        />
        <InspectorInput
          label="Sous-titre"
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="model" title="Modèle & visuel">
        <InspectorInput
          label="Nom du modèle"
          value={asPropString(propsJson.modelName)}
          onChange={(e) => patchString('modelName', e.target.value)}
        />
        <InspectorInput
          label="Accroche modèle"
          value={asPropString(propsJson.modelTagline)}
          onChange={(e) => patchString('modelTagline', e.target.value)}
        />
        <InspectorInput
          label="URL du visuel"
          value={asPropString(propsJson.imageUrl)}
          onChange={(e) => patchString('imageUrl', e.target.value)}
        />
      </InspectorSection>

      <BlockDesignLayoutFields blockId={blockId} propsJson={propsJson} />

      <InspectorSection value="specs" title="Caractéristiques">
        <InspectorListField
          label="Points clés"
          listKey="items"
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'description', label: 'Description' },
          ]}
          propsJson={propsJson}
          maxItems={6}
          onListChange={patchList}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
