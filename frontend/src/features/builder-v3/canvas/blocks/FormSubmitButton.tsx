import { Loader2 } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FormSubmitButtonProps = {
  submitting: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  tabIndex?: number;
  type?: 'button' | 'submit';
};

export function FormSubmitButton({
  submitting,
  disabled,
  className,
  style,
  children,
  tabIndex,
  type = 'submit',
}: FormSubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || submitting}
      tabIndex={tabIndex}
      style={style}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        className,
        (disabled || submitting) && 'cursor-not-allowed opacity-50',
      )}
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>Envoi en cours…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
