import { Plus, Trash2 } from 'lucide-react';
import { Label, ShadButton, ShadInput } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

export type ListFieldColumn = {
  key: string;
  label: string;
  placeholder?: string;
};

type ListFieldEditorProps = {
  label: string;
  columns: ListFieldColumn[];
  items: Record<string, unknown>[];
  disabled?: boolean;
  maxItems?: number;
  onChange: (items: Record<string, unknown>[]) => void;
};

function emptyRow(columns: ListFieldColumn[]): Record<string, unknown> {
  return Object.fromEntries(columns.map((col) => [col.key, '']));
}

export function ListFieldEditor({
  label,
  columns,
  items,
  disabled = false,
  maxItems = 6,
  onChange,
}: ListFieldEditorProps) {
  const rows = items.length > 0 ? items : [emptyRow(columns)];

  function updateRow(index: number, key: string, value: string) {
    const next = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [key]: value } : row,
    );
    onChange(next.filter((row) => columns.some((col) => String(row[col.key] ?? '').trim())));
  }

  function addRow() {
    if (rows.length >= maxItems) return;
    onChange([...rows, emptyRow(columns)]);
  }

  function removeRow(index: number) {
    const next = rows.filter((_, rowIndex) => rowIndex !== index);
    onChange(next.length > 0 ? next : [emptyRow(columns)]);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <Label className="mb-2 block">{label}</Label>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className={cn(
              'space-y-2 rounded-md border border-border/60 bg-background p-2.5',
              index > 0 && 'mt-2',
            )}
          >
            {columns.map((col) => (
              <ShadInput
                key={col.key}
                label={col.label}
                value={String(row[col.key] ?? '')}
                placeholder={col.placeholder}
                disabled={disabled}
                onChange={(e) => updateRow(index, col.key, e.target.value)}
              />
            ))}
            <ShadButton
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={disabled}
              onClick={() => removeRow(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Retirer
            </ShadButton>
          </div>
        ))}
      </div>
      <ShadButton
        type="button"
        size="sm"
        variant="secondary"
        className="mt-3 w-full"
        disabled={disabled || rows.length >= maxItems}
        onClick={addRow}
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter une ligne
      </ShadButton>
    </div>
  );
}
