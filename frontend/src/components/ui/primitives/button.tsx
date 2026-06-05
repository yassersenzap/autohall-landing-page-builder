import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[var(--radius-md)] border font-semibold tracking-tight',
    'transition-[background,border-color,color,box-shadow,transform,opacity]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:translate-y-px',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground border-[color-mix(in_srgb,var(--color-primary)_78%,#000)] shadow-sm hover:brightness-[0.96]',
        secondary:
          'bg-card text-foreground border-border shadow-sm hover:bg-muted hover:border-[var(--color-border-strong)]',
        ghost:
          'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
        outline:
          'border-border bg-transparent text-foreground hover:bg-muted hover:border-[var(--color-border-strong)]',
        accent:
          'border-[color-mix(in_srgb,var(--color-accent)_78%,#000)] bg-[var(--color-accent)] text-white shadow-sm hover:brightness-[1.05]',
        destructive:
          'border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[var(--color-danger-soft)] text-destructive hover:bg-[color-mix(in_srgb,var(--color-danger)_14%,var(--color-surface))]',
      },
      size: {
        default: 'h-10 px-4 text-sm',
        sm: 'h-8 gap-1.5 px-3 text-xs rounded-[var(--radius-sm)]',
        lg: 'h-11 px-5 text-base',
        icon: 'h-8 w-8 p-0',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function ShadButton({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { buttonVariants };
