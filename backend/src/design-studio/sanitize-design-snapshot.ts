const MAX_HTML_BYTES = 800_000;
const MAX_CSS_BYTES = 400_000;
const MAX_PROJECT_JSON_BYTES = 1_200_000;

const FORBIDDEN_HTML_PATTERNS = [
  /<script\b/i,
  /<iframe\b/i,
  /<object\b/i,
  /<embed\b/i,
  /<link\b[^>]*rel\s*=\s*["']?import/i,
  /\bon\w+\s*=/i,
  /javascript:/i,
  /data:text\/html/i,
];

const FORBIDDEN_CSS_PATTERNS = [
  /@import\b/i,
  /javascript:/i,
  /expression\s*\(/i,
  /behavior\s*:/i,
  /-moz-binding/i,
];

export class DesignSnapshotRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DesignSnapshotRejectedError';
  }
}

function assertMaxBytes(value: string, max: number, label: string): void {
  if (Buffer.byteLength(value, 'utf8') > max) {
    throw new DesignSnapshotRejectedError(`${label} dépasse la taille maximale autorisée.`);
  }
}

export function sanitizeDesignHtml(html: string): string {
  const trimmed = html.trim();
  assertMaxBytes(trimmed, MAX_HTML_BYTES, 'HTML');

  for (const pattern of FORBIDDEN_HTML_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new DesignSnapshotRejectedError(
        'HTML refusé : contenu ou attribut non autorisé détecté.',
      );
    }
  }

  let safe = trimmed.replace(
    /<form\b([^>]*)>/gi,
    (_match, attrs: string) => {
      const cleaned = attrs
        .replace(/\saction\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
        .replace(/\smethod\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '');
      return `<form${cleaned} action="#" method="post" class="lp-lead-form lp-lead-form__form" novalidate>`;
    },
  );

  if (!/class\s*=\s*["'][^"']*lp-lead-form/.test(safe) && safe.includes('<form')) {
    safe = safe.replace(/<form\b/gi, '<form class="lp-lead-form lp-lead-form__form"');
  }

  return safe;
}

export function sanitizeDesignCss(css: string): string {
  const trimmed = css.trim();
  assertMaxBytes(trimmed, MAX_CSS_BYTES, 'CSS');

  for (const pattern of FORBIDDEN_CSS_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new DesignSnapshotRejectedError('CSS refusé : règle non autorisée détectée.');
    }
  }

  return trimmed;
}

export function sanitizeDesignProjectJson(projectJson: unknown): Record<string, unknown> {
  if (projectJson === null || typeof projectJson !== 'object' || Array.isArray(projectJson)) {
    throw new DesignSnapshotRejectedError('projectJson doit être un objet JSON.');
  }

  const serialized = JSON.stringify(projectJson);
  assertMaxBytes(serialized, MAX_PROJECT_JSON_BYTES, 'projectJson');

  const str = serialized.toLowerCase();
  if (str.includes('<script') || str.includes('javascript:')) {
    throw new DesignSnapshotRejectedError('projectJson contient du contenu non autorisé.');
  }

  return projectJson as Record<string, unknown>;
}
