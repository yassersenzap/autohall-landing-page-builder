import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import {
  createDefaultCollectionItem,
  readCollectionArray,
} from '@/features/builder/collection-editor/collection-sanitizer';
import { getCollectionSchema } from '@/features/builder/collection-editor/collection-schemas';
import type { CollectionItemField } from '@/features/builder/collection-editor/collection-field.types';
import type { InspectorRepeaterControl } from '@/features/builder/block-registry/inspector-control.types';
import { MediaFieldControl } from '../../components/MediaFieldControl';
import {
  buildMediaValuePatch,
  mediaValueFromKeys,
} from '../../components/media-field-utils';
import { Label, ShadButton, ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type RepeaterControlProps = {
  control: InspectorRepeaterControl;
  blockType: string;
  propsJson: Record<string, unknown>;
  blockId: string;
  onPatch: (patch: Record<string, unknown>) => void;
};

function readItemPreview(item: Record<string, unknown>, previewField: string, fallback: string): string {
  const value = asPropString(item[previewField]);
  return value || fallback;
}

function CollectionItemFieldInput({
  field,
  item,
  onItemPatch,
}: {
  field: CollectionItemField;
  item: Record<string, unknown>;
  onItemPatch: (patch: Record<string, unknown>) => void;
}) {
  const value = field.type === 'asset' ? item : item[field.key];

  if (field.type === 'asset') {
    return (
      <MediaFieldControl
        label={field.label}
        value={mediaValueFromKeys(item, field.assetKey, field.urlKey, field.altKey)}
        onChange={(next) =>
          onItemPatch(buildMediaValuePatch(field.assetKey, field.urlKey, field.altKey, next))
        }
        showObjectFit={false}
        className="rounded-md border border-neutral-800/80 bg-neutral-950/30 p-2"
      />
    );
  }

  const onChange = (next: unknown) => onItemPatch({ [field.key]: next });

  if (field.type === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-950/40 px-2.5 py-2">
        <span className="text-xs text-neutral-400">{field.label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-blue-500"
        />
      </label>
    );
  }

  if (field.type === 'string-list') {
    const lines = Array.isArray(value) ? value.join('\n') : asPropString(value);
    return (
      <div className="space-y-1">
        <Label className="text-xs text-neutral-400">{field.label}</Label>
        <ShadTextarea
          rows={3}
          value={lines}
          placeholder={field.placeholder}
          onChange={(e) =>
            onChange(
              e.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
          className="border-neutral-700 bg-neutral-900 text-xs text-neutral-200"
        />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1">
        <Label className="text-xs text-neutral-400">{field.label}</Label>
        <ShadTextarea
          rows={2}
          value={asPropString(value)}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="border-neutral-700 bg-neutral-900 text-xs text-neutral-200"
        />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="space-y-1">
        <Label className="text-xs text-neutral-400">{field.label}</Label>
        <select
          value={asPropString(value) || field.defaultValue || field.options[0]?.value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-8 w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 text-xs text-neutral-200"
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const placeholder =
    field.type === 'text' || field.type === 'url' || field.type === 'number'
      ? field.placeholder
      : undefined;
  const maxLength = field.type === 'text' ? field.maxLength : undefined;

  return (
    <div className="space-y-1">
      <Label className="text-xs text-neutral-400">{field.label}</Label>
      <ShadInput
        value={asPropString(value)}
        type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)
        }
        className="h-8 border-neutral-700 bg-neutral-900 text-xs text-neutral-200"
      />
    </div>
  );
}

export function RepeaterControl({
  control,
  blockType,
  propsJson,
  blockId,
  onPatch,
}: RepeaterControlProps) {
  const schema = getCollectionSchema(blockType, control.propKey);
  const items = readCollectionArray(propsJson, control.propKey);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length > 0 ? 0 : null);

  if (!schema) return null;

  const minItems = control.minItems ?? schema.minItems ?? 0;
  const maxItems = control.maxItems ?? schema.maxItems ?? 12;
  const canAdd = items.length < maxItems;
  const canReorder = control.reorder !== false;
  const canDuplicate = control.duplicate !== false;

  const commitItems = (next: Record<string, unknown>[]) => {
    onPatch({ [control.propKey]: next });
  };

  const updateItem = (index: number, patch: Record<string, unknown>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    commitItems(next);
  };

  const addItem = () => {
    const next = [...items, createDefaultCollectionItem(schema)];
    commitItems(next);
    setExpandedIndex(next.length - 1);
  };

  const duplicateItem = (index: number) => {
    if (!canDuplicate || items.length >= maxItems) return;
    const copy = { ...items[index] };
    const next = [...items.slice(0, index + 1), copy, ...items.slice(index + 1)];
    commitItems(next);
    setExpandedIndex(index + 1);
  };

  const removeItem = (index: number) => {
    if (items.length <= minItems) return;
    const next = items.filter((_, i) => i !== index);
    commitItems(next);
    setExpandedIndex((current) => {
      if (current === null) return null;
      if (current === index) return Math.max(0, index - 1);
      if (current > index) return current - 1;
      return current;
    });
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    commitItems(next);
    setExpandedIndex(target);
  };

  return (
    <div
      className="space-y-2"
      data-testid={`repeater-${blockId}-${control.propKey}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-400">{control.label}</p>
        <ShadButton
          type="button"
          size="sm"
          variant="secondary"
          className="h-7 gap-1 border-neutral-700 bg-neutral-900 px-2 text-[0.6875rem] text-neutral-200"
          disabled={!canAdd}
          onClick={addItem}
          data-testid={`repeater-add-${control.key}`}
        >
          <Plus className="h-3 w-3" aria-hidden />
          {control.addItemLabel ?? 'Ajouter'}
        </ShadButton>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-800 px-3 py-3 text-xs text-neutral-500">
          {control.emptyState ?? 'Aucun élément.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => {
            const expanded = expandedIndex === index;
            const preview = readItemPreview(
              item,
              control.previewField,
              `${control.itemLabel} ${index + 1}`,
            );
            return (
              <li
                key={`${control.key}-item-${index}`}
                className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950/50"
                data-testid={`repeater-item-${control.key}-${index}`}
              >
                <div className="flex items-center gap-1 border-b border-neutral-800/80 px-2 py-1.5">
                  {canReorder ? (
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-neutral-600" aria-hidden />
                  ) : null}
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-xs font-medium text-neutral-200"
                    onClick={() => setExpandedIndex(expanded ? null : index)}
                  >
                    {preview}
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {canReorder ? (
                      <>
                        <button
                          type="button"
                          aria-label="Monter"
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                          onClick={() => moveItem(index, -1)}
                          data-testid={`repeater-up-${control.key}-${index}`}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Descendre"
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                          onClick={() => moveItem(index, 1)}
                          data-testid={`repeater-down-${control.key}-${index}`}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : null}
                    {canDuplicate ? (
                      <button
                        type="button"
                        aria-label="Dupliquer"
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                        onClick={() => duplicateItem(index)}
                        data-testid={`repeater-duplicate-${control.key}-${index}`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      aria-label="Supprimer"
                      className={cn(
                        'rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-red-300',
                        items.length <= minItems && 'pointer-events-none opacity-30',
                      )}
                      onClick={() => removeItem(index)}
                      data-testid={`repeater-delete-${control.key}-${index}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {expanded ? (
                  <div className="space-y-2.5 p-2.5">
                    {control.itemFields.map((field) => (
                      <CollectionItemFieldInput
                        key={field.key}
                        field={field}
                        item={item}
                        onItemPatch={(patch) => updateItem(index, patch)}
                      />
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
