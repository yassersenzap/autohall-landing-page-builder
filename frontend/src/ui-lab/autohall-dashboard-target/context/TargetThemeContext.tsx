import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type TargetThemeMode = 'dark' | 'light';

type TargetThemeContextValue = {
  mode: TargetThemeMode;
  toggleMode: () => void;
};

const TargetThemeContext = createContext<TargetThemeContextValue | null>(null);

export function TargetThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TargetThemeMode>('dark');

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
