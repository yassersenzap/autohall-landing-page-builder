export type CoreFormStepDefinition = {
  title: string;
  type: 'select' | 'inputs';
};

export const DEFAULT_CORE_FORM_STEPS: CoreFormStepDefinition[] = [
  { title: 'Sélection du véhicule', type: 'select' },
  { title: 'Vos coordonnées', type: 'inputs' },
];

function isStepType(value: unknown): value is CoreFormStepDefinition['type'] {
  return value === 'select' || value === 'inputs';
}

export function resolveCoreFormSteps(props: Record<string, unknown>): CoreFormStepDefinition[] {
  const raw = props.formSteps;
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_CORE_FORM_STEPS;
  }

  const steps = raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => {
      const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Étape';
      const type = isStepType(item.type) ? item.type : 'inputs';
      return { title, type };
    });

  return steps.length > 0 ? steps : DEFAULT_CORE_FORM_STEPS;
}

export function resolveCoreFormStepCount(props: Record<string, unknown>): number {
  return resolveCoreFormSteps(props).length;
}
