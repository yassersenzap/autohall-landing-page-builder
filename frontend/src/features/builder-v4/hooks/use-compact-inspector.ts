import { useEffect, useState } from 'react';

const COMPACT_INSPECTOR_MAX_WIDTH = 900;

export function useCompactInspector() {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= COMPACT_INSPECTOR_MAX_WIDTH : false,
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${COMPACT_INSPECTOR_MAX_WIDTH}px)`);
    const onChange = () => setCompact(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return compact;
}
