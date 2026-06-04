import { Moon, Sun } from 'lucide-react';
import { useStudioTheme } from '@/context/StudioThemeContext';
import { ShadButton } from '@/components/ui/primitives';

export function EditorThemeToggle() {
  const { mode, toggleMode } = useStudioTheme();
  const isLight = mode === 'light';

  return (
    <ShadButton
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      aria-label={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
      title={isLight ? 'Mode sombre' : 'Mode clair'}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </ShadButton>
  );
}
