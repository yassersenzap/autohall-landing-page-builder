import { useStudioTheme } from '../../context/StudioThemeContext';

export function ThemeToggle() {
  const { mode, toggleMode } = useStudioTheme();
  const isLight = mode === 'light';

  return (
    <button
      type="button"
      className="studio-theme-toggle"
      onClick={toggleMode}
      aria-label={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
      title={isLight ? 'Mode sombre' : 'Mode clair'}
    >
      <span className="studio-theme-toggle__icon" aria-hidden="true">
        {isLight ? '☾' : '☀'}
      </span>
      <span>{isLight ? 'Sombre' : 'Clair'}</span>
    </button>
  );
}
