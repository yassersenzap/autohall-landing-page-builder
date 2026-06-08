import { Label } from '@/components/ui/primitives';
import { MediaFieldControl } from './MediaFieldControl';
import { mediaValueFromProps } from './media-field-utils';

type BackgroundInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
  onPatch: (blockId: string, patch: Record<string, unknown>) => void;
  showOverlaySlider?: boolean;
};

export function BackgroundInspectorFields({
  blockId,
  propsJson,
  onPatch,
  showOverlaySlider = true,
}: BackgroundInspectorFieldsProps) {
  const backgroundType = String(propsJson.backgroundType ?? 'image');
  const overlayOpacity = Number.parseInt(String(propsJson.overlayOpacity ?? '80'), 10) || 80;
  const parallaxEnabled = propsJson.parallaxEnabled === true;
  const backgroundColor = String(propsJson.backgroundColor ?? '#0f172a');

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="v3-bg-type" className="text-neutral-400">
          Type de fond
        </Label>
        <select
          id="v3-bg-type"
          value={backgroundType}
          onChange={(e) => onPatch(blockId, { backgroundType: e.target.value })}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
        >
          <option value="color">Couleur unie</option>
          <option value="image">Image HD</option>
        </select>
        <p className="text-xs text-neutral-500">
          Couleur de secours ou visuel plein écran selon le type choisi.
        </p>
      </div>

      {backgroundType === 'color' ? (
        <div className="space-y-1.5">
          <Label htmlFor="v3-bg-color" className="text-neutral-400">
            Couleur
          </Label>
          <div className="flex gap-2">
            <input
              id="v3-bg-color-picker"
              type="color"
              value={backgroundColor}
              onChange={(e) => onPatch(blockId, { backgroundColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-neutral-700 bg-transparent"
              aria-label="Couleur de fond"
            />
            <input
              id="v3-bg-color"
              value={backgroundColor}
              onChange={(e) => onPatch(blockId, { backgroundColor: e.target.value })}
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-200"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <MediaFieldControl
            label="Image de fond"
            value={mediaValueFromProps(propsJson)}
            onChange={(next) =>
              onPatch(blockId, {
                imageAssetId: next.imageAssetId ?? '',
                imageUrl: next.imageUrl ?? '',
                alt: next.alt ?? '',
              })
            }
          />
          <p className="text-xs text-neutral-500">
            Photo véhicule haute définition — JPG ou PNG recommandé.
          </p>
        </div>
      )}

      {showOverlaySlider && backgroundType === 'image' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="v3-bg-overlay-slider" className="text-neutral-400">
              Opacité calque noir
            </Label>
            <span className="text-xs font-mono text-neutral-500">{overlayOpacity} %</span>
          </div>
          <input
            id="v3-bg-overlay-slider"
            type="range"
            min={0}
            max={100}
            step={5}
            value={overlayOpacity}
            onChange={(e) => onPatch(blockId, { overlayOpacity: e.target.value })}
            className="w-full accent-blue-500"
            aria-label="Opacité overlay"
          />
          <p className="text-xs text-neutral-500">
            Assure la lisibilité du texte blanc sur toutes les photos.
          </p>
        </div>
      ) : null}

      {showOverlaySlider && backgroundType === 'color' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="v3-bg-overlay-color" className="text-neutral-400">
              Assombrissement
            </Label>
            <span className="text-xs font-mono text-neutral-500">{overlayOpacity} %</span>
          </div>
          <input
            id="v3-bg-overlay-color"
            type="range"
            min={0}
            max={100}
            step={5}
            value={overlayOpacity}
            onChange={(e) => onPatch(blockId, { overlayOpacity: e.target.value })}
            className="w-full accent-blue-500"
          />
        </div>
      ) : null}

      <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-400">
        <input
          type="checkbox"
          checked={parallaxEnabled}
          onChange={(e) => onPatch(blockId, { parallaxEnabled: e.target.checked })}
          className="rounded border-neutral-600"
        />
        Effet parallaxe (bg-fixed)
      </label>
    </div>
  );
}
