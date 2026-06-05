export type ThemePreset = {
  id: string;
  label: string;
  primaryColor: string;
  secondaryColor: string;
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'autohall', label: 'Rouge Auto Hall', primaryColor: '#b91c1c', secondaryColor: '#18181b' },
  { id: 'ford', label: 'Bleu Ford', primaryColor: '#0033a0', secondaryColor: '#0f172a' },
  { id: 'chery', label: 'Jaune Chery', primaryColor: '#ca8a04', secondaryColor: '#1c1917' },
  { id: 'premium', label: 'Anthracite premium', primaryColor: '#334155', secondaryColor: '#0f172a' },
];
