import { describe, expect, it } from '@jest/globals';
import { renderBlockHtml } from '../landing-render/block-renderer';

describe('campaign block renderer', () => {
  it('renders hero_campaign without placeholder copy', () => {
    const html = renderBlockHtml({
      blockType: 'hero_campaign',
      sortOrder: 0,
      propsJson: {
        campaignType: 'promo',
        title: 'Offre',
        buttonText: 'CTA',
        promoBadge: 'Limitée',
        design: { layoutVariant: 'split_image_right', backgroundMode: 'dark' },
      },
    });
    expect(html).toContain('lp-hero--campaign-promo');
    expect(html).toContain('lp-hero__badge');
    expect(html).not.toContain('Visuel véhicule');
  });

  it('renders Auto Hall lead form with civility and city fields', () => {
    const html = renderBlockHtml({
      blockType: 'lead_form',
      sortOrder: 1,
      propsJson: {
        title: 'Contact',
        submitText: 'Envoyer votre demande',
        consentLabel: 'J’accepte les termes.',
        formConfig: {
          showCivility: true,
          useSplitName: true,
          showCity: true,
          showConsent: true,
        },
      },
    });
    expect(html).toContain('name="civility"');
    expect(html).toContain('name="lastName"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('name="city"');
    expect(html).toContain('lp-lead-form__checkbox');
  });

  it('renders vehicle range cards', () => {
    const html = renderBlockHtml({
      blockType: 'vehicle_range',
      sortOrder: 2,
      propsJson: {
        heading: 'Gamme',
        vehicles: [
          { name: 'Model A', energy: 'Thermique', tag: 'New', ctaText: 'Voir' },
          { name: 'Model B', energy: 'HEV', ctaText: 'Voir' },
        ],
      },
    });
    expect(html).toContain('lp-vehicle-range__grid');
    expect(html).toContain('Model A');
    expect(html).toContain('lp-vehicle-card__energy');
  });

  it('renders hero_form_campaign with form column', () => {
    const html = renderBlockHtml({
      blockType: 'hero_form_campaign',
      sortOrder: 0,
      propsJson: {
        layoutVariant: 'sav_light_form',
        title: 'SAV Auto Hall',
        subtitle: 'Service expert',
        form: {
          title: 'Demande',
          submitText: 'Envoyer votre demande',
          consentLabel: 'J’accepte.',
          formConfig: { showConsent: true, showCity: true },
        },
        design: { tone: 'light' },
      },
    });
    expect(html).toContain('lp-hero-form-campaign');
    expect(html).toContain('lp-hero-form-campaign__form-card');
    expect(html).toContain('name="email"');
    expect(html).not.toContain('Titre principal à renseigner');
  });

  it('renders vehicle_offer panel', () => {
    const html = renderBlockHtml({
      blockType: 'vehicle_offer',
      sortOrder: 3,
      propsJson: {
        modelName: 'Focus',
        priceValue: '199 000 DH',
        buttonText: 'Demander',
        highlights: [{ title: 'Garantie', description: '5 ans' }],
      },
    });
    expect(html).toContain('lp-vehicle-offer');
    expect(html).toContain('Focus');
    expect(html).toContain('lp-vehicle-offer__highlight');
  });
});
