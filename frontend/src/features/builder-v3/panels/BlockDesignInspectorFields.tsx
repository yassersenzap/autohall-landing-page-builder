import {
  INSPECTOR_DESIGN_BLOCKS,
  normalizeSectionDesign,
  patchBlockDesign,
  type NormalizedBlockDesign,
  type BlockAlignment,
  type BlockTone,
} from '@/features/builder-engine/lib/block-design-system';
import {
  type PremiumCtaStyle,
  type PremiumDensity,
  type PremiumMediaPosition,
} from '@/features/builder-engine/lib/premium-block-design';
import { Label } from '@/components/ui/primitives';
import { FieldHint } from '../components/BlockInspectorPanel.shared';

type BlockDesignInspectorFieldsProps = {
  blockType: string;
  propsJson: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
};

type Option<T extends string> = { value: T; label: string; hint?: string };

const TONE_OPTIONS: Option<BlockTone>[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'brand', label: 'Marque Auto Hall' },
  { value: 'neutral', label: 'Neutre' },
];

const DENSITY_OPTIONS: Option<PremiumDensity>[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Confortable' },
  { value: 'immersive', label: 'Immersif' },
];

const MEDIA_OPTIONS: Option<PremiumMediaPosition>[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'right', label: 'Droite' },
];

const ALIGN_OPTIONS: Option<BlockAlignment>[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centré' },
  { value: 'split', label: 'Split' },
];

const CTA_OPTIONS: Option<PremiumCtaStyle>[] = [
  { value: 'primary', label: 'Primaire' },
  { value: 'outline', label: 'Contour' },
  { value: 'white', label: 'Blanc' },
];

const VARIANT_OPTIONS: Record<string, Option<string>[]> = {
  hero_form_campaign: [
    { value: 'split-form', label: 'Split contenu + formulaire' },
    { value: 'media-focus', label: 'Visuel mis en avant' },
    { value: 'compact', label: 'Compact (sans visuel)' },
  ],
  vehicle_offer: [
    { value: 'split-form', label: 'Fiche split' },
    { value: 'media-focus', label: 'Visuel dominant' },
    { value: 'compact', label: 'Compact' },
  ],
  hero_campaign: [
    { value: 'standard', label: 'Standard' },
    { value: 'media-focus', label: 'Visuel mis en avant' },
    { value: 'minimal', label: 'Minimal' },
  ],
  lead_form: [
    { value: 'split', label: 'Texte + formulaire' },
    { value: 'stacked', label: 'Empilé' },
  ],
  benefits: [
    { value: 'grid', label: 'Grille' },
    { value: 'cards', label: 'Cartes' },
  ],
  faq: [
    { value: 'standard', label: 'Standard' },
    { value: 'compact', label: 'Compact' },
  ],
  vehicle_range: [
    { value: 'grid', label: 'Grille' },
    { value: 'cards', label: 'Cartes larges' },
  ],
};

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

export function BlockDesignInspectorFields({
  blockType,
  propsJson,
  onPatch,
}: BlockDesignInspectorFieldsProps) {
  if (!INSPECTOR_DESIGN_BLOCKS.has(blockType)) return null;

  const design = normalizeSectionDesign(blockType, propsJson);
  const patchDesign = (patch: Partial<NormalizedBlockDesign>) => {
    onPatch(patchBlockDesign(propsJson, blockType, patch));
  };

  const variantOptions = VARIANT_OPTIONS[blockType];
  const showMedia =
    blockType === 'hero_form_campaign' ||
    blockType === 'vehicle_offer' ||
    blockType === 'hero_campaign';
  const mediaDisabled = design.variant === 'compact';

  return (
    <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Style visuel
        </p>
        <FieldHint>Variantes contrôlées — pas de CSS libre.</FieldHint>
      </div>

      {variantOptions ? (
        <SelectField
          id="block-variant"
          label="Disposition"
          value={design.variant}
          options={variantOptions}
          onChange={(variant) => patchDesign({ variant })}
        />
      ) : null}

      <SelectField
        id="block-tone"
        label="Ton"
        value={design.tone}
        options={TONE_OPTIONS}
        onChange={(tone) => patchDesign({ tone })}
      />

      <SelectField
        id="block-density"
        label="Densité"
        value={design.density}
        options={DENSITY_OPTIONS}
        onChange={(density) => patchDesign({ density })}
      />

      {showMedia ? (
        <SelectField
          id="block-media"
          label="Position média"
          value={design.mediaPosition}
          options={MEDIA_OPTIONS}
          onChange={(mediaPosition) => patchDesign({ mediaPosition })}
          disabled={mediaDisabled}
        />
      ) : null}

      <SelectField
        id="block-align"
        label="Alignement"
        value={design.alignment}
        options={ALIGN_OPTIONS}
        onChange={(alignment) => patchDesign({ alignment })}
      />

      {(blockType === 'final_cta' ||
        blockType === 'cta_band' ||
        blockType === 'vehicle_offer' ||
        blockType === 'hero_campaign') && (
        <SelectField
          id="block-cta"
          label="Style bouton"
          value={design.ctaStyle}
          options={CTA_OPTIONS}
          onChange={(ctaStyle) => patchDesign({ ctaStyle })}
        />
      )}
    </div>
  );
}

/** @deprecated use BlockDesignInspectorFields */
export const PremiumDesignInspectorFields = BlockDesignInspectorFields;
