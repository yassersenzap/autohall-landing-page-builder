import { useState } from 'react';
import { asObjectList } from '../../lib/list-props';
import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { MediaAssetField } from '../media/MediaAssetField';
import { InspectorAccordion, InspectorInput, InspectorSection, InspectorSelect, InspectorTextarea } from './InspectorPrimitives';
import { InspectorListField } from './InspectorListField';

export function VehicleRangeInspectorFields({
  blockId,
  propsJson,
}: {
  blockId: string;
  propsJson: Record<string, unknown>;
}) {
  const { patchString, patchList } = useBlockPropsPatch(blockId);
  const vehicles = asObjectList(propsJson.vehicles);
  const [mediaRow, setMediaRow] = useState(0);

  function patchVehicleImage(assetId: string) {
    const next = vehicles.map((row, index) =>
      index === mediaRow ? { ...row, imageAssetId: assetId, imageUrl: '' } : row,
    );
    patchList('vehicles', next);
  }

  const rowOptions = vehicles.map((row, index) => ({
    value: String(index),
    label: asPropString(row.name) || `Modèle ${index + 1}`,
  }));

  return (
    <InspectorAccordion defaultValue={['content', 'vehicles', 'media']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre gamme"
          value={asPropString(propsJson.heading)}
          onChange={(e) => patchString('heading', e.target.value)}
        />
        <InspectorTextarea
          label="Sous-titre"
          rows={2}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>
      <InspectorSection value="vehicles" title="Modèles">
        <InspectorListField
          listKey="vehicles"
          label="Véhicules"
          columns={[
            { key: 'name', label: 'Modèle' },
            { key: 'energy', label: 'Énergie' },
            { key: 'tag', label: 'Badge' },
            { key: 'ctaText', label: 'Bouton' },
          ]}
          propsJson={propsJson}
          maxItems={8}
          onListChange={patchList}
        />
      </InspectorSection>
      {vehicles.length > 0 ? (
        <InspectorSection value="media" title="Média">
          <InspectorSelect
            label="Modèle à illustrer"
            value={String(mediaRow)}
            options={rowOptions}
            onChange={(value) => setMediaRow(Number(value))}
          />
          <MediaAssetField
            imageAssetId={asPropString(vehicles[mediaRow]?.imageAssetId)}
            onPickAsset={patchVehicleImage}
          />
          <InspectorInput
            label="Texte alternatif"
            value={asPropString(vehicles[mediaRow]?.alt)}
            onChange={(e) => {
              const next = vehicles.map((row, index) =>
                index === mediaRow ? { ...row, alt: e.target.value } : row,
              );
              patchList('vehicles', next);
            }}
          />
        </InspectorSection>
      ) : null}
    </InspectorAccordion>
  );
}
