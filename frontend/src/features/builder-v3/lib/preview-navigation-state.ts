/** Passed via react-router location.state when opening preview from the studio. */
export type StudioPreviewLocationState = {
  previewRevision?: number;
};

export function readPreviewRevision(state: unknown): number | undefined {
  if (!state || typeof state !== 'object') return undefined;
  const revision = (state as StudioPreviewLocationState).previewRevision;
  return typeof revision === 'number' && Number.isFinite(revision) ? revision : undefined;
}

export function buildPreviewNavigationState(previewRevision: number): StudioPreviewLocationState {
  return { previewRevision };
}
