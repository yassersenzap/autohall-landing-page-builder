import type { ComponentType, ReactNode } from 'react';
import {
  Battery,
  Car,
  Check,
  Clock,
  Fuel,
  MapPin,
  Phone,
  Shield,
  Star,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { AssetImage } from '@/features/builder-engine/components/media/AssetImage';
import {
  buildAutoHallLeadFormFields,
  type LeadFormConfig,
  type LeadFormFieldDef,
} from '@/features/builder-engine/constants/autohall-lead-form';
import { StudioV2MediaInspector } from '../fields/StudioV2MediaInspector';
import { useStudioV2Actions } from '../context/StudioV2Context';
import { buildImageElementStyle, buildImageMediaStyle } from '../lib/image-style';
import { STUDIO_V2_BENEFIT_ICONS } from '../puck-constants';
import type {
  BackgroundTone,
  ColumnGap,
  ContentAlignment,
  ContainerMaxWidth,
  HeroTone,
  SpacingPreset,
} from '../types';

export const TONE_OPTIONS = [
  { label: 'Blanc', value: 'white' },
  { label: 'Clair', value: 'light' },
  { label: 'Doux', value: 'soft' },
  { label: 'Sombre', value: 'dark' },
  { label: 'Marque', value: 'brand' },
  { label: 'Dégradé', value: 'gradient' },
];

export const SPACING_OPTIONS = [
  { label: 'Compact', value: 'compact' },
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
  { label: 'Hero', value: 'hero' },
];

export const ALIGN_OPTIONS = [
  { label: 'Gauche', value: 'left' },
  { label: 'Centré', value: 'center' },
];

export const MAX_WIDTH_OPTIONS = [
  { label: 'Étroit', value: 'narrow' },
  { label: 'Standard', value: 'default' },
  { label: 'Large', value: 'wide' },
  { label: 'Pleine largeur', value: 'full' },
];

export const COLUMN_RATIO_OPTIONS = [
  { label: '50 / 50', value: '50-50' },
  { label: '40 / 60', value: '40-60' },
  { label: '60 / 40', value: '60-40' },
  { label: '30 / 70', value: '30-70' },
  { label: '70 / 30', value: '70-30' },
];

export const HERO_LAYOUT_OPTIONS = [
  { label: 'Image à droite', value: 'split_right' },
  { label: 'Image à gauche', value: 'split_left' },
  { label: 'Empilé', value: 'stacked' },
];

export const BENEFIT_ICON_OPTIONS = STUDIO_V2_BENEFIT_ICONS.map((icon) => ({
  label: icon,
  value: icon,
}));

const BENEFIT_ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield,
  car: Car,
  phone: Phone,
  clock: Clock,
  map: MapPin,
  star: Star,
  check: Check,
  wrench: Wrench,
  battery: Battery,
  fuel: Fuel,
};

export function toneClass(tone: BackgroundTone | HeroTone): string {
  return `vs2-tone-${tone}`;
}

export function renderMediaField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: string) => void;
}) {
  return (
    <StudioV2MediaInspector
      imageAssetId={String(value ?? '')}
      onChangeAssetId={(assetId) => onChange(assetId)}
    />
  );
}

export function renderHeroMedia(
  props: Record<string, unknown>,
  placeholder = 'Cliquez pour ajouter une image',
) {
  const imageAssetId =
    typeof props.imageAssetId === 'string' ? props.imageAssetId : undefined;
  const imageUrl = typeof props.imageUrl === 'string' ? props.imageUrl : undefined;
  const imageAlt = typeof props.imageAlt === 'string' ? props.imageAlt : '';
  const mediaStyle = buildImageMediaStyle(props);
  const imgStyle = buildImageElementStyle(props);

  if (imageAssetId || imageUrl) {
    return (
      <div
        className="vs2-hero__media"
        data-asset-id={imageAssetId || undefined}
        style={mediaStyle}
      >
        {imageAssetId ? (
          <AssetImage
            assetId={String(imageAssetId)}
            alt={imageAlt}
            className="vs2-hero__img"
            loadingClassName="vs2-hero__img"
            style={imgStyle}
          />
        ) : imageUrl ? (
          <img src={imageUrl} alt={imageAlt} className="vs2-hero__img" style={imgStyle} />
        ) : null}
      </div>
    );
  }

  return <EditorImagePlaceholder label={placeholder} />;
}

function EditorImagePlaceholder({ label }: { label: string }) {
  const actions = useStudioV2Actions();
  return (
    <div className="vs2-hero__media vs2-hero__media--empty vs2-editor-placeholder">
      <span className="vs2-hero__placeholder">{label}</span>
      {actions?.canWrite ? (
        <button
          type="button"
          className="vs2-image-add-btn"
          onClick={() => actions.onOpenMediaPicker?.()}
        >
          Ajouter une image
        </button>
      ) : null}
    </div>
  );
}

export function renderOfferMedia(props: Record<string, unknown>) {
  const imageAssetId =
    typeof props.imageAssetId === 'string' ? props.imageAssetId : undefined;
  const imageUrl = typeof props.imageUrl === 'string' ? props.imageUrl : undefined;
  const imageAlt = typeof props.imageAlt === 'string' ? props.imageAlt : '';
  const mediaStyle = buildImageMediaStyle(props);
  const imgStyle = buildImageElementStyle(props);

  if (imageAssetId || imageUrl) {
    return (
      <div className="vs2-offer__media" style={mediaStyle}>
        {imageAssetId ? (
          <AssetImage
            assetId={imageAssetId}
            alt={imageAlt}
            className="vs2-offer__img"
            loadingClassName="vs2-offer__img"
            style={imgStyle}
          />
        ) : (
          <img src={imageUrl} alt={imageAlt} className="vs2-offer__img" style={imgStyle} />
        )}
      </div>
    );
  }

  return <EditorImagePlaceholder label="Visuel véhicule — ajoutez une image" />;
}

export function leadFormConfigFromProps(props: Record<string, unknown>): LeadFormConfig {
  return {
    showCivility: props.showCivility !== false,
    useSplitName: props.splitFullName !== false,
    showEmail: props.showEmail !== false,
    showCity: props.showCity !== false,
    showVehicleModel: props.showVehicleModel !== false,
    showMessage: props.showMessage === true,
    showConsent: true,
  };
}

function renderLeadFieldInput(field: LeadFormFieldDef): ReactNode {
  const common = { disabled: true, readOnly: true, name: field.name };

  if (field.type === 'select' && field.options?.length) {
    return (
      <select className="lp-lead-form__input lp-lead-form__select" {...common} defaultValue="">
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        className="lp-lead-form__input lp-lead-form__textarea"
        rows={3}
        {...common}
      />
    );
  }

  return (
    <input
      className="lp-lead-form__input"
      type={field.type}
      autoComplete="on"
      {...common}
    />
  );
}

export function renderLeadFormFields(props: Record<string, unknown>): ReactNode {
  const fields = buildAutoHallLeadFormFields(leadFormConfigFromProps(props));
  const total = fields.length;

  return fields.map((field) => {
    const isFullWidth =
      field.fullWidth ||
      field.name === 'fullName' ||
      field.name === 'message' ||
      field.type === 'textarea' ||
      total <= 2;

    return (
      <label
        key={field.name}
        className={`lp-lead-form__field vs2-form__field${isFullWidth ? ' lp-lead-form__field--full vs2-form__field--full' : ''}`}
      >
        <span className="lp-lead-form__label">
          {field.label}
          {field.required ? ' *' : ''}
        </span>
        {renderLeadFieldInput(field)}
      </label>
    );
  });
}

export function renderBenefitIcon(icon?: string): ReactNode {
  const key = icon && BENEFIT_ICON_MAP[icon] ? icon : 'check';
  const Icon = BENEFIT_ICON_MAP[key] ?? Check;
  return <Icon className="vs2-benefit__icon" aria-hidden />;
}

export function padClass(spacing: SpacingPreset): string {
  return `vs2-pad-${spacing}`;
}

export function alignClass(alignment: ContentAlignment): string {
  return `vs2-align-${alignment}`;
}

export function maxWidthClass(maxWidth: ContainerMaxWidth): string {
  return `vs2-max-${maxWidth}`;
}

export function columnGapClass(gap: ColumnGap): string {
  return `vs2-gap-${gap}`;
}

type SlotComponentProps = {
  allow?: string[];
  minEmptyHeight?: string;
};

export function wrapSlotZone(
  Slot: ComponentType<SlotComponentProps>,
  allow: readonly string[],
  minEmptyHeight: string,
) {
  return (
    <div className="vs2-slot-zone">
      <Slot allow={[...allow]} minEmptyHeight={minEmptyHeight} />
      <div className="vs2-slot-empty-state" aria-hidden>
        <p className="vs2-slot-empty-state__title">Aucun bloc dans cette zone</p>
        <p className="vs2-slot-empty-state__hint">
          Glissez un bloc depuis le panneau gauche ou appliquez un modèle.
        </p>
      </div>
    </div>
  );
}
