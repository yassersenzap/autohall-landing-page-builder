import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export type ShadTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export function ShadTextarea({ className, label, hint, id, ...props }: ShadTextareaProps) {
  const areaId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const field = (
    <textarea
      id={areaId}
      className={cn(
        'flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
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
      <Label htmlFor={areaId}>{label}</Label>
      {field}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
