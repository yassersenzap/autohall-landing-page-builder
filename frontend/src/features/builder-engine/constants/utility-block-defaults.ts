/** Defaults des blocs utilitaires V3 — contraintes design strictes. */

export function buildRichTextDefaults(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    titre: 'Titre de section',
    contenu:
      'Texte descriptif pour accompagner votre campagne. Restez concis et orienté bénéfice client.',
    alignement: 'center',
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
