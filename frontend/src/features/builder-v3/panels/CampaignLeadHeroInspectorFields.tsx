import { asPropString } from '@/features/builder-engine/lib/block-props';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { BRAND_PRESETS } from '@/features/builder/brand-presets';
import type { BrandPresetId } from '@/features/builder/brand-presets';
import type {
  CampaignLeadHeroContentPlacement,
  CampaignLeadHeroFormTheme,
  CampaignLeadHeroLayoutVariant,
} from '@/features/builder/blocks/campaign-lead-hero';
import { HERO_CROP_PRESETS } from '@/features/builder/blocks/hero-vehicle-offer/hero-image-controls';
import { Label, ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { FieldHint } from '../components/BlockInspectorPanel.shared';
import { MediaFieldControl } from '../components/MediaFieldControl';
import type { MediaFieldValue } from '../components/MediaFieldControl';

type CampaignLeadHeroInspectorFieldsProps = {
  block: BuilderDocumentBlock;
  patch: (p: Record<string, unknown>) => void;
};

const LAYOUT_OPTIONS: { value: CampaignLeadHeroLayoutVariant; label: string }[] = [
  { value: 'media_left_form_right', label: 'Image gauche · formulaire droite' },
  { value: 'form_left_media_right', label: 'Formulaire gauche · image droite' },
  { value: 'background_media_form_right', label: 'Fond image · formulaire droite' },
  { value: 'background_media_form_left', label: 'Fond image · formulaire gauche' },
  { value: 'dual_media_form_right', label: 'Double visuel · formulaire droite' },
  { value: 'dual_media_form_left', label: 'Double visuel · formulaire gauche' },
];

const CROP_PRESET_LABELS: Record<string, string> = {
  center: 'Centre',
  top: 'Haut',
  bottom: 'Bas',
  left: 'Gauche',
  right: 'Droite',
  custom: 'Personnalisé',
};

function readDesign(propsJson: Record<string, unknown>): Record<string, unknown> {
  const raw = propsJson.design;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

function patchDesign(
  patch: (p: Record<string, unknown>) => void,
  propsJson: Record<string, unknown>,
  key: string,
  value: unknown,
): void {
  patch({ design: { ...readDesign(propsJson), [key]: value } });
}

function mediaFromProps(
  propsJson: Record<string, unknown>,
  assetKey: string,
  urlKey: string,
): MediaFieldValue {
  return {
    imageAssetId: asPropString(propsJson[assetKey]),
    imageUrl: asPropString(propsJson[urlKey]),
  };
}

function patchMedia(
  patch: (p: Record<string, unknown>) => void,
  assetKey: string,
  urlKey: string,
  next: MediaFieldValue,
): void {
  patch({
    [assetKey]: next.imageAssetId ?? '',
    [urlKey]: next.imageUrl ?? '',
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
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
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

export function CampaignLeadHeroInspectorFields({
  block,
  patch,
}: CampaignLeadHeroInspectorFieldsProps) {
  const propsJson = block.propsJson;
  const design = readDesign(propsJson);
  const layoutVariant =
    (asPropString(propsJson.layoutVariant) as CampaignLeadHeroLayoutVariant) ||
    'media_left_form_right';
  const isDual =
    layoutVariant === 'dual_media_form_right' || layoutVariant === 'dual_media_form_left';
  const cropPreset = asPropString(propsJson.cropPreset) || 'center';

  return (
    <div className="space-y-4 border-t border-neutral-800 pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        Hero campagne + lead
      </p>

      <SelectField
        id="clh-brand"
        label="Marque"
        value={asPropString(propsJson.brandId) ?? 'chery'}
        options={BRAND_PRESETS.map((b) => ({ value: b.id, label: b.name }))}
        onChange={(value) => patch({ brandId: value as BrandPresetId })}
      />

      <SelectField
        id="clh-layout"
        label="Disposition"
        value={layoutVariant}
        options={LAYOUT_OPTIONS}
        onChange={(value) => patch({ layoutVariant: value })}
      />

      <SelectField
        id="clh-form-theme"
        label="Thème formulaire"
        value={(design.formTheme as string) ?? 'light'}
        options={[
          { value: 'light', label: 'Clair (Auto Hall)' },
          { value: 'dark', label: 'Sombre' },
          { value: 'glass', label: 'Verre dépoli' },
        ]}
        onChange={(value) =>
          patchDesign(patch, propsJson, 'formTheme', value as CampaignLeadHeroFormTheme)
        }
      />

      <SelectField
        id="clh-content-placement"
        label="Placement du texte campagne"
        value={asPropString(propsJson.contentPlacement) || 'hidden'}
        options={[
          { value: 'hidden', label: 'Masqué (visuel seul)' },
          { value: 'overlay_media', label: 'Superposé sur le visuel' },
          { value: 'beside_form', label: 'À côté du formulaire' },
        ]}
        onChange={(value) =>
          patch({ contentPlacement: value as CampaignLeadHeroContentPlacement })
        }
      />

      <div className="space-y-1.5">
        <Label htmlFor="clh-campaign-title" className="text-neutral-400">
          Titre campagne
        </Label>
        <ShadInput
          id="clh-campaign-title"
          value={asPropString(propsJson.campaignTitle) ?? ''}
          onChange={(e) => patch({ campaignTitle: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clh-campaign-subtitle" className="text-neutral-400">
          Sous-titre campagne
        </Label>
        <ShadTextarea
          id="clh-campaign-subtitle"
          value={asPropString(propsJson.campaignSubtitle) ?? ''}
          onChange={(e) => patch({ campaignSubtitle: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clh-offer-badge" className="text-neutral-400">
          Badge offre
        </Label>
        <ShadInput
          id="clh-offer-badge"
          value={asPropString(propsJson.offerBadge) ?? ''}
          onChange={(e) => patch({ offerBadge: e.target.value })}
        />
      </div>

      <MediaFieldControl
        label="Image principale"
        value={mediaFromProps(propsJson, 'primaryImage', 'primaryImageUrl')}
        onChange={(next) => patchMedia(patch, 'primaryImage', 'primaryImageUrl', next)}
      />

      {isDual ? (
        <MediaFieldControl
          label="Image secondaire"
          value={mediaFromProps(propsJson, 'secondaryImage', 'secondaryImageUrl')}
          onChange={(next) => patchMedia(patch, 'secondaryImage', 'secondaryImageUrl', next)}
        />
      ) : null}

      <MediaFieldControl
        label="Image mobile (optionnel)"
        value={mediaFromProps(propsJson, 'mobileImage', 'mobileImageUrl')}
        onChange={(next) => patchMedia(patch, 'mobileImage', 'mobileImageUrl', next)}
      />

      <div className="space-y-1.5">
        <Label htmlFor="clh-primary-alt" className="text-neutral-400">
          Texte alternatif image principale
        </Label>
        <ShadInput
          id="clh-primary-alt"
          value={asPropString(propsJson.primaryImageAlt) ?? ''}
          onChange={(e) => patch({ primaryImageAlt: e.target.value })}
        />
      </div>

      {isDual ? (
        <div className="space-y-1.5">
          <Label htmlFor="clh-secondary-alt" className="text-neutral-400">
            Texte alternatif image secondaire
          </Label>
          <ShadInput
            id="clh-secondary-alt"
            value={asPropString(propsJson.secondaryImageAlt) ?? ''}
            onChange={(e) => patch({ secondaryImageAlt: e.target.value })}
          />
        </div>
      ) : null}

      <SelectField
        id="clh-image-fit"
        label="Ajustement image"
        value={asPropString(propsJson.imageFit) ?? 'cover'}
        options={[
          { value: 'cover', label: 'Couvrir' },
          { value: 'contain', label: 'Contenir' },
        ]}
        onChange={(value) => patch({ imageFit: value })}
      />

      <SelectField
        id="clh-image-position"
        label="Position image"
        value={asPropString(propsJson.imagePosition) ?? 'center'}
        options={[
          { value: 'left', label: 'Gauche' },
          { value: 'center', label: 'Centre' },
          { value: 'right', label: 'Droite' },
        ]}
        onChange={(value) => patch({ imagePosition: value })}
      />

      <SelectField
        id="clh-crop"
        label="Recadrage"
        value={cropPreset}
        options={HERO_CROP_PRESETS.map((p) => ({
          value: p,
          label: CROP_PRESET_LABELS[p] ?? p,
        }))}
        onChange={(value) => patch({ cropPreset: value })}
      />

      {cropPreset === 'custom' ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="clh-focal-x" className="text-neutral-400">
              Point focal X (%)
            </Label>
            <ShadInput
              id="clh-focal-x"
              type="number"
              min={0}
              max={100}
              value={asPropString(propsJson.focalPointX) || '50'}
              onChange={(e) => patch({ focalPointX: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clh-focal-y" className="text-neutral-400">
              Point focal Y (%)
            </Label>
            <ShadInput
              id="clh-focal-y"
              type="number"
              min={0}
              max={100}
              value={asPropString(propsJson.focalPointY) || '50'}
              onChange={(e) => patch({ focalPointY: Number(e.target.value) })}
            />
          </div>
        </>
      ) : null}

      <SelectField
        id="clh-overlay"
        label="Overlay"
        value={asPropString(propsJson.overlayIntensity) ?? 'light'}
        options={[
          { value: 'none', label: 'Aucun' },
          { value: 'light', label: 'Léger' },
          { value: 'medium', label: 'Moyen' },
          { value: 'heavy', label: 'Fort' },
        ]}
        onChange={(value) => patch({ overlayIntensity: value })}
      />

      <div className="space-y-1.5">
        <Label htmlFor="clh-form-title" className="text-neutral-400">
          Titre formulaire
        </Label>
        <ShadInput
          id="clh-form-title"
          value={asPropString(propsJson.formTitle) ?? ''}
          onChange={(e) => patch({ formTitle: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clh-form-subtitle" className="text-neutral-400">
          Sous-titre formulaire
        </Label>
        <ShadTextarea
          id="clh-form-subtitle"
          value={asPropString(propsJson.formSubtitle) ?? ''}
          onChange={(e) => patch({ formSubtitle: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clh-step-label" className="text-neutral-400">
          Libellé étape
        </Label>
        <ShadInput
          id="clh-step-label"
          value={asPropString(propsJson.formStepLabel) ?? ''}
          onChange={(e) => patch({ formStepLabel: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clh-field-label" className="text-neutral-400">
          Champ principal
        </Label>
        <ShadInput
          id="clh-field-label"
          value={asPropString(propsJson.formPrimaryFieldLabel) ?? ''}
          onChange={(e) => patch({ formPrimaryFieldLabel: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clh-cta" className="text-neutral-400">
          CTA formulaire
        </Label>
        <ShadInput
          id="clh-cta"
          value={asPropString(propsJson.formCtaLabel) ?? ''}
          onChange={(e) => patch({ formCtaLabel: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clh-legal" className="text-neutral-400">
          Texte légal
        </Label>
        <ShadTextarea
          id="clh-legal"
          value={asPropString(propsJson.legalText) ?? ''}
          onChange={(e) => patch({ legalText: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clh-footer" className="text-neutral-400">
          Pied de formulaire
        </Label>
        <ShadTextarea
          id="clh-footer"
          value={asPropString(propsJson.footerText) ?? ''}
          onChange={(e) => patch({ footerText: e.target.value })}
          rows={2}
        />
      </div>

      <FieldHint>
        Aperçu formulaire statique — l’intégration provider lead arrive au prochain commit.
      </FieldHint>
    </div>
  );
}

export function isCampaignLeadHeroBlock(type: string): boolean {
  return type === 'campaign_lead_hero';
}
