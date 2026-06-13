import { asPropString } from '@/features/builder-engine/lib/block-props';
import { resolveHeroFocalPoint } from '@/features/builder/blocks/hero-vehicle-offer/hero-image-controls';
import {
  patchCoreFormModeFields,
} from '@/features/builder/blocks/core-campaign-form-landing/core-campaign-form-landing.inspector-controls';
import type {
  CoreFieldsPreset,
  CoreFormMode,
} from '@/features/builder/blocks/core-campaign-form-landing/core-campaign-form-landing.defaults';
import { BRAND_PRESETS } from '@/features/builder/brand-presets';
import type { BrandPresetId } from '@/features/builder/brand-presets';
import type { InspectorControl } from '@/features/builder/block-registry/inspector-control.types';
import { Label, ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { FieldHint } from '../../components/BlockInspectorPanel.shared';
import { MediaFieldControl } from '../../components/MediaFieldControl';
import {
  buildMediaValuePatch,
  mediaValueFromKeys,
} from '../../components/media-field-utils';
import {
  buildControlPatch,
  groupControlsBySection,
  readControlValue,
} from './inspector-control-utils';
import { RepeaterControl } from './RepeaterControl';

type InspectorControlRendererProps = {
  controls: InspectorControl[];
  blockType: string;
  propsJson: Record<string, unknown>;
  blockId: string;
  onPatch: (patch: Record<string, unknown>) => void;
  emptyMessage?: string;
};

function InspectorField({
  control,
  blockType,
  propsJson,
  blockId,
  onPatch,
}: {
  control: InspectorControl;
  blockType: string;
  propsJson: Record<string, unknown>;
  blockId: string;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const fieldId = `inspector-${blockId}-${control.key}`;
  const value = readControlValue(propsJson, control);
  const apply = (next: string | number | boolean) => {
    let patch = buildControlPatch(propsJson, control, next);
    if (blockType === 'core_campaign_form_landing') {
      if (control.propKey === 'formMode') {
        patch = { ...patch, ...patchCoreFormModeFields(next as CoreFormMode) };
      } else if (control.propKey === 'fieldsPreset') {
        const formMode = (asPropString(propsJson.formMode) || 'test_drive') as CoreFormMode;
        patch = {
          ...patch,
          ...patchCoreFormModeFields(formMode, next as CoreFieldsPreset),
        };
      }
    }
    onPatch(patch);
  };

  if (control.type === 'repeater') {
    return (
      <RepeaterControl
        control={control}
        blockType={blockType}
        propsJson={propsJson}
        blockId={blockId}
        onPatch={onPatch}
      />
    );
  }

  if (control.type === 'brand') {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId} className="text-neutral-400">
          {control.label}
        </Label>
        <select
          id={fieldId}
          value={asPropString(value) || 'ford'}
          onChange={(e) => apply(e.target.value as BrandPresetId)}
          className="flex h-9 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-200"
        >
          {BRAND_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
        {control.description ? <FieldHint>{control.description}</FieldHint> : null}
      </div>
    );
  }

  if (control.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId} className="text-neutral-400">
          {control.label}
        </Label>
        <ShadTextarea
          id={fieldId}
          rows={2}
          value={asPropString(value)}
          maxLength={control.maxLength}
          placeholder={control.placeholder}
          onChange={(e) => apply(e.target.value)}
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
        {control.description ? <FieldHint>{control.description}</FieldHint> : null}
      </div>
    );
  }

  if (control.type === 'text') {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId} className="text-neutral-400">
          {control.label}
        </Label>
        <ShadInput
          id={fieldId}
          value={asPropString(value)}
          maxLength={control.maxLength}
          placeholder={control.placeholder}
          onChange={(e) => apply(e.target.value)}
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
        {control.description ? <FieldHint>{control.description}</FieldHint> : null}
      </div>
    );
  }

  if (control.type === 'number') {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId} className="text-neutral-400">
          {control.label}
        </Label>
        <ShadInput
          id={fieldId}
          type="number"
          min={control.min}
          max={control.max}
          step={control.step}
          value={String(value)}
          onChange={(e) => apply(Number(e.target.value))}
          className="border-neutral-700 bg-neutral-900 text-neutral-200"
        />
        {control.description ? <FieldHint>{control.description}</FieldHint> : null}
      </div>
    );
  }

  if (control.type === 'range') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={fieldId} className="text-neutral-400">
            {control.label}
          </Label>
          <span className="text-xs tabular-nums text-neutral-500">{String(value)}</span>
        </div>
        <input
          id={fieldId}
          type="range"
          min={control.min ?? 0}
          max={control.max ?? 100}
          step={control.step ?? 1}
          value={Number(value)}
          onChange={(e) => apply(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>
    );
  }

  if (control.type === 'boolean') {
    return (
      <label
        htmlFor={fieldId}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950/50 px-3 py-2"
      >
        <span className="text-sm text-neutral-300">{control.label}</span>
        <input
          id={fieldId}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => apply(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 accent-blue-500"
        />
      </label>
    );
  }

  if (control.type === 'color') {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId} className="text-neutral-400">
          {control.label}
        </Label>
        <div className="flex items-center gap-2">
          <input
            id={fieldId}
            type="color"
            value={asPropString(value) || '#b91c1c'}
            onChange={(e) => apply(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-neutral-700 bg-neutral-900"
          />
          <ShadInput
            value={asPropString(value)}
            onChange={(e) => apply(e.target.value)}
            className="border-neutral-700 bg-neutral-900 font-mono text-neutral-200"
          />
        </div>
      </div>
    );
  }

  if (control.type === 'segmented') {
    const current = asPropString(value);
    return (
      <div className="space-y-1.5">
        <Label className="text-neutral-400">{control.label}</Label>
        <div className="flex flex-wrap gap-1">
          {control.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                'rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                current === opt.value
                  ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                  : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500',
              )}
              onClick={() => apply(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {control.description ? <FieldHint>{control.description}</FieldHint> : null}
      </div>
    );
  }

  if (
    control.type === 'select' ||
    control.type === 'layout-variant' ||
    control.type === 'spacing'
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId} className="text-neutral-400">
          {control.label}
        </Label>
        <select
          id={fieldId}
          value={asPropString(value)}
          onChange={(e) => apply(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-200"
        >
          {control.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {control.description ? <FieldHint>{control.description}</FieldHint> : null}
      </div>
    );
  }

  if (control.type === 'image' || control.type === 'asset') {
    const mediaValue = mediaValueFromKeys(
      propsJson,
      control.assetKey,
      control.urlKey,
      control.altKey,
    );
    const imageFit = asPropString(propsJson.imageFit) || 'cover';
    const focal = control.enableFocalPicker ? resolveHeroFocalPoint(propsJson) : null;
    const showFocalPicker = Boolean(control.enableFocalPicker && imageFit === 'cover');
    return (
      <MediaFieldControl
        label={control.label}
        value={mediaValue}
        assetKey={control.assetKey}
        urlKey={control.urlKey}
        helperText={control.description}
        showAlt={!control.altKey}
        showObjectFit={false}
        showFocalPicker={showFocalPicker}
        focalPoint={focal ? { x: focal.x, y: focal.y } : undefined}
        onFocalChange={
          showFocalPicker
            ? (x, y) =>
                onPatch({
                  cropPreset: 'custom',
                  focalPointX: x,
                  focalPointY: y,
                })
            : undefined
        }
        onChange={(next) =>
          onPatch(
            buildMediaValuePatch(control.assetKey, control.urlKey, control.altKey, next),
          )
        }
      />
    );
  }

  return null;
}

export function InspectorControlRenderer({
  controls,
  blockType,
  propsJson,
  blockId,
  onPatch,
  emptyMessage = 'Aucun paramètre pour cet onglet.',
}: InspectorControlRendererProps) {
  if (controls.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-neutral-800 bg-neutral-950/40 px-3 py-4 text-xs text-neutral-500">
        {emptyMessage}
      </p>
    );
  }

  const sections = groupControlsBySection(controls);

  return (
    <div className="space-y-4" data-testid="definition-driven-inspector">
      {sections.map(({ group, controls: sectionControls }) => (
        <div
          key={group ?? 'default'}
          className={cn(
            'space-y-3',
            group
              ? 'space-y-2.5 rounded-lg bg-neutral-950/30 p-2.5'
              : undefined,
          )}
        >
          {group ? (
            <p className="text-[0.6875rem] font-medium text-neutral-500">{group}</p>
          ) : null}
          <div className="space-y-3">
            {sectionControls.map((control) => (
              <InspectorField
                key={control.key}
                control={control}
                blockType={blockType}
                propsJson={propsJson}
                blockId={blockId}
                onPatch={onPatch}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
