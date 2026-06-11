import { describe, expect, it } from 'vitest';
import { buildSectionStyleClasses } from './section-style.classes';
import { buildSectionStyleInspectorControls } from './section-style.inspector-controls';
import { parseSectionStyle, sanitizeSectionStylePatch } from './section-style.registry';

describe('section-style contract', () => {
  it('applies defaults when sectionStyle is missing', () => {
    const style = parseSectionStyle({});
    expect(style.sectionPaddingY).toBe('md');
    expect(style.containerWidth).toBe('default');
    expect(style.sectionBackground).toBe('default');
  });

  it('sanitizes unknown enum values', () => {
    const style = parseSectionStyle({
      sectionStyle: {
        sectionPaddingY: 'huge',
        containerWidth: 'mega',
        sectionBackground: 'neon',
      },
    });
    expect(style.sectionPaddingY).toBe('md');
    expect(style.containerWidth).toBe('default');
    expect(style.sectionBackground).toBe('default');
  });

  it('builds stable BEM classes', () => {
    const classes = buildSectionStyleClasses(
      parseSectionStyle({
        sectionStyle: {
          sectionPaddingY: 'lg',
          containerWidth: 'narrow',
          sectionBackground: 'brand',
          hideOnMobile: true,
        },
      }),
    );
    expect(classes).toContain('lp-section-style--pad-y-lg');
    expect(classes).toContain('lp-section-style--container-narrow');
    expect(classes).toContain('lp-section-style--bg-brand');
    expect(classes).toContain('lp-section-style--hide-mobile');
  });

  it('exposes style controls only for supported blocks', () => {
    expect(buildSectionStyleInspectorControls('faq').length).toBeGreaterThan(0);
    expect(buildSectionStyleInspectorControls('hero_campaign')).toHaveLength(0);
  });

  it('patches section padding via sanitized merge shape', () => {
    const patch = sanitizeSectionStylePatch({ sectionPaddingY: 'xl' });
    expect(patch.sectionPaddingY).toBe('xl');
    expect(sanitizeSectionStylePatch({ sectionPaddingY: 'evil' }).sectionPaddingY).toBe(
      'md',
    );
  });
});
