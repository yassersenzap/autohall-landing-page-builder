const ROUTE_TITLES: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/dashboard\/?$/, title: 'Tableau de bord' },
  { pattern: /^\/campaigns\/[^/]+\/landing-pages\/?$/, title: 'Landing pages' },
  { pattern: /^\/campaigns\/?$/, title: 'Campagnes' },
  { pattern: /^\/campaigns\/.+/, title: 'Campagnes' },
  { pattern: /^\/leads\/[^/]+\/?$/, title: 'Lead' },
  { pattern: /^\/leads\/?$/, title: 'Leads' },
  { pattern: /^\/landing-pages\/.+\/versions\/?$/, title: 'Centre de production' },
  { pattern: /^\/landing-pages\/.+/, title: 'Versions' },
];

export function getAdminRouteTitle(pathname: string): string {
  const match = ROUTE_TITLES.find((entry) => entry.pattern.test(pathname));
  return match?.title ?? 'Auto Hall Landing Studio';
}
