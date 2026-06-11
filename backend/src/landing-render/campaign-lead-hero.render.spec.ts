import { renderCampaignLeadHeroHtml } from './campaign-lead-hero.render';
import { renderBlockHtml } from './block-renderer';

describe('campaign-lead-hero.render', () => {
  const baseProps = {
    brandId: 'chery',
    campaignTitle: 'Nouvelle Chery Tiggo 8',
    campaignSubtitle: 'Réservez votre essai en concession',
    offerBadge: 'Offre de lancement',
    formTitle: 'Demandez votre offre',
    formSubtitle: 'Un conseiller vous recontacte sous 24h',
    formStepLabel: 'Étape 1 sur 3',
    formPrimaryFieldLabel: 'Sélectionnez un modèle',
    formCtaLabel: 'Continuer',
    legalText: 'En soumettant ce formulaire, vous acceptez d’être contacté.',
    footerText: 'Photos non contractuelles.',
    layoutVariant: 'media_left_form_right',
    contentPlacement: 'hidden',
    imageFit: 'cover',
    overlayIntensity: 'light',
    design: { tone: 'light', showOfferBadge: true, showProgressBar: true, formTheme: 'light' },
  };

  it('renders campaign form shell with light form theme class', () => {
    const html = renderCampaignLeadHeroHtml(baseProps);

    expect(html).toContain('lp-campaign-lead-hero');
    expect(html).toContain('lp-campaign-lead-hero--layout-media_left_form_right');
    expect(html).toContain('lp-campaign-lead-hero--form-theme-light');
    expect(html).toContain('lp-campaign-lead-hero--content-hidden');
    expect(html).toContain('Demandez votre offre');
    expect(html).toContain('lp-campaign-lead-hero__form-card');
    expect(html).toContain('lp-campaign-lead-hero__media-stage');
    expect(html).not.toContain('lp-campaign-lead-hero__campaign--overlay');
  });

  it('outputs reversed layout classes for form_left_media_right', () => {
    const html = renderCampaignLeadHeroHtml({
      ...baseProps,
      layoutVariant: 'form_left_media_right',
    });

    expect(html).toContain('lp-campaign-lead-hero--layout-form_left_media_right');
    expect(html).toMatch(/lp-campaign-lead-hero__form[\s\S]*lp-campaign-lead-hero__media-stage/);
  });

  it('escapes user strings', () => {
    const html = renderCampaignLeadHeroHtml({
      ...baseProps,
      contentPlacement: 'beside_form',
      campaignTitle: 'Campagne <script>',
      formTitle: 'Titre <img onerror>',
      legalText: 'Légal & droits',
    });

    expect(html).toContain('Campagne &lt;script&gt;');
    expect(html).toContain('Titre &lt;img onerror&gt;');
    expect(html).toContain('Légal &amp; droits');
    expect(html).not.toContain('<script>');
  });

  it('background variant outputs overlay modifier and beside copy', () => {
    const html = renderCampaignLeadHeroHtml({
      ...baseProps,
      layoutVariant: 'background_media_form_right',
      overlayIntensity: 'heavy',
      contentPlacement: 'beside_form',
    });

    expect(html).toContain('lp-campaign-lead-hero--layout-background_media_form_right');
    expect(html).toContain('lp-campaign-lead-hero--overlay-heavy');
    expect(html).toContain('lp-campaign-lead-hero__campaign--beside');
    expect(html).toContain('Nouvelle Chery Tiggo 8');
  });

  it('supports dual media layout with both images safely', () => {
    const html = renderCampaignLeadHeroHtml({
      ...baseProps,
      layoutVariant: 'dual_media_form_right',
      contentPlacement: 'overlay_media',
      primaryImage: 'primary-id',
      secondaryImage: 'secondary-id',
    });

    expect(html).toContain('lp-campaign-lead-hero--layout-dual_media_form_right');
    expect(html).toContain('lp-campaign-lead-hero__dual-media');
    expect(html).toContain('lp-campaign-lead-hero__media-primary');
    expect(html).toContain('lp-campaign-lead-hero__media-secondary');
    expect(html).toContain('lp-campaign-lead-hero__campaign--overlay');
  });

  it('exports images with relative asset paths', () => {
    const html = renderCampaignLeadHeroHtml(
      {
        ...baseProps,
        primaryImage: 'hero-asset',
        secondaryImage: 'secondary-asset',
        layoutVariant: 'dual_media_form_left',
        contentPlacement: 'overlay_media',
      },
      {
        mode: 'export',
        assetMap: {
          'hero-asset': {
            previewUrl: 'http://localhost:3000/api/assets/hero',
            exportPath: 'assets/images/chery-hero.jpg',
            storagePath: 'pv/hero.jpg',
            storedName: 'hero.jpg',
            mimeType: 'image/jpeg',
            absolutePath: '/tmp/hero.jpg',
          },
          'secondary-asset': {
            previewUrl: 'http://localhost:3000/api/assets/secondary',
            exportPath: 'assets/images/chery-secondary.jpg',
            storagePath: 'pv/secondary.jpg',
            storedName: 'secondary.jpg',
            mimeType: 'image/jpeg',
            absolutePath: '/tmp/secondary.jpg',
          },
        },
      },
    );

    expect(html).toContain('src="assets/images/chery-hero.jpg"');
    expect(html).toContain('src="assets/images/chery-secondary.jpg"');
    expect(html).not.toContain('/api/assets/');
    expect(html).not.toContain('blob:');
  });

  it('does not include React or private builder references', () => {
    const html = renderCampaignLeadHeroHtml(baseProps);

    expect(html).not.toContain('react');
    expect(html).not.toContain('React');
    expect(html).not.toContain('vite');
    expect(html).not.toContain('/studio');
    expect(html).not.toContain('localhost:5173');
    expect(html).not.toContain('data:');
    expect(html).not.toContain('blob:');
  });

  it('shows Symfony placeholder note without Twig syntax in static HTML', () => {
    const html = renderCampaignLeadHeroHtml({
      ...baseProps,
      formProviderType: 'autohall_symfony_testdrive',
      symfonyFormIncludeKey: 'testdrive_campaign',
    });

    expect(html).toContain('Formulaire Symfony Auto Hall');
    expect(html).toContain('lp-campaign-lead-hero__provider-note');
    expect(html).not.toMatch(/\{%|\{\{/);
    expect(html).not.toContain('_campaign_form.html.twig');
  });

  it('routes through renderBlockHtml', () => {
    const html = renderBlockHtml({
      blockType: 'campaign_lead_hero',
      sortOrder: 1,
      propsJson: baseProps,
    });

    expect(html).toContain('lp-campaign-lead-hero');
    expect(html).toContain('Demandez votre offre');
  });
});
