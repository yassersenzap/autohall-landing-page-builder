import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type InspectorFieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function InspectorField({ label, children, className }: InspectorFieldProps) {
  return (
    <div className={cn('v4-inspector-v2__field', className)}>
      <span className="v4-inspector-v2__label">{label}</span>
      <div className="v4-inspector-v2__control">{children}</div>
    </div>
  );
}

type InspectorNumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export function InspectorNumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
}: InspectorNumberInputProps) {
  return (
    <input
      type="number"
      className="v4-inspector-v2__number"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

type InspectorSegmentedProps<T extends string> = {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
};

export function InspectorSegmented<T extends string>({
  value,
  options,
  onChange,
}: InspectorSegmentedProps<T>) {
  return (
    <div className="v4-inspector-v2__segmented" role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            'v4-inspector-v2__segmented-btn',
            value === option.value && 'v4-inspector-v2__segmented-btn--active',
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type InspectorColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function InspectorColorPicker({ value, onChange, label }: InspectorColorPickerProps) {
  const [open, setOpen] = useState(false);
  const safeValue = value || '#000000';

  return (
    <div className="v4-inspector-v2__color">
      <button
        type="button"
        className="v4-inspector-v2__color-swatch"
        style={{ background: safeValue }}
        aria-label={label ?? 'Couleur'}
        onClick={() => setOpen((current) => !current)}
      />
      {open ? (
        <div className="v4-inspector-v2__color-popover">
          <HexColorPicker color={safeValue} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
}

type InspectorSectionProps = {
  title: string;
  value: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function InspectorSection({ title, value, children, defaultOpen = true }: InspectorSectionProps) {
  return (
    <details className="v4-inspector-v2__section" open={defaultOpen} data-section={value}>
      <summary className="v4-inspector-v2__section-title">{title}</summary>
      <div className="v4-inspector-v2__section-body">{children}</div>
    </details>
  );
}

export function InspectorHint({ children }: { children: React.ReactNode }) {
  return <p className="v4-inspector-v2__hint">{children}</p>;
}
