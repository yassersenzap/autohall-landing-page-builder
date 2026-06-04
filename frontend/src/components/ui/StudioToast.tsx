import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudioToastState } from './use-studio-toast';

type StudioToastProps = {
  toast: StudioToastState;
  onDismiss: () => void;
};

export function StudioToast({ toast, onDismiss }: StudioToastProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      className={cn(
        'fixed bottom-4 right-4 z-[100] flex max-w-sm items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg',
        toast.type === 'success'
          ? 'border-emerald-500/30 bg-emerald-950 text-emerald-50'
          : 'border-destructive/40 bg-destructive/95 text-destructive-foreground',
      )}
    >
      <p className="flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
        aria-label="Fermer"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
