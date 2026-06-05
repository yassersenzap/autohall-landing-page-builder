import type { Data } from '@puckeditor/core';

export function studioV2DocumentsEqual(a: Data | null, b: Data | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
