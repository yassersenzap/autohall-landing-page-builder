import { CheckCircle } from 'lucide-react';

type FormSuccessPanelProps = {
  className?: string;
};

/** Confirmation centrée après soumission réussie d'un formulaire lead. */
export function FormSuccessPanel({ className }: FormSuccessPanelProps) {
  return (
    <div
      className={`flex min-h-[14rem] flex-col items-center justify-center gap-4 px-6 py-10 text-center${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
    >
      <CheckCircle
        className="h-14 w-14 shrink-0 text-emerald-600"
        strokeWidth={1.5}
        aria-hidden
      />
      <div className="max-w-xs space-y-2">
        <h3
          className="text-lg font-semibold tracking-tight text-neutral-900"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Demande envoyée avec succès.
        </h3>
        <p className="text-sm leading-relaxed text-neutral-600">
          Un conseiller Auto Hall vous contactera dans les plus brefs délais.
        </p>
      </div>
    </div>
  );
}
