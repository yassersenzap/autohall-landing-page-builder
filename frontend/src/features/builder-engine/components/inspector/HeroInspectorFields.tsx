import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { MediaAssetField } from '../media/MediaAssetField';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';
import { BlockDesignLayoutFields } from './BlockDesignLayoutFields';

type HeroInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function HeroInspectorFields({ blockId, propsJson }: HeroInspectorFieldsProps) {
  const { patchString, patchProps } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['content', 'media', 'layout', 'design', 'cta']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Accroche (eyebrow)"
          value={asPropString(propsJson.eyebrow)}
          onChange={(e) => patchString('eyebrow', e.target.value)}
        />
        <InspectorInput
          label="Titre principal"
          value={asPropString(propsJson.title)}
          onChange={(e) => patchString('title', e.target.value)}
        />
        <InspectorTextarea
          label="Sous-titre"
          rows={3}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>

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
          hint="Utilisé si aucun média uploadé"
        />
        <InspectorInput
          label="Texte alternatif"
          value={asPropString(propsJson.alt)}
          onChange={(e) => patchString('alt', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="layout" title="Mise en page">
        <BlockDesignLayoutFields blockId={blockId} propsJson={propsJson} />
      </InspectorSection>

      <InspectorSection value="design" title="Design">
        <p className="text-xs text-muted-foreground">
          Thème de fond et alignement via la section Mise en page. Couleurs globales
          dans Réglages page.
        </p>
      </InspectorSection>

      <InspectorSection value="cta" title="Appels à l’action">
        <InspectorInput
          label="Bouton principal"
          value={asPropString(propsJson.buttonText)}
          onChange={(e) => patchString('buttonText', e.target.value)}
        />
        <InspectorInput
          label="Lien bouton principal"
          value={asPropString(propsJson.buttonTarget)}
          onChange={(e) => patchString('buttonTarget', e.target.value)}
          hint="Ex. #lead-form"
        />
        <InspectorInput
          label="Bouton secondaire"
          value={asPropString(propsJson.secondaryButtonText)}
          onChange={(e) => patchString('secondaryButtonText', e.target.value)}
        />
        <InspectorInput
          label="Lien bouton secondaire"
          value={asPropString(propsJson.secondaryButtonTarget)}
          onChange={(e) => patchString('secondaryButtonTarget', e.target.value)}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
