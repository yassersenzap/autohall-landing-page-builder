import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type TargetThemeMode = 'dark' | 'light';

const ADMIN_THEME_STORAGE_KEY = 'autohall-admin-target-theme';

type TargetThemeContextValue = {
  mode: TargetThemeMode;
  toggleMode: () => void;
};

const TargetThemeContext = createContext<TargetThemeContextValue | null>(null);

function readStoredMode(): TargetThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  try {
    const stored = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // ignore storage errors
  }

  return 'dark';
}

export function TargetThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TargetThemeMode>(readStoredMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <TargetThemeContext.Provider value={value}>{children}</TargetThemeContext.Provider>
  );
}

export function useTargetTheme() {
  const context = useContext(TargetThemeContext);
  if (!context) {
    throw new Error('useTargetTheme must be used within TargetThemeProvider');
  }
  return context;
}
