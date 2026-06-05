import { CAMPAIGN_BLOCK_NEUTRAL_DEFAULTS } from './campaign-block-defaults';
import { BUILDER_NEUTRAL_DEFAULT_PROPS } from './neutral-default-props';

export function getDefaultBlockProps(type: string): Record<string, unknown> {
  if (type in CAMPAIGN_BLOCK_NEUTRAL_DEFAULTS) {
    return JSON.parse(
      JSON.stringify(CAMPAIGN_BLOCK_NEUTRAL_DEFAULTS[type]),
    ) as Record<string, unknown>;
  }
  if (type in BUILDER_NEUTRAL_DEFAULT_PROPS) {
    return JSON.parse(
      JSON.stringify(BUILDER_NEUTRAL_DEFAULT_PROPS[type]),
    ) as Record<string, unknown>;
  }
  return {};
}
