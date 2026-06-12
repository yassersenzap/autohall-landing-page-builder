export type TitleScale = 'sm' | 'md' | 'lg' | 'xl' | 'display';
export type SubtitleScale = 'sm' | 'md' | 'lg';
export type BodyScale = 'sm' | 'md' | 'lg';
export type EyebrowStyle = 'hidden' | 'subtle' | 'badge' | 'uppercase';
export type TitleWeight = 'medium' | 'semibold' | 'bold' | 'black';
export type TextMaxWidth = 'sm' | 'md' | 'lg' | 'xl';
export type MobileTitleScale = 'inherit' | 'sm' | 'md' | 'lg';

export type BlockTypography = {
  titleScale?: TitleScale;
  subtitleScale?: SubtitleScale;
  bodyScale?: BodyScale;
  eyebrowStyle?: EyebrowStyle;
  titleWeight?: TitleWeight;
  textMaxWidth?: TextMaxWidth;
  mobileTitleScale?: MobileTitleScale;
};

export type BlockTypographyCapabilities = {
  titleScale?: boolean;
  subtitleScale?: boolean;
  bodyScale?: boolean;
  eyebrowStyle?: boolean;
  titleWeight?: boolean;
  textMaxWidth?: boolean;
  mobileTitleScale?: boolean;
};
