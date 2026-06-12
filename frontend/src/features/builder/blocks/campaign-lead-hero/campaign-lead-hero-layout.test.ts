import { describe, expect, it } from 'vitest';
import {
  deriveFormSideFromLayout,
  formPositionConflictsWithLayout,
  normalizeFormPosition,
} from './campaign-lead-hero-layout';
import { sanitizeBlockVisualPatch } from '@/features/builder/block-visual';

describe('campaign-lead-hero layout normalization', () => {
  it('derives form side from layoutVariant', () => {
    expect(deriveFormSideFromLayout('media_left_form_right')).toBe('right');
    expect(deriveFormSideFromLayout('form_left_media_right')).toBe('left');
    expect(deriveFormSideFromLayout('background_media_form_left')).toBe('left');
  });

  it('normalizes conflicting formPosition to layout side', () => {
    expect(normalizeFormPosition('media_left_form_right', 'left')).toBe('right');
    expect(normalizeFormPosition('form_left_media_right', 'right')).toBe('left');
    expect(normalizeFormPosition('media_left_form_right', 'right')).toBe('right');
  });

  it('detects formPosition conflicts', () => {
    expect(formPositionConflictsWithLayout('media_left_form_right', 'left')).toBe(true);
    expect(formPositionConflictsWithLayout('media_left_form_right', 'right')).toBe(false);
  });

  it('sanitizeBlockVisualPatch applies layout-aware formPosition', () => {
    const sanitized = sanitizeBlockVisualPatch(
      'campaign_lead_hero',
      { formPosition: 'left', formWidth: 'lg' },
      { layoutVariant: 'media_left_form_right' },
    );
    expect(sanitized.formPosition).toBe('right');
    expect(sanitized.formWidth).toBe('lg');
  });
});
