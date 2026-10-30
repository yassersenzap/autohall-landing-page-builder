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
    expect(html).toContain('lp-core-campaign-landing--premium');
    expect(html).toContain(`lp-core-campaign-landing--${coreLayout}`);
    expect(html).toContain('lp-core-campaign-landing__premium-split');
    expect(html).toContain('lp-lead-form');
    expect(html).toContain('Sélection du véhicule');
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

  it('renders multi-step indicator driven by formSteps JSON', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      formSteps: [
        { title: 'Sélection du véhicule', type: 'select' },
        { title: 'Vos coordonnées', type: 'inputs' },
        { title: 'Confirmation', type: 'inputs' },
      ],
      stepIndex: 2,
    });
    expect(html).toContain('lp-core-campaign-landing__step-progress');
    expect(html).toContain('lp-core-campaign-landing__step-progress-fill');
    expect(html).toContain('Étape 2/3');
    expect(html).toContain('style="width:67%"');
    expect(html).toContain('data-lp-form-step="1"');
    expect(html).toContain('data-lp-form-step="2"');
    expect(html).toContain('data-lp-form-step="3"');
    expect(html).toContain('data-lp-form-advance');
    expect(html).toContain('data-lp-form-back');
    expect(html).toContain('name="vehicleModel"');
    expect(html).toContain('Tiggo 7 Pro');
    expect(html).toContain('lp-btn--primary');
  });

  it('renders campaign banner image with object-contain and without on-media copy', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      visualType: 'campaign_image',
    });
    expect(html).toContain('lp-core-campaign-landing--visual-campaign_image');
    expect(html).toContain('object-fit:contain');
    expect(html).not.toContain('lp-core-campaign-landing__content--on-media');
    expect(html).not.toContain('lp-core-campaign-landing__media-scrim');
  });

  it('honors explicit image fit and focal position in exported markup', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      visualType: 'campaign_image',
      imageFit: 'cover',
      imagePositionX: 18,
      imagePositionY: 72,
    });
    expect(html).toContain('object-fit:cover');
    expect(html).toContain('object-position:18% 72%');
  });

  it('renders test_drive fields with city and preferred date', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      formMode: 'test_drive',
    });
    expect(html).toContain('name="city"');
    expect(html).toContain('name="preferredDate"');
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
    expect(blocked).toContain('lp-core-campaign-landing__media-placeholder');
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
      formSteps: [{ title: 'Form & co', type: 'inputs' }],
    });
    expect(html).toContain('Form &amp; co');
    expect(html).not.toContain('<script>');
  });

  it('exports section spacing and layout presentation as inline styles and classes', () => {
    const html = renderCoreCampaignFormLandingHtml({
      ...baseProps,
      marketingStackOrder: 'media-first',
      formVerticalAlign: 'center',
      sectionStyle: {
        sectionPaddingTop: '48px',
        sectionPaddingBottom: '32px',
        contentMaxWidth: '1200px',
      },
    });

    expect(html).toContain('lp-core-campaign-landing--marketing-media-first');
    expect(html).toContain('lp-core-campaign-landing--form-align-center');
    expect(html).toContain('padding-top: 48px');
    expect(html).toContain('padding-bottom: 32px');
    expect(html).toContain('--lp-section-content-max-width: 1200px');
    expect(html).toContain('lp-section-style');
  });
});
