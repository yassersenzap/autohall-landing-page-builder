import { escapeHtml } from '../escape-html';
import type { PuckNode, StudioV2RenderContext } from '../types';

type SlotRenderer = (props: Record<string, unknown>) => string;

const SPACING_CLASS: Record<string, string> = {
  compact: 'vs2-pad-compact',
  normal: 'vs2-pad-normal',
  large: 'vs2-pad-large',
  hero: 'vs2-pad-hero',
};

const TONE_CLASS: Record<string, string> = {
  white: 'vs2-tone-white',
  light: 'vs2-tone-light',
  dark: 'vs2-tone-dark',
  brand: 'vs2-tone-brand',
  gradient: 'vs2-tone-gradient',
};

export function renderSection(
  props: Record<string, unknown>,
  renderSlots: SlotRenderer,
): string {
  const tone =
    typeof props.backgroundTone === 'string' ? props.backgroundTone : 'light';
  const spacing =
    typeof props.spacing === 'string'
      ? props.spacing
      : typeof props.spacingPreset === 'string'
        ? props.spacingPreset
        : 'normal';
  const fullHeight = props.fullHeight === true ? ' vs2-section--full' : '';
  const anchorId =
    typeof props.anchorId === 'string' && props.anchorId.trim()
      ? ` id="${escapeHtml(props.anchorId.trim())}"`
      : '';

  return `<section class="vs2-section ${TONE_CLASS[tone] ?? 'vs2-tone-light'} ${SPACING_CLASS[spacing] ?? 'vs2-pad-normal'}${fullHeight}"${anchorId}><div class="vs2-section__inner">${renderSlots(props)}</div></section>`;
}

export function renderContainer(
  props: Record<string, unknown>,
  renderSlots: SlotRenderer,
): string {
  const maxWidth =
    typeof props.maxWidth === 'string' ? props.maxWidth : 'standard';
  const align =
    props.align === 'center' || props.alignment === 'center'
      ? 'center'
      : 'left';

  return `<div class="vs2-container vs2-max-${escapeHtml(maxWidth)} vs2-align-${align}">${renderSlots(props)}</div>`;
}

export function renderColumns(
  props: Record<string, unknown>,
  renderSlots: SlotRenderer,
  ctx: StudioV2RenderContext & { renderNode: (node: PuckNode) => string },
): string {
  const ratio =
    typeof props.columnRatio === 'string'
      ? props.columnRatio.replace('-', '_')
      : '50_50';
  const gap = typeof props.columnGap === 'string' ? props.columnGap : 'normal';
  const valign =
    props.verticalAlign === 'center' || props.verticalAlign === 'bottom'
      ? props.verticalAlign
      : 'top';
  const stack =
    props.mobileStack === 'right_first'
      ? 'vs2-columns--right-first'
      : 'vs2-columns--left-first';
  const align = props.alignment === 'center' ? 'center' : 'left';

  const left = Array.isArray(props.left)
    ? (props.left as Array<{ type: string; props: Record<string, unknown> }>)
    : [];
  const right = Array.isArray(props.right)
    ? (props.right as Array<{ type: string; props: Record<string, unknown> }>)
    : [];

  const renderChildren = (nodes: typeof left) =>
    nodes.map((node) => ctx.renderNode(node)).join('');

  return `<div class="vs2-columns vs2-ratio-${escapeHtml(ratio)} vs2-gap-${escapeHtml(gap)} vs2-valign-${valign} vs2-align-${align} ${stack}"><div class="vs2-columns__col">${renderChildren(left)}</div><div class="vs2-columns__col">${renderChildren(right)}</div></div>`;
}
