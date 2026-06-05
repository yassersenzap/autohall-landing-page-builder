import type { Data } from '@puckeditor/core';
import { DEFAULT_AUTOHALL_CONSENT_LABEL } from '@/features/builder-engine/constants/autohall-lead-form';
import { ensurePuckIds } from './lib/ensure-puck-ids';

/** Miroir backend — document Puck initial Visual Studio V2. */
export function buildDefaultStudioV2Document(): Data {
  return ensurePuckIds({
    root: {
      props: {
        title: 'Auto Hall — Landing V2',
        themePreset: 'autohall-blue',
        seo: {
          title: 'Auto Hall — Votre concessionnaire automobile au Maroc',
          description:
            'Découvrez nos offres véhicules neufs et d’occasion, demandez un essai ou un devis en ligne.',
        },
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
                            ctaPrimaryLabel: 'Découvrir',
                            ctaPrimaryHref: '#lead-form',
                            imageUrl: '',
                            imageAssetId: '',
                            imageAlt: 'Véhicule Auto Hall',
                            layout: 'split_right',
                            tone: 'brand',
                            alignment: 'left',
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
                            consentText: DEFAULT_AUTOHALL_CONSENT_LABEL,
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
  } as Data);
}
