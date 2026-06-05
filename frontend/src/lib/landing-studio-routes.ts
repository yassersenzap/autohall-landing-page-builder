/** Routes officielles du Landing Studio (éditeur Auto Hall). */

export function landingStudioPath(pageVersionId: string): string {
  return `/page-versions/${pageVersionId}/studio`;
}

export function landingStudioPreviewPath(pageVersionId: string): string {
  return `/page-versions/${pageVersionId}/studio/preview`;
}
