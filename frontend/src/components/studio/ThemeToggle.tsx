import { Moon, Sun } from 'lucide-react';
import { useStudioTheme } from '../../context/StudioThemeContext';

export function ThemeToggle() {
  const { mode, toggleMode } = useStudioTheme();
  const isLight = mode === 'light';

  return (
    <button
      type="button"
      className="ah-btn ah-btn--secondary ah-btn--sm ah-glass !gap-1.5"
      onClick={toggleMode}
      aria-label={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
      title={isLight ? 'Mode sombre' : 'Mode clair'}
    >
      {isLight ? (
        <Moon className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden />
      ) : (
        <Sun className="h-3.5 w-3.5 text-[var(--color-warning)]" aria-hidden />
      )}
      <span>{isLight ? 'Sombre' : 'Clair'}</span>
    </button>
  );
}
