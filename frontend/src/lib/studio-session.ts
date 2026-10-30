/** Dernière session Landing Studio — raccourcis dashboard / sidebar / campagnes. */

export const STUDIO_SESSION_STORAGE_KEY = 'autohall-studio-session';

/** @deprecated compat dashboard — migré vers STUDIO_SESSION_STORAGE_KEY */
export const LAST_DRAFT_STORAGE_KEY = 'autohall-studio-last-draft';

export type StudioSession = {
  pageVersionId: string;
  campaignId?: string;
  campaignName?: string;
  landingPageId?: string;
  landingPageTitle?: string;
  versionNumber?: number;
  versionLabel?: string | null;
  label: string;
  updatedAt: string;
};

export function buildStudioSessionLabel(session: Partial<StudioSession>): string {
  if (session.versionNumber != null) {
    const base = `v${session.versionNumber}`;
    return session.versionLabel ? `${base} — ${session.versionLabel}` : base;
  }
  if (session.landingPageTitle) return session.landingPageTitle;
  return 'Continuer dans le Studio';
}

export function readStudioSession(): StudioSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      localStorage.getItem(STUDIO_SESSION_STORAGE_KEY) ??
      localStorage.getItem(LAST_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StudioSession>;
    if (!parsed.pageVersionId) return null;
    return {
      pageVersionId: parsed.pageVersionId,
      campaignId: parsed.campaignId,
      campaignName: parsed.campaignName,
      landingPageId: parsed.landingPageId,
      landingPageTitle: parsed.landingPageTitle,
      versionNumber: parsed.versionNumber,
      versionLabel: parsed.versionLabel ?? null,
      label: parsed.label ?? buildStudioSessionLabel(parsed),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeStudioSession(session: Omit<StudioSession, 'updatedAt' | 'label'> & { label?: string }): void {
  if (typeof window === 'undefined') return;
  const payload: StudioSession = {
    ...session,
    label: session.label ?? buildStudioSessionLabel(session),
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STUDIO_SESSION_STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(LAST_DRAFT_STORAGE_KEY, JSON.stringify({
      pageVersionId: payload.pageVersionId,
      label: payload.label,
    }));
  } catch {
    // ignore quota errors
  }
}

export function persistStudioSessionFromVersion(params: {
  pageVersionId: string;
  versionNumber: number;
  versionLabel?: string | null;
  landingPageId?: string;
  landingPageTitle?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
}): void {
  writeStudioSession({
    pageVersionId: params.pageVersionId,
    versionNumber: params.versionNumber,
    versionLabel: params.versionLabel ?? null,
    landingPageId: params.landingPageId,
    landingPageTitle: params.landingPageTitle ?? undefined,
    campaignId: params.campaignId ?? undefined,
    campaignName: params.campaignName ?? undefined,
  });
}

export function studioNavState(session: StudioSession): Record<string, unknown> {
  return {
    versionNumber: session.versionNumber,
    versionLabel: session.versionLabel,
    landingPageId: session.landingPageId,
    landingPageTitle: session.landingPageTitle,
    campaignId: session.campaignId,
    campaignName: session.campaignName,
  };
}
