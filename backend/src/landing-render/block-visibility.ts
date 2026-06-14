function readSectionStyle(propsJson: Record<string, unknown>): Record<string, unknown> {
  const raw = propsJson.sectionStyle;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export function isBlockHiddenForExport(propsJson: Record<string, unknown>): boolean {
  return propsJson.hidden === true;
}

export function isBlockHiddenOnViewport(
  propsJson: Record<string, unknown>,
  viewport: 'desktop' | 'tablet' | 'mobile',
): boolean {
  const style = readSectionStyle(propsJson);
  if (viewport === 'desktop') return style.hideOnDesktop === true;
  if (viewport === 'tablet') return style.hideOnTablet === true;
  return style.hideOnMobile === true;
}
