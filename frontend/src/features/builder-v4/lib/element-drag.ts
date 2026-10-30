export type BlockId = string;

/** Canvas / palette drag identifiers — aligned with studio block registry. */
export type ElementBlockId = BlockId;

export const ELEMENT_BLOCK_DRAG_MIME = 'application/x-v4-element-block';

export const ELEMENT_BLOCK_LABELS: Record<ElementBlockId, string> = {
  'hero': 'Hero',
  'hero-form': 'Hero + Form',
  'text-block': 'Text',
  'image-block': 'Image',
  'video-block': 'Video',
  'button-block': 'Button',
  'form-block': 'Form',
  'features-grid': 'Features',
  'gallery-block': 'Gallery',
  'faq-block': 'FAQ',
  'stats-banner': 'Stats',
  'cta-banner': 'CTA Banner',
  'footer-block': 'Footer',
  'testimonials-block': 'Testimonials',
  'alternating-showcase': 'Alternating Showcase',
};

export function setElementDragData(event: { dataTransfer: DataTransfer }, blockId: ElementBlockId): void {
  event.dataTransfer.setData(ELEMENT_BLOCK_DRAG_MIME, blockId);
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('text/plain', ELEMENT_BLOCK_LABELS[blockId] ?? blockId);
}

export function parseElementBlockDrag(dataTransfer: DataTransfer): ElementBlockId | null {
  const raw = dataTransfer.getData(ELEMENT_BLOCK_DRAG_MIME);
  if (!raw) return null;
  return raw as ElementBlockId;
}

export function hasElementDragPayload(dataTransfer: DataTransfer): boolean {
  return Boolean(dataTransfer.getData(ELEMENT_BLOCK_DRAG_MIME));
}

export function readElementDragData(dataTransfer: DataTransfer): ElementBlockId | null {
  return parseElementBlockDrag(dataTransfer);
}
