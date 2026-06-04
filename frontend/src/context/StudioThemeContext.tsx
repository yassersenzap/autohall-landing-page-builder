import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type StudioThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'autohall-studio-theme';

type StudioThemeContextValue = {
  mode: StudioThemeMode;
  setMode: (mode: StudioThemeMode) => void;
  toggleMode: () => void;
};

const StudioThemeContext = createContext<StudioThemeContextValue | null>(null);

function readStoredTheme(): StudioThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyThemeToDocument(mode: StudioThemeMode) {
  const root = document.documentElement;
  root.setAttribute('data-studio-theme', mode);
  root.classList.toggle('dark', mode === 'dark');
}

export function StudioThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<StudioThemeMode>(() => readStoredTheme());

  useEffect(() => {
    applyThemeToDocument(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((next: StudioThemeMode) => {
    setModeState(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  );

  return (
    <StudioThemeContext.Provider value={value}>
      {children}
    </StudioThemeContext.Provider>
  );
}

export function useStudioTheme(): StudioThemeContextValue {
  const ctx = useContext(StudioThemeContext);
  if (!ctx) {
    throw new Error('useStudioTheme must be used within StudioThemeProvider');
  }
  return ctx;
}

/** Apply theme before first paint when possible (call from main.tsx). */
export function initStudioTheme() {
  applyThemeToDocument(readStoredTheme());
}
