import { Label } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type TextAlignmentButtonsProps = {
  value: string;
  onChange: (align: 'left' | 'center' | 'right') => void;
  fieldKey?: string;
};

export function TextAlignmentButtons({ value, onChange }: TextAlignmentButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {(['left', 'center', 'right'] as const).map((align) => (
        <button
          key={align}
          type="button"
          className={cn(
            'rounded-md border px-2 py-1.5 text-xs transition-colors',
            value === align
              ? 'border-blue-500 bg-blue-500/15 text-blue-200'
              : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500',
          )}
          onClick={() => onChange(align)}
        >
          {align === 'left' ? 'Gauche' : align === 'center' ? 'Centre' : 'Droite'}
        </button>
      ))}
    </div>
  );
}

export function TextAlignmentField({
  label,
  value,
  onChange,
  hint,
}: {
  label?: string;
  value: string;
  onChange: (align: 'left' | 'center' | 'right') => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      {label ? <Label className="text-neutral-400">{label}</Label> : null}
      <TextAlignmentButtons value={value} onChange={onChange} />
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
