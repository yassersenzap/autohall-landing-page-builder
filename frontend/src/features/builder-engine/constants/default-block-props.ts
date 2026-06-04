import { BUILDER_NEUTRAL_DEFAULT_PROPS } from './neutral-default-props';

export function getDefaultBlockProps(type: string): Record<string, unknown> {
  if (type in BUILDER_NEUTRAL_DEFAULT_PROPS) {
    return JSON.parse(
      JSON.stringify(BUILDER_NEUTRAL_DEFAULT_PROPS[type]),
    ) as Record<string, unknown>;
  }
  return {};
}
