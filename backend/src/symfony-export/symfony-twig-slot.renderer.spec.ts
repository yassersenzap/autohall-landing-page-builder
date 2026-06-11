import { describe, expect, it } from '@jest/globals';
import { SYMFONY_TESTDRIVE_INCLUDE_PATHS } from './symfony-include-mapping';
import {
  renderSymfonyCampaignPageExample,
  renderSymfonyTestDriveTwigSlot,
} from './symfony-twig-slot.renderer';

describe('symfony-twig-slot.renderer', () => {
  it('generates Twig slot with only whitelisted include path', () => {
    const twig = renderSymfonyTestDriveTwigSlot({
      includeKey: 'testdrive_campaign',
    });

    expect(twig).toContain("{% include 'form/testdrive/_campaign_form.html.twig'");
    expect(twig).toContain('data-include-key="testdrive_campaign"');
    expect(twig).toContain('formtestdrive: formtestdrive');
    expect(twig).toContain('currentLocale: currentLocale');
    expect(twig).not.toContain('../../../');
    expect(twig).not.toMatch(/vite|localhost:5173|\/studio/i);
  });

  it('maps each whitelisted key to a controlled include path', () => {
    for (const [key, path] of Object.entries(SYMFONY_TESTDRIVE_INCLUDE_PATHS)) {
      const twig = renderSymfonyTestDriveTwigSlot({
        includeKey: key as keyof typeof SYMFONY_TESTDRIVE_INCLUDE_PATHS,
      });
      expect(twig).toContain(`{% include '${path}'`);
      expect(twig).toContain(`data-include-key="${key}"`);
    }
  });

  it('page example references fragment without secrets or studio URLs', () => {
    const page = renderSymfonyCampaignPageExample({
      pageTitle: 'Ford Promo',
      fragmentTemplatePath: 'builder/campaign-lead-hero.fragment.html.twig',
    });

    expect(page).toContain("{% extends 'base.html.twig' %}");
    expect(page).toContain('campaign-lead-hero.fragment.html.twig');
    expect(page).not.toMatch(/api[_-]?key|password|secret/i);
    expect(page).not.toMatch(/vite|localhost:5173|\/studio/i);
  });
});
