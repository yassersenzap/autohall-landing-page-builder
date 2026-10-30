/**
 * Default Landing Studio document for database seed (Docker + local).
 * Self-contained under prisma/ — do not import from src/studio-v2.
 */
import { ensurePuckIds } from './ensure-puck-ids';

export const STUDIO_V2_ENGINE = 'puck';

function buildRawDefaultStudioV2Document(): Record<string, unknown> {
  return {
    root: {
      props: {
        title: 'Auto Hall — Offre printemps',
        themePreset: 'autohall-blue',
        seo: {
          title: 'Offre véhicule — Auto Hall',
          description:
            'Découvrez nos offres véhicules neufs et demandez un essai en ligne.',
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
                            title: 'Votre prochaine voiture commence ici',
                            subtitle:
                              'Offres exclusives, financement sur mesure et essai en concession.',
                            ctaPrimaryLabel: 'Découvrir l’offre',
                            ctaPrimaryHref: '#lead-form',
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
                            subtitle:
                              'Un conseiller vous recontacte rapidement.',
                            submitText: 'Envoyer votre demande',
                            showCity: true,
                            showMessage: true,
                            consentText:
                              'J’ai lu et j’accepte sans réserve les termes de la clause relative à la protection des données personnelles.',
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
