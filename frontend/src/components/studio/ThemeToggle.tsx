import { useStudioTheme } from '../../context/StudioThemeContext';

export function ThemeToggle() {
  const { mode, toggleMode } = useStudioTheme();

  return (
    <button
      type="button"
      className="studio-theme-toggle"
      onClick={toggleMode}
      aria-label={mode === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
      title={mode === 'light' ? 'Mode sombre' : 'Mode clair'}
    >
      <span aria-hidden="true">{mode === 'light' ? '◐' : '◑'}</span>
      <span>{mode === 'light' ? 'Sombre' : 'Clair'}</span>
    </button>
  );
}
