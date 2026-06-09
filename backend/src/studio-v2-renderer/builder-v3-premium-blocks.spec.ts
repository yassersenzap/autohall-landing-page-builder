import { BuilderV3HtmlCompilerService } from './builder-v3-html-compiler.service';

import type { RenderAssetMap } from '../landing-render/render-asset.types';



describe('BuilderV3HtmlCompilerService premium blocks', () => {

  const compiler = new BuilderV3HtmlCompilerService();



  const baseInput = {

    pageTitle: 'Campagne Auto Hall',

    metaDescription: 'Offre véhicule premium',

    primaryColor: '#b91c1c',

    secondaryColor: '#1e293b',

    headingFont: 'Inter',

    bodyFont: 'Roboto',

    renderContext: { mode: 'export' as const, assetMap: {} as RenderAssetMap },

  };



  it('renders promo_autohall with shared landing CSS classes', () => {

    const html = compiler.compile({

      ...baseInput,

      blocks: [

        {

          type: 'promo_autohall',

          sortOrder: 1,

          propsJson: {

            title: 'Ford Ranger',

            formTitle: 'Demandez votre offre',

            submitText: 'Envoyer',

          },

        },

      ],

    });



    expect(html).toContain('assets/style.css');

    expect(html).toContain('lp-promo-autohall');

    expect(html).toContain('lp-promo-autohall__form-card');

    expect(html).toContain('form class="lp-lead-form');

    expect(html).toContain('Ford Ranger');

  });



  it('renders hero_form_campaign with premium variant classes and trust row', () => {

    const html = compiler.compile({

      ...baseInput,

      blocks: [

        {

          type: 'hero_form_campaign',

          sortOrder: 1,

          propsJson: {

            title: 'Réservez votre essai en concession',

            trustItems: ['Un conseiller Auto Hall vous accompagne sous 24h'],

            design: {

              variant: 'split-form',

              tone: 'brand',

              mediaPosition: 'right',

              density: 'comfortable',

            },

            form: { title: 'Demandez votre offre', submitText: 'Envoyer' },

          },

        },

      ],

    });



    expect(html).toContain('assets/style.css');

    expect(html).toContain('lp-hero-form-campaign--variant-split-form');

    expect(html).toContain('lp-hero-form-campaign--tone-brand');

    expect(html).toContain('lp-hero-form-campaign__trust');

    expect(html).toContain('Réservez votre essai en concession');

    expect(html).not.toContain('Titre principal à renseigner');

    expect(html).not.toContain('Sous-titre à renseigner');

  });



  it('renders vehicle_offer with premium classes and no placeholder copy', () => {

    const html = compiler.compile({

      ...baseInput,

      blocks: [

        {

          type: 'vehicle_offer',

          sortOrder: 1,

          propsJson: {

            modelName: 'Ranger',

            heading: 'Découvrez nos offres du moment',

            priceValue: '299 900 DH',

            buttonText: 'Demander une offre',

            design: {

              variant: 'split-form',

              tone: 'light',

              mediaPosition: 'left',

              ctaStyle: 'primary',

            },

          },

        },

      ],

    });



    expect(html).toContain('lp-vehicle-offer--media-left');

    expect(html).toContain('lp-vehicle-offer__panel');

    expect(html).toContain('299 900 DH');

    expect(html).not.toContain('Visuel véhicule');

    expect(html).not.toContain('Modèle et offre à renseigner');

  });



  it('renders lead_form split layout and final_cta panel', () => {

    const html = compiler.compile({

      ...baseInput,

      blocks: [

        {

          type: 'lead_form',

          sortOrder: 1,

          propsJson: { title: 'Contact', submitText: 'Envoyer' },

        },

        {

          type: 'final_cta',

          sortOrder: 2,

          propsJson: { title: 'Essai gratuit', buttonText: 'Réserver' },

        },

      ],

    });



    expect(html).toContain('lp-lead-form__layout');

    expect(html).toContain('lp-final-cta__panel');

    expect(html).toContain('Essai gratuit');

  });

});


