/** Defaults des blocs utilitaires V3 — contraintes design strictes. */

export function buildRichTextDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    titre: 'Un accompagnement de confiance',
    contenu:
      'Auto Hall vous guide à chaque étape : choix du modèle, financement, essai en concession et prise en charge après-vente.',
    alignement: 'center',
    design: { variant: 'standard', tone: 'light', alignment: 'center' },
    ...overrides,
  };
}

export function buildMediaOnlyDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    imageUrl: '',
    imageAlt: 'Visuel campagne',
    aspectRatio: '16:9',
    ...overrides,
  };
}

export function buildSpacerDividerDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    type: 'solid',
    hauteur: 'M',
    ...overrides,
  };
}
