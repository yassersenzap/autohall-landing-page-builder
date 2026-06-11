import { asPropString } from '@/features/builder-engine/lib/block-props';
import { BRAND_PRESETS } from '@/features/builder/brand-presets';
import type { BrandPresetId } from '@/features/builder/brand-presets';
import type { InspectorControl } from '@/features/builder/block-registry/inspector-control.types';
import { Label, ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { FieldHint } from '../../components/BlockInspectorPanel.shared';
import { MediaFieldControl, type MediaFieldValue } from '../../components/MediaFieldControl';
import {
  buildControlPatch,
  groupControlsBySection,
  readControlValue,
} from './inspector-control-utils';

type InspectorControlRendererProps = {
  controls: InspectorControl[];
  propsJson: Record<string, unknown>;
  blockId: string;
  onPatch: (patch: Record<string, unknown>) => void;
  emptyMessage?: string;
};

function mediaValueFromKeys(
  propsJson: Record<string, unknown>,
  assetKey: string,
  urlKey: string,
  altKey?: string,
): MediaFieldValue {
  return {
    imageAssetId: asPropString(propsJson[assetKey]),
    imageUrl: asPropString(propsJson[urlKey]),
    alt: altKey ? asPropString(propsJson[altKey]) : undefined,
  };
}

function patchMediaKeys(
  onPatch: (patch: Record<string, unknown>) => void,
  assetKey: string,
  urlKey: string,
  altKey: string | undefined,
  next: MediaFieldValue,
): void {
  const patch: Record<string, unknown> = {
    [assetKey]: next.imageAssetId ?? '',
    [urlKey]: next.imageUrl ?? '',
  };
  if (altKey && next.alt !== undefined) {
    patch[altKey] = next.alt;
  }
  onPatch(patch);
}

function InspectorField({
  control,
  propsJson,
  blockId,
  onPatch,
}: {
  control: InspectorControl;
  propsJson: Record<string, unknown>;
  blockId: string;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const fieldId = `inspector-${blockId}-${control.key}`;
  const value = readControlValue(propsJson, control);
  const apply = (next: string | number | boolean) => {
    onPatch(buildControlPatch(propsJson, control, next));
  };

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
    return (
      <div className="space-y-2">
        <MediaFieldControl
          label={control.label}
          value={mediaValue}
          onChange={(next) =>
            patchMediaKeys(onPatch, control.assetKey, control.urlKey, control.altKey, next)
          }
        />
        {control.description ? <FieldHint>{control.description}</FieldHint> : null}
      </div>
    );
  }

  return null;
}

export function InspectorControlRenderer({
  controls,
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
              ? 'rounded-md border border-neutral-800 bg-neutral-950/40 p-3'
              : undefined,
          )}
        >
          {group ? (
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {group}
            </p>
          ) : null}
          <div className="space-y-3">
            {sectionControls.map((control) => (
              <InspectorField
                key={control.key}
                control={control}
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
