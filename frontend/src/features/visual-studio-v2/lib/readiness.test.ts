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

  it('warns when page title is missing', () => {
    const doc = buildDefaultStudioV2Document();
    const props = { ...(doc.root?.props as Record<string, unknown>), title: '' };
    const issues = validateStudioV2Readiness({ ...doc, root: { props } });
    expect(issues.some((i) => i.code === 'PAGE_TITLE_MISSING')).toBe(true);
  });

  it('flags form without consent as critical', () => {
    const doc = buildDefaultStudioV2Document();
    const json = JSON.stringify(doc);
    const patched = JSON.parse(json) as typeof doc;
    const walk = (nodes: unknown[]): void => {
      for (const node of nodes) {
        if (node && typeof node === 'object' && 'type' in node) {
          const n = node as { type: string; props: Record<string, unknown> };
          if (n.type === 'LeadFormAutoHall') n.props.consentText = '';
          for (const v of Object.values(n.props)) {
            if (Array.isArray(v)) walk(v);
          }
        }
      }
    };
    walk(patched.content ?? []);
    const issues = validateStudioV2Readiness(patched);
    expect(issues.some((i) => i.code === 'FORM_NO_CONSENT')).toBe(true);
  });
});
