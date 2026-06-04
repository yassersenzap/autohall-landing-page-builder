import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { MediaAssetField } from '../media/MediaAssetField';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
} from './InspectorPrimitives';

type ImageInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function ImageInspectorFields({ blockId, propsJson }: ImageInspectorFieldsProps) {
  const { patchString, patchProps } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['media', 'content']}>
      <InspectorSection value="media" title="Média">
        <MediaAssetField
          imageAssetId={asPropString(propsJson.imageAssetId)}
          onPickAsset={(assetId) => {
            patchProps({ imageAssetId: assetId, imageUrl: '' });
          }}
        />
        <InspectorInput
          label="URL externe (optionnel)"
          value={asPropString(propsJson.imageUrl)}
          onChange={(e) => {
            patchString('imageUrl', e.target.value);
            if (e.target.value.trim()) patchString('imageAssetId', '');
          }}
        />
        <InspectorInput
          label="Texte alternatif"
          value={asPropString(propsJson.alt)}
          onChange={(e) => patchString('alt', e.target.value)}
        />
      </InspectorSection>
      <InspectorSection value="content" title="Légende">
        <InspectorInput
          label="Légende sous l’image"
          value={asPropString(propsJson.caption)}
          onChange={(e) => patchString('caption', e.target.value)}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
