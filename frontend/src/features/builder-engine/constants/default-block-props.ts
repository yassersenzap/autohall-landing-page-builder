import {
  DEFAULT_EDITOR_BLOCK_PROPS,
  type EditorBlockType,
} from '@/features/landing/landing-block-catalog';

export function getDefaultBlockProps(type: string): Record<string, unknown> {
  const key = type as EditorBlockType;
  if (key in DEFAULT_EDITOR_BLOCK_PROPS) {
    return JSON.parse(
      JSON.stringify(DEFAULT_EDITOR_BLOCK_PROPS[key]),
    ) as Record<string, unknown>;
  }
  return {};
}
