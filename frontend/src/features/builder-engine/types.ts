/** Bloc factice pour le prototype du moteur constructeur (Étape 1). */
export type BuilderDocumentBlock = {
  id: string;
  type: string;
  label: string;
  sortOrder: number;
};

export type BuilderPaletteItem = {
  type: string;
  label: string;
  description: string;
};
