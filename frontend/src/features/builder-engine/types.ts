/** Bloc du document constructeur (lab → futur branchement API). */
export type BuilderDocumentBlock = {
  id: string;
  type: string;
  label: string;
  sortOrder: number;
  propsJson: Record<string, unknown>;
};

export type BuilderPaletteItem = {
  type: string;
  label: string;
  description: string;
};

export type HeroBlockProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonTarget?: string;
  secondaryButtonText?: string;
  secondaryButtonTarget?: string;
  imageUrl?: string;
  alt?: string;
};
