import { describe, expect, it } from 'vitest';
import {
  getCriticalPageReadinessIssues,
  getPageReadinessIssues,
  getPageReadinessStatus,
} from './page-readiness';

describe('getPageReadinessIssues', () => {
  it('detects hero without title', () => {
    const issues = getPageReadinessIssues(
      [
        {
          type: 'hero',
          propsJson: { title: '', buttonText: 'Go', imageUrl: 'https://x.test/a.jpg' },
        },
        { type: 'lead_form', propsJson: { submitText: 'Envoyer' } },
      ],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    expect(issues.some((i) => i.code.startsWith('hero-title'))).toBe(true);
  });

  it('treats hero without image as warning not critical', () => {
    const issues = getPageReadinessIssues(
      [
        {
          type: 'hero',
          propsJson: { title: 'Offre', buttonText: 'Go', imageUrl: '', imageAssetId: '' },
        },
        {
          type: 'lead_form',
          propsJson: {
            submitText: 'Envoyer',
            consentLabel: 'J’accepte.',
            formConfig: { showConsent: true },
          },
        },
      ],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    const heroImage = issues.find((i) => i.code.startsWith('hero-image'));
    expect(heroImage?.severity).toBe('warning');
    expect(getPageReadinessStatus(issues)).not.toBe('blocked');
  });

  it('blocks when lead form is missing', () => {
    const issues = getPageReadinessIssues(
      [{ type: 'hero_campaign', propsJson: { title: 'T', buttonText: 'Go' } }],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    expect(issues.some((i) => i.code === 'lead-form-missing' && i.severity === 'critical')).toBe(
      true,
    );
    expect(getPageReadinessStatus(issues)).toBe('blocked');
  });

  it('core_campaign_form_landing satisfies form requirement', () => {
    const issues = getPageReadinessIssues(
      [
        {
          type: 'core_campaign_form_landing',
          propsJson: {
            title: 'Campagne',
            submitText: 'Envoyer',
            consentLabel: 'J’accepte.',
            formConfig: { showConsent: true },
          },
        },
      ],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    expect(issues.some((i) => i.code === 'lead-form-missing')).toBe(false);
  });

  it('hero_form_campaign satisfies form requirement', () => {
    const issues = getPageReadinessIssues(
      [
        {
          type: 'hero_form_campaign',
          propsJson: {
            title: 'Campagne',
            form: {
              submitText: 'Envoyer',
              consentLabel: 'J’accepte.',
              formConfig: { showConsent: true },
            },
          },
        },
      ],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    expect(issues.some((i) => i.code === 'lead-form-missing')).toBe(false);
  });

  it('detects missing SEO fields as warnings', () => {
    const issues = getPageReadinessIssues(
      [
        {
          type: 'hero',
          propsJson: { title: 'T', buttonText: 'Go', imageAssetId: 'asset-1', alt: 'x' },
        },
        {
          type: 'lead_form',
          propsJson: {
            submitText: 'Envoyer',
            consentLabel: 'J’accepte.',
            formConfig: { showConsent: true },
          },
        },
      ],
      { seoTitle: '', seoDescription: '' },
    );
    expect(issues.some((i) => i.code === 'seo-title' && i.severity === 'warning')).toBe(true);
    expect(getCriticalPageReadinessIssues(issues).length).toBe(0);
  });

  it('detects lead form without submit button text', () => {
    const issues = getPageReadinessIssues(
      [
        { type: 'hero', propsJson: { title: 'T', buttonText: 'Go' } },
        { type: 'lead_form', propsJson: { submitText: '' } },
      ],
      { seoTitle: 'T', seoDescription: 'D' },
    );
    expect(issues.some((i) => i.code.startsWith('lead-form-submit'))).toBe(true);
  });
});
