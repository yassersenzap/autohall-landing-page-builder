import { describe, expect, it } from '@jest/globals';
import { buildGrapesExportIndexHtml } from './design-document.builder';

describe('design-document.builder', () => {
  it('export HTML references lead-form.js not inline secrets', () => {
    const html = buildGrapesExportIndexHtml(
      { title: 'Test', campaignName: 'Camp', brand: 'Auto Hall' },
      '<main class="lp-page"><form class="lp-lead-form"><input name="fullName" /><input name="phone" /></form></main>',
    );
    expect(html).toContain('js/lead-form.js');
    expect(html).toContain('js/landing-config.js');
    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('Bearer ');
  });
});
