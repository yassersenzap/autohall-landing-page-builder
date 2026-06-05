import { useEffect } from 'react';

export function useBeforeUnload(when: boolean, message?: string): void {
  useEffect(() => {
    if (!when) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = message ?? '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [message, when]);
}
