import { describe, expect, it } from 'vitest';
import {
  getPreviewRoute,
  getStudioRoute,
  landingStudioPath,
  landingStudioPreviewPath,
} from './landing-studio-routes';

describe('landing-studio-routes', () => {
  const id = '11111111-1111-1111-1111-111111111111';

  it('exposes centralized studio and preview routes', () => {
    expect(getStudioRoute(id)).toBe(`/page-versions/${id}/studio`);
    expect(getPreviewRoute(id)).toBe(`/page-versions/${id}/studio/preview`);
  });

  it('keeps legacy aliases aligned with official routes', () => {
    expect(landingStudioPath(id)).toBe(getStudioRoute(id));
    expect(landingStudioPreviewPath(id)).toBe(getPreviewRoute(id));
  });
});
