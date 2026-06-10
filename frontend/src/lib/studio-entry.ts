import { listCampaigns } from './campaigns';
import { listLandingPages } from './landing-pages';
import { listPageVersions } from './page-versions';
import { buildStudioSessionLabel, type StudioSession } from './studio-session';

export const STUDIO_EMPTY_MESSAGE =
  'Aucune version disponible. Créez une campagne, une landing page et une version pour ouvrir le Studio.';

type StudioEntryCandidate = {
  pageVersionId: string;
  versionNumber: number;
  versionLabel: string | null;
  landingPageId: string;
  landingPageTitle: string;
  campaignId: string;
  campaignName: string;
  createdAt: string;
};

function toSession(candidate: StudioEntryCandidate): StudioSession {
  return {
    pageVersionId: candidate.pageVersionId,
    campaignId: candidate.campaignId,
    campaignName: candidate.campaignName,
    landingPageId: candidate.landingPageId,
    landingPageTitle: candidate.landingPageTitle,
    versionNumber: candidate.versionNumber,
    versionLabel: candidate.versionLabel,
    label: buildStudioSessionLabel({
      versionNumber: candidate.versionNumber,
      versionLabel: candidate.versionLabel,
      landingPageTitle: candidate.landingPageTitle,
    }),
    updatedAt: candidate.createdAt,
  };
}

/**
 * Resolves the most recently created page version from backend data.
 * Used when no local Studio session exists (e.g. fresh Docker deploy after seed).
 */
export async function fetchLatestStudioEntry(): Promise<StudioSession | null> {
  const campaignsResponse = await listCampaigns();
  const campaigns = [...campaignsResponse.data].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  let best: StudioEntryCandidate | null = null;

  for (const campaign of campaigns) {
    const landingPagesResponse = await listLandingPages(campaign.id);
    const landingPages = [...landingPagesResponse.data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    for (const landingPage of landingPages) {
      const versionsResponse = await listPageVersions(landingPage.id);
      if (versionsResponse.data.length === 0) continue;

      const version = versionsResponse.data.reduce((latest, current) =>
        current.versionNumber > latest.versionNumber ? current : latest,
      );

      const candidate: StudioEntryCandidate = {
        pageVersionId: version.id,
        versionNumber: version.versionNumber,
        versionLabel: version.label,
        landingPageId: landingPage.id,
        landingPageTitle: landingPage.title,
        campaignId: campaign.id,
        campaignName: campaign.name,
        createdAt: version.createdAt,
      };

      if (
        !best ||
        new Date(candidate.createdAt).getTime() > new Date(best.createdAt).getTime()
      ) {
        best = candidate;
      }
    }
  }

  return best ? toSession(best) : null;
}
