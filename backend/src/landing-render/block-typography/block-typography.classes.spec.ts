import {
  appendBlockTypographyToClass,
  buildBlockTypographyClasses,
} from './block-typography.classes';

describe('block-typography.classes', () => {
  it('emits typography classes for supported blocks', () => {
    const classes = buildBlockTypographyClasses(
      {
        typography: {
          titleScale: 'display',
          subtitleScale: 'lg',
          titleWeight: 'semibold',
        },
      },
      'hero_vehicle_offer',
    );

    expect(classes).toContain('lp-typo-title-display');
    expect(classes).toContain('lp-typo-subtitle-lg');
    expect(classes).toContain('lp-typo-weight-semibold');
  });

  it('sanitizes invalid typography values to defaults (no extra classes)', () => {
    const classes = buildBlockTypographyClasses(
      {
        typography: {
          titleScale: 'invalid',
          titleWeight: 'invalid',
        },
      },
      'faq',
    );

    expect(classes).toBe('');
  });

  it('appends typography classes to section base class', () => {
    const result = appendBlockTypographyToClass(
      'lp-campaign-lead-hero',
      'campaign_lead_hero',
      { typography: { titleScale: 'xl', textMaxWidth: 'md' } },
    );

    expect(result).toContain('lp-campaign-lead-hero');
    expect(result).toContain('lp-typo-title-xl');
    expect(result).toContain('lp-typo-max-md');
  });
});
