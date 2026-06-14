import { parseSectionStyle } from '@/features/builder/section-style';
import type { BuilderDeviceMode } from './block-design-props';

/** Masquage global — absent de l'aperçu et de l'export ZIP. */
export function isBlockGloballyHidden(propsJson: Record<string, unknown>): boolean {
  return propsJson.hidden === true;
}

/** Masquage responsive (sectionStyle) pour le viewport courant. */
export function isBlockHiddenOnViewport(
  propsJson: Record<string, unknown>,
  deviceMode: BuilderDeviceMode,
): boolean {
  const style = parseSectionStyle(propsJson);
  if (deviceMode === 'desktop') return style.hideOnDesktop;
  if (deviceMode === 'tablet') return style.hideOnTablet;
  return style.hideOnMobile;
}

/** Bloc masqué pour le viewport studio (global ou responsive). */
export function isBlockHiddenInStudio(
  propsJson: Record<string, unknown>,
  deviceMode: BuilderDeviceMode,
): boolean {
  return isBlockGloballyHidden(propsJson) || isBlockHiddenOnViewport(propsJson, deviceMode);
}

/** Tous les blocs supportent la visibilité globale et responsive dans le studio. */
export function isBlockVisibilitySupported(_blockType: string): boolean {
  return true;
}

/** Exclure du rendu aperçu / export (build-time). */
export function shouldOmitBlockFromPublishedOutput(
  propsJson: Record<string, unknown>,
  deviceMode?: BuilderDeviceMode,
): boolean {
  if (isBlockGloballyHidden(propsJson)) return true;
  if (deviceMode && isBlockHiddenOnViewport(propsJson, deviceMode)) return true;
  return false;
}
