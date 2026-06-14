/** Scroll fluide vers un bloc dans l'iframe canvas (sélection sidebar / calques). */
export function scrollStudioIframeToBlock(
  iframe: HTMLIFrameElement | null,
  blockId: string,
): void {
  if (!iframe) return;
  const doc = iframe.contentDocument;
  if (!doc) return;

  const el = doc.querySelector<HTMLElement>(`[data-canvas-block-id="${blockId}"]`);
  if (!el) return;

  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    iframe.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const host = iframe.closest('[data-builder-v3-canvas-host]');
    if (!(host instanceof HTMLElement)) return;

    const elRect = el.getBoundingClientRect();
    const iframeRect = iframe.getBoundingClientRect();
    const targetTop =
      host.scrollTop + (iframeRect.top - host.getBoundingClientRect().top) + elRect.top;
    const centered = targetTop - (host.clientHeight - elRect.height) / 2;
    host.scrollTo({ top: Math.max(0, centered), behavior: 'smooth' });
  });
}

export const STUDIO_SCROLL_TO_BLOCK_EVENT = 'studio:scroll-to-block';

export type StudioScrollToBlockDetail = { blockId: string };

export function dispatchStudioScrollToBlock(blockId: string): void {
  window.dispatchEvent(
    new CustomEvent<StudioScrollToBlockDetail>(STUDIO_SCROLL_TO_BLOCK_EVENT, {
      detail: { blockId },
    }),
  );
}
