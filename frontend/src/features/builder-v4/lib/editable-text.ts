import type {
  BuilderNode,
  ButtonNodeProps,
  FormNodeProps,
  TextNodeProps,
} from '../types/nodes.types';
import type { EditableFieldKey } from '../types/editable.types';
import { resolveFormSteps } from './form-steps';

function activeStepIndex(props: FormNodeProps): number {
  const steps = resolveFormSteps(props);
  if (!steps.length) return 0;
  const raw = props.previewStepIndex ?? 0;
  return Math.min(Math.max(0, raw), steps.length - 1);
}

function readCampaignStepTitle(props: FormNodeProps): string {
  const steps = resolveFormSteps(props);
  const step = steps[activeStepIndex(props)];
  return step?.title ?? props.stepTitle ?? props.title ?? '';
}

function readCampaignStepDescription(props: FormNodeProps): string {
  const steps = resolveFormSteps(props);
  const step = steps[activeStepIndex(props)];
  return step?.description ?? props.stepDescription ?? props.subtitle ?? '';
}

function writeCampaignStepPatch(
  props: FormNodeProps,
  field: 'title' | 'description',
  value: string,
): Partial<FormNodeProps> {
  const steps = resolveFormSteps(props);
  if (!steps.length) {
    return field === 'title'
      ? { stepTitle: value, title: value }
      : { stepDescription: value, subtitle: value };
  }
  const index = activeStepIndex(props);
  const nextSteps = steps.map((step, i) =>
    i === index ? { ...step, [field]: value } : step,
  );
  const current = nextSteps[index];
  return {
    steps: nextSteps,
    ...(field === 'title'
      ? { stepTitle: current.title, title: current.title }
      : { stepDescription: current.description, subtitle: current.description }),
  };
}

export function readTextField(node: BuilderNode, fieldKey: EditableFieldKey): string {
  switch (fieldKey) {
    case 'text':
      if (node.kind === 'text') {
        const props = node.props as TextNodeProps;
        return props.text ?? props.content ?? '';
      }
      return '';
    case 'button.label':
      if (node.kind === 'button') return (node.props as ButtonNodeProps).label;
      return '';
    case 'form.stepTitle':
      if (node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block') {
        const props = node.props as FormNodeProps;
        if (props.variant === 'campaign' || props.steps?.length) {
          return readCampaignStepTitle(props);
        }
        return props.stepTitle ?? props.title ?? '';
      }
      return '';
    case 'form.stepDescription':
      if (node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block') {
        const props = node.props as FormNodeProps;
        if (props.variant === 'campaign' || props.steps?.length) {
          return readCampaignStepDescription(props);
        }
        return props.stepDescription ?? props.subtitle ?? '';
      }
      return '';
    case 'form.submitLabel':
      if (node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block') return (node.props as FormNodeProps).submitLabel;
      return '';
    case 'form.currentStepLabel':
      if (node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block') return (node.props as FormNodeProps).currentStepLabel;
      return '';
    default:
      return '';
  }
}

export function writeTextFieldPatch(
  node: BuilderNode,
  fieldKey: EditableFieldKey,
  value: string,
): Partial<BuilderNode['props']> | null {
  switch (fieldKey) {
    case 'text':
      if (node.kind === 'text') return { text: value, content: value };
      return null;
    case 'button.label':
      if (node.kind === 'button') return { label: value };
      return null;
    case 'form.stepTitle':
      if (node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block') {
        const props = node.props as FormNodeProps;
        if (props.variant === 'campaign' || props.steps?.length) {
          return writeCampaignStepPatch(props, 'title', value);
        }
        return { stepTitle: value, title: value };
      }
      return null;
    case 'form.stepDescription':
      if (node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block') {
        const props = node.props as FormNodeProps;
        if (props.variant === 'campaign' || props.steps?.length) {
          return writeCampaignStepPatch(props, 'description', value);
        }
        return { stepDescription: value, subtitle: value };
      }
      return null;
    case 'form.submitLabel':
      if (node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block') return { submitLabel: value };
      return null;
    case 'form.currentStepLabel':
      if (node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block') return { currentStepLabel: value };
      return null;
    default:
      return null;
  }
}

export function isFieldEditable(node: BuilderNode, fieldKey: EditableFieldKey): boolean {
  if (node.visibility.locked) return false;
  switch (fieldKey) {
    case 'text':
      if (node.kind !== 'text') return false;
      return (node.props as TextNodeProps).editable !== false;
    case 'button.label':
      return node.kind === 'button';
    case 'form.stepTitle':
    case 'form.stepDescription':
    case 'form.submitLabel':
    case 'form.currentStepLabel':
      return node.kind === 'form' || (node.props as any)?.blockType === 'hero-form' || (node.props as any)?.blockType === 'form-block';
    default:
      return false;
  }
}
