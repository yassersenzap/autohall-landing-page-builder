/** Left sidebar tabs — section-based landing page editor. */
export type LeftSidebarTab = 'templates' | 'sections' | 'media' | 'layers';

export const SIDEBAR_TAB_LABELS: Record<LeftSidebarTab, string> = {
  templates: 'Templates',
  sections:  'Sections',
  media:     'Médias',
  layers:    'Calques',
};

export function normalizeSidebarTab(tab: string): LeftSidebarTab {
  if (tab === 'blocks') return 'sections';
  if (tab === 'templates') return 'templates';
  if (tab === 'sections') return 'sections';
  if (tab === 'elements') return 'sections'; // legacy fallback
  if (tab === 'media' || tab === 'assets') return 'media';
  return 'layers';
}
