import { ensurePuckIds } from './ensure-puck-ids';

/** Document Puck initial — fondation Visual Studio V2. */
export const STUDIO_V2_ENGINE = 'puck';

function buildRawDefaultStudioV2Document(): Record<string, unknown> {
  return {
    root: {
      props: {
        title: 'Auto Hall — Landing V2',
      },
    },
    content: [
      {
        type: 'Section',
        props: {
          backgroundTone: 'light',
          spacingPreset: 'normal',
          items: [
            {
              type: 'Container',
              props: {
                maxWidth: 'default',
                alignment: 'left',
                items: [
                  {
                    type: 'Columns',
                    props: {
                      columnRatio: '50-50',
                      columnGap: 'normal',
                      stackOnMobile: true,
                      alignment: 'left',
                      left: [
                        {
                          type: 'HeroAutoHall',
                          props: {
                            eyebrow: 'Auto Hall',
                            title: 'Votre campagne Auto Hall',
                            subtitle:
                              'Composez votre landing avec le Visual Studio V2.',
                            ctaLabel: 'Découvrir',
                            ctaHref: '#lead-form',
                            imageUrl: '',
                            imageAssetId: '',
                            alignment: 'left',
                            backgroundTone: 'brand',
                          },
                        },
                      ],
                      right: [
                        {
                          type: 'LeadFormAutoHall',
                          props: {
                            title: 'Contactez-nous',
                            subtitle: 'Un conseiller vous recontacte rapidement.',
                            submitText: 'Envoyer votre demande',
                            showCity: true,
                            showMessage: true,
                            consentText:
                              'J’accepte d’être recontacté par Auto Hall concernant ma demande.',
                            alignment: 'left',
                            spacingPreset: 'normal',
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}

export function buildDefaultStudioV2Document(): Record<string, unknown> {
  return ensurePuckIds(buildRawDefaultStudioV2Document());
}
