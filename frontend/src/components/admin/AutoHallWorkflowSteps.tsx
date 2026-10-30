import { cn } from '@/lib/utils';

export type AutoHallWorkflowStep = {
  id: string;
  label: string;
  active?: boolean;
  done?: boolean;
};

type AutoHallWorkflowStepsProps = {
  steps: AutoHallWorkflowStep[];
  className?: string;
};

export function AutoHallWorkflowSteps({ steps, className }: AutoHallWorkflowStepsProps) {
  return (
    <ol
      className={cn('ah-target-workflow-steps flex flex-wrap items-center gap-2', className)}
      aria-label="Étapes du parcours"
    >
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-center gap-2">
          <span
            className={cn(
              'ah-target-workflow-step inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
              step.active && 'ah-target-workflow-step--active',
              step.done && !step.active && 'ah-target-workflow-step--done',
              !step.done && !step.active && 'ah-target-workflow-step--pending',
            )}
          >
            <span className="ah-target-workflow-step__index flex size-5 items-center justify-center rounded-full text-[10px] font-semibold">
              {step.done && !step.active ? '✓' : index + 1}
            </span>
            {step.label}
          </span>
          {index < steps.length - 1 ? (
            <span className="hidden text-muted-foreground sm:inline" aria-hidden>
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
