import { asPropString } from '@/features/builder-engine/lib/block-props';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { BRAND_PRESETS } from '@/features/builder/brand-presets';
import type { BrandPresetId } from '@/features/builder/brand-presets';
import { HERO_CROP_PRESETS } from '@/features/builder/blocks/hero-vehicle-offer/hero-image-controls';
import { Label, ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { FieldHint } from '../components/BlockInspectorPanel.shared';
import { MediaFieldControl } from '../components/MediaFieldControl';
import type { MediaFieldValue } from '../components/MediaFieldControl';

type HeroVehicleOfferInspectorFieldsProps = {
  block: BuilderDocumentBlock;
  patch: (p: Record<string, unknown>) => void;
};

const CROP_PRESET_LABELS: Record<string, string> = {
  center: 'Centre',
  top: 'Haut',
  bottom: 'Bas',
  left: 'Gauche',
  right: 'Droite',
  custom: 'Personnalisé',
};

function desktopMediaFromProps(propsJson: Record<string, unknown>): MediaFieldValue {
  return {
    imageAssetId: asPropString(propsJson.heroImage),
    imageUrl: asPropString(propsJson.heroImageUrl),
  };
}

function mobileMediaFromProps(propsJson: Record<string, unknown>): MediaFieldValue {
  return {
    imageAssetId: asPropString(propsJson.mobileImage),
    imageUrl: asPropString(propsJson.mobileImageUrl),
  };
}

function patchDesktopMedia(
  patch: (p: Record<string, unknown>) => void,
  next: MediaFieldValue,
): void {
  patch({
    heroImage: next.imageAssetId ?? '',
    heroImageUrl: next.imageUrl ?? '',
  });
}

function patchMobileMedia(
  patch: (p: Record<string, unknown>) => void,
  next: MediaFieldValue,
): void {
  patch({
    mobileImage: next.imageAssetId ?? '',
    mobileImageUrl: next.imageUrl ?? '',
  });
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-neutral-400">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function HeroVehicleOfferInspectorFields({
  block,
  patch,
}: HeroVehicleOfferInspectorFieldsProps) {
  const { propsJson } = block;
  const cropPreset = asPropString(propsJson.cropPreset) || 'center';
  const isCustomCrop = cropPreset === 'custom';

  return (
    <div className="space-y-4">
      <SelectField
        id="v3-hvo-brand"
        label="Marque"
        value={asPropString(propsJson.brandId) || 'ford'}
        options={BRAND_PRESETS.map((preset) => ({ value: preset.id, label: preset.name }))}
        onChange={(value) => patch({ brandId: value as BrandPresetId })}
      />
      <FieldHint>Applique les couleurs et le ton de la marque sur le hero.</FieldHint>

      <div className="space-y-1.5">
        <Label htmlFor="v3-hvo-headline" className="text-neutral-400">
          Titre principal
        </Label>
        <ShadInput
          id="v3-hvo-headline"
          value={asPropString(propsJson.headline)}
          onChange={(e) => patch({ headline: e.target.value })}
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="v3-hvo-subheadline" className="text-neutral-400">
          Sous-titre
        </Label>
        <ShadTextarea
          id="v3-hvo-subheadline"
          rows={2}
          value={asPropString(propsJson.subheadline)}
          onChange={(e) => patch({ subheadline: e.target.value })}
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="v3-hvo-offer" className="text-neutral-400">
            Badge offre
          </Label>
          <ShadInput
            id="v3-hvo-offer"
            value={asPropString(propsJson.offerLabel)}
            onChange={(e) => patch({ offerLabel: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v3-hvo-price" className="text-neutral-400">
            Prix / mention
          </Label>
          <ShadInput
            id="v3-hvo-price"
            value={asPropString(propsJson.priceText)}
            onChange={(e) => patch({ priceText: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="v3-hvo-cta-primary" className="text-neutral-400">
          CTA principal
        </Label>
        <ShadInput
          id="v3-hvo-cta-primary"
          value={asPropString(propsJson.primaryCtaLabel)}
          onChange={(e) => patch({ primaryCtaLabel: e.target.value })}
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="v3-hvo-cta-secondary" className="text-neutral-400">
          CTA secondaire
        </Label>
        <ShadInput
          id="v3-hvo-cta-secondary"
          value={asPropString(propsJson.secondaryCtaLabel)}
          onChange={(e) => patch({ secondaryCtaLabel: e.target.value })}
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
      </div>

      <div className="rounded-md border border-neutral-800 bg-neutral-950/40 p-3 space-y-3">
        <p className="text-xs font-medium text-neutral-300">Images</p>

        <MediaFieldControl
          label="Image hero (desktop)"
          value={desktopMediaFromProps(propsJson)}
          onChange={(next) => patchDesktopMedia(patch, next)}
        />

        <MediaFieldControl
          label="Image mobile (optionnel)"
          value={mobileMediaFromProps(propsJson)}
          onChange={(next) => patchMobileMedia(patch, next)}
        />

        <div className="space-y-1.5">
          <Label htmlFor="v3-hvo-alt" className="text-neutral-400">
            Texte alternatif (alt)
          </Label>
          <ShadInput
            id="v3-hvo-alt"
            value={asPropString(propsJson.heroImageAlt)}
            onChange={(e) => patch({ heroImageAlt: e.target.value })}
            placeholder="Ex. Ford Ranger vue 3/4"
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
          <FieldHint>Accessibilité et SEO — décrit le visuel du véhicule.</FieldHint>
        </div>

        <SelectField
          id="v3-hvo-fit"
          label="Ajustement image"
          value={asPropString(propsJson.imageFit) || 'cover'}
          options={[
            { value: 'cover', label: 'Remplir (cover)' },
            { value: 'contain', label: 'Contenir (contain)' },
          ]}
          onChange={(value) => patch({ imageFit: value })}
        />

        <SelectField
          id="v3-hvo-position"
          label="Position image"
          value={asPropString(propsJson.imagePosition) || 'right'}
          options={[
            { value: 'left', label: 'Gauche' },
            { value: 'right', label: 'Droite' },
            { value: 'background', label: 'Arrière-plan' },
          ]}
          onChange={(value) => patch({ imagePosition: value })}
        />

        <SelectField
          id="v3-hvo-crop"
          label="Recadrage (point focal)"
          value={cropPreset}
          options={HERO_CROP_PRESETS.map((value) => ({
            value,
            label: CROP_PRESET_LABELS[value] ?? value,
          }))}
          onChange={(value) => patch({ cropPreset: value })}
        />

        {isCustomCrop ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="v3-hvo-focal-x" className="text-neutral-400">
                Focal X (%)
              </Label>
              <ShadInput
                id="v3-hvo-focal-x"
                type="number"
                min={0}
                max={100}
                value={asPropString(propsJson.focalPointX) || '50'}
                onChange={(e) => patch({ focalPointX: Number(e.target.value) })}
                className="border-neutral-700 bg-neutral-900 text-neutral-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v3-hvo-focal-y" className="text-neutral-400">
                Focal Y (%)
              </Label>
              <ShadInput
                id="v3-hvo-focal-y"
                type="number"
                min={0}
                max={100}
                value={asPropString(propsJson.focalPointY) || '50'}
                onChange={(e) => patch({ focalPointY: Number(e.target.value) })}
                className="border-neutral-700 bg-neutral-900 text-neutral-200"
              />
            </div>
          </div>
        ) : null}

        <SelectField
          id="v3-hvo-overlay"
          label="Intensité overlay"
          value={asPropString(propsJson.overlayIntensity) || 'medium'}
          options={[
            { value: 'none', label: 'Aucun' },
            { value: 'light', label: 'Léger' },
            { value: 'medium', label: 'Moyen' },
            { value: 'heavy', label: 'Fort' },
          ]}
          onChange={(value) => patch({ overlayIntensity: value })}
        />
      </div>

      <SelectField
        id="v3-hvo-layout"
        label="Disposition"
        value={asPropString(propsJson.layoutVariant) || 'split-media-right'}
        options={[
          { value: 'split-media-right', label: 'Média à droite' },
          { value: 'split-media-left', label: 'Média à gauche' },
          { value: 'full-bleed-overlay', label: 'Plein écran' },
          { value: 'stacked-mobile', label: 'Empilé mobile' },
        ]}
        onChange={(value) => patch({ layoutVariant: value })}
      />
    </div>
  );
}

export function isHeroVehicleOfferBlock(type: string): boolean {
  return type === 'hero_vehicle_offer';
}
