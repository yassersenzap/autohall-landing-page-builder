import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export type ShadInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

const inputClassName = cn(
  'flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-[var(--color-input-bg)] px-3 py-2 text-sm text-foreground',
  'placeholder:text-muted-foreground',
  'transition-[border-color,box-shadow,background]',
  'hover:border-[var(--color-border-strong)]',
  'focus-visible:outline-none focus-visible:border-[var(--color-accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--studio-focus-ring)]',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export function ShadInput({ className, label, hint, id, ...props }: ShadInputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const field = <input id={inputId} className={cn(inputClassName, className)} {...props} />;

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
