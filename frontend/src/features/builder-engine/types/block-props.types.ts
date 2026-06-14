/** Masquage responsive par viewport — stocké dans propsJson.sectionStyle. */
export type BlockSectionStyleVisibilityProps = {
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
};

export type BlockSectionStyleProps = {
  sectionStyle?: BlockSectionStyleVisibilityProps & Record<string, unknown>;
};

/**
 * Propriétés communes à tous les blocs du document (sections, landing métier, blocs atomiques).
 * `hidden: true` exclut le bloc de l'aperçu publié et de l'export ZIP.
 */
export type BaseBlockProps = {
  hidden?: boolean;
} & BlockSectionStyleProps;

export function readBlockHidden(propsJson: Record<string, unknown>): boolean {
  return propsJson.hidden === true;
}

export function withBlockHiddenToggle(
  propsJson: Record<string, unknown>,
): Pick<BaseBlockProps, 'hidden'> {
  return { hidden: !readBlockHidden(propsJson) };
}
