import { describe, expect, it } from 'vitest';
import { buildDefaultStudioV2Document } from '../default-document';
import { validateStudioV2Readiness } from './readiness';

describe('validateStudioV2Readiness', () => {
  it('flags empty page as critical', () => {
    const issues = validateStudioV2Readiness({ root: { props: {} }, content: [] });
    expect(issues.some((i) => i.code === 'EMPTY_PAGE')).toBe(true);
  });

  it('accepts default document with form and hero', () => {
    const doc = buildDefaultStudioV2Document();
    const issues = validateStudioV2Readiness(doc);
    expect(issues.some((i) => i.code === 'NO_FORM')).toBe(false);
    expect(issues.some((i) => i.code === 'HERO_NO_TITLE')).toBe(false);
  });
});
