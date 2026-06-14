import { describe, expect, it } from '@jest/globals';
import { renderCoreCampaignFormLandingHtml } from './core-campaign-form-landing.render';
import { renderBlockHtml } from './block-renderer';

const LAYOUTS = [
  'image_left_form_right',
  'form_left_image_right',
  'background_image_form_card',
  'full_width_banner_form_side',
] as const;

describe('core-campaign-form-landing.render', () => {
  const baseProps: Record<string, unknown> = {
    title: 'Campagne Auto Hall',
    formTitle: 'Demandez votre offre',
    submitText: 'Suivant',
    consentLabel: 'J’accepte d’être contacté.',
    imageUrl: 'assets/campaign.jpg',
    alt: 'Visuel campagne',
    formMode: 'test_drive',
    formConfig: {
      showCivility: true,
      useSplitName: true,
      showCity: true,
      showEmail: true,
      showConsent: true,
    },
  };

  it.each(LAYOUTS)('renders layout variant %s (legacy coreLayout)', (coreLayout) => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      coreLayout,
    });
    expect(html).toContain('lp-core-campaign-landing');
    expect(html).toContain(`lp-core-campaign-landing--${coreLayout}`);
    expect(html).toContain('lp-lead-form');
    expect(html).toContain('Demandez votre offre');
  });

  it('derives CSS layout from layoutDirection + layoutVariant', () => {
    const banner = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      layoutDirection: 'image-left',
      layoutVariant: 'banner',
    });
    expect(banner).toContain('lp-core-campaign-landing--full_width_banner_form_side');

    const splitRight = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      layoutDirection: 'image-right',
      layoutVariant: 'split',
    });
    expect(splitRight).toContain('lp-core-campaign-landing--form_left_image_right');
  });

  it('renders multi-step indicator with progress bar', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      stepCount: 3,
      stepIndex: 2,
    });
    expect(html).toContain('lp-core-campaign-landing__step-progress');
    expect(html).toContain('lp-core-campaign-landing__step-progress-fill');
    expect(html).toContain('Étape 2/3');
    expect(html).toContain('style="width:67%"');
    expect(html).toContain('lp-btn--primary');
  });

  it('renders test_drive fields with city', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      formMode: 'test_drive',
    });
    expect(html).toContain('name="city"');
    expect(html).toContain('name="phone"');
  });

  it('renders model_interest with vehicle model field', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      formMode: 'model_interest',
      fieldsPreset: 'model_city',
      formConfig: {
        showCivility: true,
        useSplitName: true,
        showCity: true,
        showVehicleModel: true,
        showEmail: true,
        showConsent: true,
      },
    });
    expect(html).toContain('name="vehicleModel"');
    expect(html).toContain('name="city"');
  });

  it('resolves relative image paths and blocks unsafe URLs', () => {
    const safe = renderCoreCampaignFormLandingHtml(
      { ...baseProps, imageUrl: 'assets/hero.jpg', imageAssetId: '' },
      { mode: 'export', assetMap: {} },
    );
    expect(safe).toContain('src="assets/hero.jpg"');
    expect(safe).not.toContain('javascript:');

    const blocked = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      imageUrl: 'javascript:alert(1)',
      imageAssetId: '',
    });
    expect(blocked).not.toContain('javascript:alert');
    expect(blocked).toContain('lp-core-campaign-landing__media--placeholder');
  });

  it('export has no _studio metadata', () => {
    const html = renderBlockHtml({
      blockType: 'core_campaign_form_landing',
      sortOrder: 0,
      propsJson: {
        ...baseProps,
        _studioAppliedVariantId: 'hidden',
      },
    });
    expect(html).not.toContain('_studio');
    expect(html).not.toContain('localhost');
  });

  it('escapes user strings', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      title: 'Titre <script>',
      formTitle: 'Form & co',
    });
    expect(html).toContain('Titre &lt;script&gt;');
    expect(html).toContain('Form &amp; co');
    expect(html).not.toContain('<script>');
  });

  it('legacy campaign_lead_hero renderer still works', () => {
    const html = renderBlockHtml({
      blockType: 'campaign_lead_hero',
      sortOrder: 0,
      propsJson: {
        campaignTitle: 'Legacy hero',
        formTitle: 'Contact',
        layoutVariant: 'media_left_form_right',
      },
    });
    expect(html).toContain('lp-campaign-lead-hero');
  });
});
