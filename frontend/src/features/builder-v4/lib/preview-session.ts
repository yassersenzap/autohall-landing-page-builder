import type { BuilderDocument } from '../types/nodes.types';
import type { DeviceMode } from '../types/nodes.types';
import { createSafeRandomId } from '@/lib/create-safe-random-id';

export type PreviewSessionPayload = {
  document: BuilderDocument;
  deviceMode: DeviceMode;
  savedAt: number;
};

const PREFIX = 'autohall-v4-preview:';

export function createPreviewSessionId(): string {
  return createSafeRandomId().slice(0, 8);
}

export function writePreviewSession(previewId: string, payload: PreviewSessionPayload): void {
  sessionStorage.setItem(`${PREFIX}${previewId}`, JSON.stringify(payload));
}

export function readPreviewSession(previewId: string): PreviewSessionPayload | null {
  const raw = sessionStorage.getItem(`${PREFIX}${previewId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PreviewSessionPayload;
  } catch {
    return null;
  }
}

export function previewPath(previewId: string): string {
  return `/preview/${previewId}`;
}
