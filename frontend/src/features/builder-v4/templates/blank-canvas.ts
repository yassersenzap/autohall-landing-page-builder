import type { BuilderDocument } from '../types/nodes.types';
import { createEmptyPageDocument } from '../lib/studio-compat.js';

export { createEmptyPageDocument as createBlankCanvasDocument };

export function isBlankCanvasDocument(document: BuilderDocument): boolean {
  return document.meta?.templateId === 'blank';
}
