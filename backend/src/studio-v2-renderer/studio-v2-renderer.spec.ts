import { describe, expect, it } from '@jest/globals';
import { buildDefaultStudioV2Document } from '../studio-v2/default-document';
import { buildStudioV2Html } from './build-html';
import { createRenderContext, renderPuckDocumentHtml, UnknownStudioV2ComponentError } from './render-puck-tree';
import { validateStudioV2Readiness } from './readiness';
import { DEFAULT_DESIGN_TOKENS } from './design-tokens';
import type { PuckDocument } from './types';

describe('Studio V2 renderer', () => {
  const document = buildDefaultStudioV2Document() as PuckDocument;

  it('renders hero and lead form from default document', () => {
    const ctx = createRenderContext({
      mode: 'export',
      assetMap: {},
      tokens: DEFAULT_DESIGN_TOKENS,
    });
    const html = renderPuckDocumentHtml(document, ctx);
    expect(html).toContain('vs2-hero');
    expect(html).toContain('lp-lead-form');
    expect(html).toContain('name="phone"');
    expect(html).toContain('name="consent"');
  });

  it('renders vehicle range cards', () => {
    const doc: PuckDocument = {
      root: { props: { title: 'Range' } },
      content: [
        {
          type: 'VehicleRange',
          props: {
            id: 'VehicleRange-1',
            title: 'Notre gamme',
            vehicles: [
              {
                name: 'Modèle A',
                priceText: 'À partir de …',
                imageUrl: 'https://cdn.example.com/a.jpg',
              },
            ],
          },
        },
      ],
    };
    const ctx = createRenderContext({
      mode: 'export',
      assetMap: {},
      tokens: DEFAULT_DESIGN_TOKENS,
    });
    const html = renderPuckDocumentHtml(doc, ctx);
    expect(html).toContain('vs2-range');
    expect(html).toContain('Modèle A');
  });

  it('refuses unknown components', () => {
    const ctx = createRenderContext({
      mode: 'export',
      assetMap: {},
      tokens: DEFAULT_DESIGN_TOKENS,
    });
    expect(() =>
      ctx.renderNode({ type: 'EvilWidget', props: { id: 'x' } }),
    ).toThrow(UnknownStudioV2ComponentError);
  });

  it('builds full HTML document', () => {
    const html = buildStudioV2Html({
      document,
      pageTitle: 'Test',
      assetMap: {},
      mode: 'export',
      includeScripts: true,
      stylesheetHref: 'assets/style.css',
    });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('assets/style.css');
    expect(html).toContain('lead-form.js');
    expect(html).not.toContain('localhost');
  });

  it('validates readiness on default document', () => {
    const issues = validateStudioV2Readiness(document);
    expect(issues.some((i) => i.code === 'NO_FORM')).toBe(false);
    expect(issues.some((i) => i.code === 'HERO_NO_TITLE')).toBe(false);
  });
});
