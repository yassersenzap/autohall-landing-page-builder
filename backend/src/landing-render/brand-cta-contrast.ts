const BRAND_CTA_PRIMARY_TEXT_OVERRIDES: Record<string, string> = {
  opel: '#111827',
  chery: '#111827',
};

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string): number {
  const rgb = parseHexColor(hex);
  if (!rgb) return 0.3;

  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };

  const r = channel(rgb.r);
  const g = channel(rgb.g);
  const b = channel(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function resolveBrandCtaPrimaryTextColor(
  brandId: string,
  primaryColor: string,
): string {
  const override = BRAND_CTA_PRIMARY_TEXT_OVERRIDES[brandId];
  if (override) return override;

  return relativeLuminance(primaryColor) > 0.55 ? '#111827' : '#ffffff';
}
