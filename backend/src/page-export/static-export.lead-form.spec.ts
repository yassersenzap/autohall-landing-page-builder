import {
  STATIC_LEAD_FORM_JS,
  LEAD_FORM_SUCCESS_HTML,
  buildLandingConfigJs,
  deriveApiBaseUrl,
} from './static-export.builder';

describe('static export lead form', () => {
  it('deriveApiBaseUrl strips the public leads path', () => {
    expect(
      deriveApiBaseUrl('https://api.autohall.ma/api/public/leads'),
    ).toBe('https://api.autohall.ma');
    expect(deriveApiBaseUrl('http://localhost:3000/api/public/leads/')).toBe(
      'http://localhost:3000',
    );
  });

  it('buildLandingConfigJs embeds absolute leadEndpoint and apiBaseUrl', () => {
    const js = buildLandingConfigJs({
      leadEndpoint: 'https://api.autohall.ma/api/public/leads',
      apiBaseUrl: 'https://api.autohall.ma',
      campaignId: 'camp-1',
      landingPageId: 'lp-1',
      pageVersionId: 'pv-1',
      landingSlug: 'offre-clio',
    });

    expect(js).toContain('"leadEndpoint":"https://api.autohall.ma/api/public/leads"');
    expect(js).toContain('"apiBaseUrl":"https://api.autohall.ma"');
  });

  it('STATIC_LEAD_FORM_JS resolves file:// sourceUrl and absolute lead endpoint', () => {
    expect(STATIC_LEAD_FORM_JS).toContain('function resolveSourceUrl()');
    expect(STATIC_LEAD_FORM_JS).toContain(
      "return 'http://offline-test.autohall.local'",
    );
    expect(STATIC_LEAD_FORM_JS).toContain('sourceUrl: resolveSourceUrl()');
    expect(STATIC_LEAD_FORM_JS).toContain('function resolveLeadEndpoint(cfg)');
    expect(STATIC_LEAD_FORM_JS).toContain('fetch(leadEndpoint, {');
    expect(STATIC_LEAD_FORM_JS).not.toContain('fetch(config.leadEndpoint');
  });

  it('STATIC_LEAD_FORM_JS replaces the form with a styled success panel', () => {
    expect(STATIC_LEAD_FORM_JS).toContain('function showSuccessState(form)');
    expect(STATIC_LEAD_FORM_JS).toContain('showSuccessState(form)');
    expect(LEAD_FORM_SUCCESS_HTML).toContain('Demande envoyée avec succès');
    expect(LEAD_FORM_SUCCESS_HTML).toContain(
      'Un conseiller Auto Hall vous contactera dans les plus brefs délais.',
    );
    expect(STATIC_LEAD_FORM_JS).not.toContain('Lead received successfully');
  });
});
