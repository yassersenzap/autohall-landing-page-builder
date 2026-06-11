import { describe, expect, it } from '@jest/globals';
import {
  parseCampaignLeadHeroFormIntegration,
  sanitizeSymfonyIncludeKey,
} from './export-contracts.registry';

describe('export-contracts.registry', () => {
  it('rejects raw Twig paths as include keys', () => {
    expect(sanitizeSymfonyIncludeKey('../../../secret.html.twig')).toBe(
      'testdrive_campaign',
    );
    expect(sanitizeSymfonyIncludeKey('form/{{ evil }}')).toBe('testdrive_campaign');
    expect(sanitizeSymfonyIncludeKey('{% include "x" %}')).toBe('testdrive_campaign');
  });

  it('accepts only whitelisted include keys', () => {
    expect(sanitizeSymfonyIncludeKey('testdrive_model')).toBe('testdrive_model');
    expect(sanitizeSymfonyIncludeKey('unknown_key')).toBe('testdrive_campaign');
  });

  it('falls back provider and export target for invalid values', () => {
    const parsed = parseCampaignLeadHeroFormIntegration({
      formProviderType: 'not_a_provider',
      exportTarget: 'symfony_raw',
      symfonyFormIncludeKey: 'evil/path.twig',
    });

    expect(parsed.formProviderType).toBe('builder_lead_api');
    expect(parsed.exportTarget).toBe('static_html');
    expect(parsed.symfonyFormIncludeKey).toBe('testdrive_campaign');
  });
});
