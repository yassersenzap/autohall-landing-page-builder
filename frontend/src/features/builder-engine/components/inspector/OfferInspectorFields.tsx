import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { MediaAssetField } from '../media/MediaAssetField';
import { InspectorAccordion, InspectorInput, InspectorSection, InspectorTextarea } from './InspectorPrimitives';
import { InspectorListField } from './InspectorListField';

export function OfferInspectorFields({ blockId, propsJson }: { blockId: string; propsJson: Record<string, unknown> }) {
  const { patchString, patchList, patchProps } = useBlockPropsPatch(blockId);
  return (
    <InspectorAccordion defaultValue={['content', 'offer', 'media', 'highlights']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput label="Titre section" value={asPropString(propsJson.heading)} onChange={(e) => patchString('heading', e.target.value)} />
        <InspectorTextarea label="Sous-titre" rows={2} value={asPropString(propsJson.subtitle)} onChange={(e) => patchString('subtitle', e.target.value)} />
      </InspectorSection>
      <InspectorSection value="offer" title="Offre véhicule">
        <InspectorInput label="Nom du modèle" value={asPropString(propsJson.modelName)} onChange={(e) => patchString('modelName', e.target.value)} />
        <InspectorInput label="Accroche" value={asPropString(propsJson.tagline)} onChange={(e) => patchString('tagline', e.target.value)} />
        <InspectorInput label="Libellé prix" value={asPropString(propsJson.priceLabel) || 'À partir de'} onChange={(e) => patchString('priceLabel', e.target.value)} />
        <InspectorInput label="Prix / offre" value={asPropString(propsJson.priceValue)} onChange={(e) => patchString('priceValue', e.target.value)} placeholder="Ex : sur devis" />
        <InspectorInput label="Mensualité (optionnel)" value={asPropString(propsJson.monthlyValue)} onChange={(e) => patchString('monthlyValue', e.target.value)} />
        <InspectorInput label="Bouton CTA" value={asPropString(propsJson.buttonText)} onChange={(e) => patchString('buttonText', e.target.value)} />
        <InspectorInput label="Lien CTA" value={asPropString(propsJson.buttonTarget) || '#lead-form'} onChange={(e) => patchString('buttonTarget', e.target.value)} />
      </InspectorSection>
      <InspectorSection value="media" title="Média">
        <MediaAssetField imageAssetId={asPropString(propsJson.imageAssetId)} onPickAsset={(id) => patchProps({ imageAssetId: id, imageUrl: '' })} />
        <InspectorInput label="Texte alternatif" value={asPropString(propsJson.alt)} onChange={(e) => patchString('alt', e.target.value)} />
      </InspectorSection>
      <InspectorSection value="highlights" title="Points clés">
        <InspectorListField listKey="highlights" label="Avantages" columns={[{ key: 'title', label: 'Titre' }, { key: 'description', label: 'Description' }]} propsJson={propsJson} maxItems={6} onListChange={patchList} />
      </InspectorSection>
    </InspectorAccordion>
  );
}
