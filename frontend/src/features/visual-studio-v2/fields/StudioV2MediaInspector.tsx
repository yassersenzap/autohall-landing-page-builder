import { usePuck } from '@puckeditor/core';
import { AssetImage } from '@/features/builder-engine/components/media/AssetImage';
import { useStudioV2Context } from '../context/StudioV2Context';
import { MediaLibraryGrid } from '../components/MediaLibraryGrid';
import { useUpdateSelectedProps } from '../hooks/useUpdateSelectedProps';
import { SegmentedControl } from './SegmentedControl';

type StudioV2MediaInspectorProps = {
  imageAssetId?: string;
  onChangeAssetId: (assetId: string) => void;
};

export function StudioV2MediaInspector({
  imageAssetId,
  onChangeAssetId,
}: StudioV2MediaInspectorProps) {
  const { pageVersionId, canWrite } = useStudioV2Context();
  const { selectedItem } = usePuck();
  const updateProps = useUpdateSelectedProps();
  const props = (selectedItem?.props ?? {}) as Record<string, unknown>;

  const imageAlt = typeof props.imageAlt === 'string' ? props.imageAlt : '';
  const imageFit = props.imageFit === 'contain' ? 'contain' : 'cover';
  const imagePosition =
    typeof props.imagePosition === 'string' ? props.imagePosition : 'center';
  const aspectRatio = typeof props.aspectRatio === 'string' ? props.aspectRatio : 'auto';
  const imageRadius = typeof props.imageRadius === 'string' ? props.imageRadius : 'md';
  const imageShadow = typeof props.imageShadow === 'string' ? props.imageShadow : 'none';

  return (
    <div className="vs2-media-inspector">
      <p className="vs2-inspector-section-title">Média</p>

      {imageAssetId ? (
        <div className="vs2-media-inspector__preview">
          <AssetImage
            assetId={imageAssetId}
            alt={imageAlt || 'Aperçu'}
            className="h-full w-full object-cover"
            loadingClassName="h-full w-full"
          />
        </div>
      ) : null}

      <MediaLibraryGrid
        pageVersionId={pageVersionId}
        canWrite={canWrite}
        selectedAssetId={imageAssetId}
        compact
        onSelect={(id) => {
          onChangeAssetId(id);
          updateProps({ imageUrl: '' });
        }}
        onClear={() => {
          onChangeAssetId('');
          updateProps({ imageUrl: '' });
        }}
      />

      <label className="vs2-media-inspector__field">
        <span>Texte alternatif (accessibilité)</span>
        <input
          type="text"
          value={imageAlt}
          placeholder="Décrivez l'image pour les lecteurs d'écran"
          onChange={(e) => updateProps({ imageAlt: e.target.value })}
        />
      </label>

      <SegmentedControl
        label="Ajustement"
        value={imageFit}
        options={[
          { label: 'Couvrir', value: 'cover' },
          { label: 'Contenir', value: 'contain' },
        ]}
        onChange={(value) => updateProps({ imageFit: value })}
      />

      <label className="vs2-media-inspector__field">
        <span>Position du cadrage</span>
        <select
          value={imagePosition}
          onChange={(e) => updateProps({ imagePosition: e.target.value })}
        >
          <option value="center">Centre</option>
          <option value="top">Haut</option>
          <option value="bottom">Bas</option>
          <option value="left">Gauche</option>
          <option value="right">Droite</option>
        </select>
      </label>

      <label className="vs2-media-inspector__field">
        <span>Format d&apos;image</span>
        <select value={aspectRatio} onChange={(e) => updateProps({ aspectRatio: e.target.value })}>
          <option value="auto">Automatique</option>
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">Carré 1:1</option>
          <option value="portrait">Portrait</option>
        </select>
      </label>

      <label className="vs2-media-inspector__field">
        <span>Coins arrondis</span>
        <select value={imageRadius} onChange={(e) => updateProps({ imageRadius: e.target.value })}>
          <option value="none">Aucun</option>
          <option value="sm">Petit</option>
          <option value="md">Moyen</option>
          <option value="lg">Grand</option>
          <option value="xl">Très grand</option>
          <option value="full">Rond</option>
        </select>
      </label>

      <label className="vs2-media-inspector__field">
        <span>Ombre portée</span>
        <select value={imageShadow} onChange={(e) => updateProps({ imageShadow: e.target.value })}>
          <option value="none">Aucune</option>
          <option value="soft">Douce</option>
          <option value="medium">Moyenne</option>
          <option value="strong">Forte</option>
        </select>
      </label>

      {!imageAssetId && !imageAlt ? (
        <p className="vs2-media-inspector__hint">
          Astuce : sélectionnez une image puis renseignez le texte alternatif.
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Use StudioV2MediaInspector */
export function StudioV2MediaField(props: StudioV2MediaInspectorProps) {
  return <StudioV2MediaInspector {...props} />;
}
