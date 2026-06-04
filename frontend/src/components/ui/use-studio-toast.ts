import { useCallback, useEffect, useState } from 'react';

export type StudioToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

export function useStudioToast(durationMs = 4000) {
  const [toast, setToast] = useState<StudioToastState>(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), durationMs);
    return () => window.clearTimeout(timer);
  }, [toast, durationMs]);

  const showSuccess = useCallback((message: string) => {
    setToast({ type: 'success', message });
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ type: 'error', message });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, showSuccess, showError, dismiss };
}
