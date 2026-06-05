/** Routes officielles du Landing Studio (éditeur Auto Hall). */

export function getStudioRoute(pageVersionId: string): string {
  return `/page-versions/${pageVersionId}/studio`;
}

export function getPreviewRoute(pageVersionId: string): string {
  return `/page-versions/${pageVersionId}/studio/preview`;
}

/** @deprecated use getStudioRoute */
export function landingStudioPath(pageVersionId: string): string {
  return getStudioRoute(pageVersionId);
}

/** @deprecated use getPreviewRoute */
export function landingStudioPreviewPath(pageVersionId: string): string {
  return getPreviewRoute(pageVersionId);
}
