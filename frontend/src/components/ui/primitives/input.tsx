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
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );

  if (!label) return field;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      {field}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
