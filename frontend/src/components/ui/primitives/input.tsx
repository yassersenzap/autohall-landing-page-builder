import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export type ShadInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function ShadInput({ className, label, hint, id, ...props }: ShadInputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const field = (
    <input
      id={inputId}
      className={cn('ah-input', className)}
      {...props}
    />
  );

  if (!label) return field;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={inputId} className="ah-label">
        {label}
      </Label>
      {field}
      {hint ? <p className="ah-caption">{hint}</p> : null}
    </div>
  );
}
