import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva('ah-btn', {
  variants: {
    variant: {
      default: 'ah-btn--primary',
      secondary: 'ah-btn--secondary',
      ghost: 'ah-btn--ghost',
      outline: 'ah-btn--outline',
      accent: 'ah-btn--accent',
      destructive: 'ah-btn--destructive',
    },
    size: {
      default: 'ah-btn--md',
      sm: 'ah-btn--sm',
      lg: 'ah-btn--lg',
      icon: 'ah-btn--sm !min-w-[2rem] !w-8 !p-0',
      'icon-sm': 'ah-btn--sm !min-w-[1.75rem] !w-7 !p-0',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

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
