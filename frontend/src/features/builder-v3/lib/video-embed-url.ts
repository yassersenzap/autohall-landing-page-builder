const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function isValidYoutubeId(id: string | null | undefined): id is string {
  return Boolean(id && YOUTUBE_ID_PATTERN.test(id));
}

/** Normalise une saisie utilisateur en URL absolue parseable. */
export function normalizeMediaUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function parseYoutubeFromUrl(url: URL): string | null {
  const host = url.hostname.replace(/^www\./i, '').replace(/^m\./i, '');

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0] ?? '';
    return isValidYoutubeId(id) ? id : null;
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments[0] === 'embed' || segments[0] === 'shorts' || segments[0] === 'live') {
      const id = segments[1] ?? '';
      return isValidYoutubeId(id) ? id : null;
    }

    if (segments[0] === 'watch' || url.pathname === '/watch') {
      const fromQuery = url.searchParams.get('v');
      if (isValidYoutubeId(fromQuery)) return fromQuery;
    }
  }

  return null;
}

function parseYoutubeFromText(raw: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|embed\/|shorts\/|live\/))|(?:youtu\.be\/)([A-Za-z0-9_-]{11})/i,
    /[?&]v=([A-Za-z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    const id = match?.[1];
    if (isValidYoutubeId(id)) return id;
  }

  return null;
}

function parseVimeoFromUrl(url: URL): string | null {
  const host = url.hostname.replace(/^www\./i, '');
  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;

  const segments = url.pathname.split('/').filter(Boolean);
  const id = host === 'player.vimeo.com' ? segments[1] : segments[segments.length - 1];
  return id && /^\d+$/.test(id) ? id : null;
}

function parseVimeoFromText(raw: string): string | null {
  const match = raw.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  return match?.[1] ?? null;
}

/** Extrait une URL d’embed YouTube ou Vimeo depuis toute saisie utilisateur. */
export function resolveVideoEmbedUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (
    trimmed.includes('youtube.com/embed/') ||
    trimmed.includes('youtube-nocookie.com/embed/') ||
    trimmed.includes('player.vimeo.com/video/')
  ) {
    return trimmed;
  }

  try {
    const url = new URL(normalizeMediaUrl(trimmed));

    const youtubeId = parseYoutubeFromUrl(url);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}`;
    }

    const vimeoId = parseVimeoFromUrl(url);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
  } catch {
    // Saisie partielle — fallback regex ci-dessous
  }

  const youtubeId = parseYoutubeFromText(trimmed);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  const vimeoId = parseVimeoFromText(trimmed);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }

  return null;
}

/** Alias explicite pour les blocs vidéo — même logique que resolveVideoEmbedUrl. */
export function toVideoEmbedUrl(raw: string): string | null {
  return resolveVideoEmbedUrl(raw);
}
