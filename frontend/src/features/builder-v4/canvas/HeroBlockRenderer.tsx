/**
 * Canonical page renderer — shared by canvas preview, export HTML, and deployed landings.
 * Editor interaction chrome wraps this via CanvasLayer; do not fork render logic elsewhere.
 */
export { FrameDocumentRenderer as HeroBlockRenderer, FrameDocumentRenderer } from './FrameRenderer';
