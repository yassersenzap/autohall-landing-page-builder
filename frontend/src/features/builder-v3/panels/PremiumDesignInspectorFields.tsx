import {
  normalizePremiumDesign,
  patchPremiumDesign,
  type NormalizedPremiumDesign,
  type PremiumCtaStyle,
  type PremiumDensity,
  type PremiumImageShape,
  type PremiumMediaPosition,
  type PremiumTone,
  type PremiumVariant,
} from '@/features/builder-engine/lib/premium-block-design';
import { Label } from '@/components/ui/primitives';
import { FieldHint } from '../components/BlockInspectorPanel.shared';

type PremiumDesignInspectorFieldsProps = {
  blockType: 'hero_form_campaign' | 'vehicle_offer';
  propsJson: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
};

type Option<T extends string> = { value: T; label: string; hint?: string };

const VARIANT_OPTIONS: Option<PremiumVariant>[] = [
  { value: 'split-form', label: 'Split contenu + formulaire', hint: 'Mise en page campagne classique.' },
  { value: 'media-focus', label: 'Visuel mis en avant', hint: 'Photo véhicule dominante avec formulaire.' },
  { value: 'compact', label: 'Compact', hint: 'Sans visuel — idéal SAV ou capture rapide.' },
];

const TONE_OPTIONS: Option<PremiumTone>[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'brand', label: 'Marque Auto Hall' },
];

const MEDIA_OPTIONS: Option<PremiumMediaPosition>[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'right', label: 'Droite' },
];

const DENSITY_OPTIONS: Option<PremiumDensity>[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Confortable' },
  { value: 'immersive', label: 'Immersif' },
];

const SHAPE_OPTIONS: Option<PremiumImageShape>[] = [
  { value: 'rounded-card', label: 'Carte arrondie' },
  { value: 'full-bleed', label: 'Pleine largeur' },
  { value: 'simple', label: 'Simple' },
];

const CTA_OPTIONS: Option<PremiumCtaStyle>[] = [
  { value: 'primary', label: 'Primaire' },
  { value: 'outline', label: 'Contour' },
  { value: 'white', label: 'Blanc' },
];

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  hint,
  disabled,
}: {
  id: string;
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-neutral-400">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

export function PremiumDesignInspectorFields({
  blockType,
  propsJson,
  onPatch,
}: PremiumDesignInspectorFieldsProps) {
  const design = normalizePremiumDesign(propsJson);
  const patchDesign = (patch: Partial<NormalizedPremiumDesign>) => {
    onPatch(patchPremiumDesign(propsJson, patch));
  };

  const mediaDisabled = design.variant === 'compact';
  const shapeDisabled = design.variant === 'compact';

  return (
    <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Variante de section
        </p>
        <FieldHint>
          {blockType === 'hero_form_campaign'
            ? 'Styles contrôlés — pas de CSS libre.'
            : 'Apparence de la fiche offre véhicule.'}
        </FieldHint>
      </div>

      <SelectField
        id="premium-variant"
        label="Disposition"
        value={design.variant}
        options={VARIANT_OPTIONS}
        onChange={(variant) => patchDesign({ variant })}
        hint={VARIANT_OPTIONS.find((o) => o.value === design.variant)?.hint}
      />

      <SelectField
        id="premium-tone"
        label="Ambiance"
        value={design.tone}
        options={TONE_OPTIONS}
        onChange={(tone) => patchDesign({ tone })}
      />

      <SelectField
        id="premium-media"
        label="Position du visuel"
        value={design.mediaPosition}
        options={MEDIA_OPTIONS}
        onChange={(mediaPosition) => patchDesign({ mediaPosition })}
        disabled={mediaDisabled}
        hint={mediaDisabled ? 'Masqué en variante compacte.' : undefined}
      />

      <SelectField
        id="premium-density"
        label="Densité"
        value={design.density}
        options={DENSITY_OPTIONS}
        onChange={(density) => patchDesign({ density })}
      />

      <SelectField
        id="premium-shape"
        label="Cadre image"
        value={design.imageShape}
        options={SHAPE_OPTIONS}
        onChange={(imageShape) => patchDesign({ imageShape })}
        disabled={shapeDisabled}
      />

      <SelectField
        id="premium-cta"
        label="Style du bouton"
        value={design.ctaStyle}
        options={CTA_OPTIONS}
        onChange={(ctaStyle) => patchDesign({ ctaStyle })}
      />
    </div>
  );
}
