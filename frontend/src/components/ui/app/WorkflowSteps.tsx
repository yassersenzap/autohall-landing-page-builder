import { cn } from '@/lib/utils';

export type WorkflowStep = {
  id: string;
  label: string;
  active?: boolean;
  done?: boolean;
};

type WorkflowStepsProps = {
  steps: WorkflowStep[];
  className?: string;
};

export function WorkflowSteps({ steps, className }: WorkflowStepsProps) {
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-2', className)}
      aria-label="Étapes du parcours"
    >
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
              step.active
                ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)] text-foreground shadow-[0_0_16px_var(--color-accent-soft)]'
                : step.done
                  ? 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-muted-foreground'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                step.active
                  ? 'bg-[var(--color-accent)] text-white shadow-[0_0_10px_var(--color-accent-soft)]'
                  : step.done
                    ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                    : 'bg-[var(--color-surface-3)] text-muted-foreground',
              )}
            >
              {step.done && !step.active ? '✓' : index + 1}
            </span>
            {step.label}
          </span>
          {index < steps.length - 1 ? (
            <span className="hidden text-[var(--color-text-soft)] sm:inline" aria-hidden>
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
