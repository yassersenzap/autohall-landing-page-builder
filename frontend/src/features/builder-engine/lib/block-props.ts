import { resolveLeadFormFieldsFromProps } from '../constants/autohall-lead-form';
import type { HeroBlockProps, LeadFormBlockProps } from '../types';

export function asPropString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function parseHeroProps(propsJson: Record<string, unknown>): HeroBlockProps {
  return {
    eyebrow: asPropString(propsJson.eyebrow),
    title: asPropString(propsJson.title),
    subtitle: asPropString(propsJson.subtitle),
    buttonText: asPropString(propsJson.buttonText),
    buttonTarget: asPropString(propsJson.buttonTarget) || '#lead-form',
    secondaryButtonText: asPropString(propsJson.secondaryButtonText),
    secondaryButtonTarget: asPropString(propsJson.secondaryButtonTarget) || '#offer',
    imageUrl: asPropString(propsJson.imageUrl),
    imageAssetId: asPropString(propsJson.imageAssetId),
    alt: asPropString(propsJson.alt),
  };
}

export function parseLeadFormProps(propsJson: Record<string, unknown>): LeadFormBlockProps {
  const reassurance = Array.isArray(propsJson.reassurance)
    ? propsJson.reassurance.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    title: asPropString(propsJson.title),
    subtitle: asPropString(propsJson.subtitle),
    submitText: asPropString(propsJson.submitText) || 'Envoyer votre demande',
    privacyNote: asPropString(propsJson.privacyNote),
    reassurance,
    fields: resolveLeadFormFieldsFromProps(propsJson),
  };
}
