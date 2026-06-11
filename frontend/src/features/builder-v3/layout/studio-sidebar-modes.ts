import type { LucideIcon } from 'lucide-react';
import { FileText, Image, Layers, LayoutGrid, LayoutTemplate } from 'lucide-react';

export type StudioSidebarMode = 'blocks' | 'layers' | 'assets' | 'templates' | 'page';

export type StudioSidebarModeConfig = {
  id: StudioSidebarMode;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export const STUDIO_SIDEBAR_MODES: StudioSidebarModeConfig[] = [
  { id: 'blocks', label: 'Blocks', shortLabel: 'Blocs', icon: LayoutGrid },
  { id: 'layers', label: 'Layers', shortLabel: 'Calques', icon: Layers },
  { id: 'assets', label: 'Assets', shortLabel: 'Médias', icon: Image },
  { id: 'templates', label: 'Templates', shortLabel: 'Modèles', icon: LayoutTemplate },
  { id: 'page', label: 'Page', shortLabel: 'Page', icon: FileText },
];
