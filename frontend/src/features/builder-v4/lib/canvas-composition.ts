import type { BuilderDocument } from '../types/nodes.types';
import { isDocumentEmpty } from './document-lifecycle';

/** @deprecated Use isDocumentEmpty — kept for existing imports. */
export function isCanvasEmpty(document: BuilderDocument): boolean {
  return isDocumentEmpty(document);
}
