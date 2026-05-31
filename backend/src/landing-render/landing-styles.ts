import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

const CSS_FILENAME = 'landing-page.css';
const CSS_SEGMENTS = ['landing-render', 'styles', CSS_FILENAME] as const;

let cachedCss: string | null = null;

function findBackendRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== dirname(dir)) {
    if (
      existsSync(join(dir, 'package.json')) &&
      existsSync(join(dir, 'nest-cli.json'))
    ) {
      return dir;
    }
    dir = dirname(dir);
  }
  return resolve(startDir, '..', '..');
}

function uniquePaths(paths: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of paths) {
    const normalized = resolve(p);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

/**
 * Candidate locations for landing-page.css (dev, compiled module dir, Nest asset copies).
 */
export function getLandingPageStylesheetCandidates(): string[] {
  const backendRoot = findBackendRoot(__dirname);

  return uniquePaths([
    join(backendRoot, 'src', ...CSS_SEGMENTS),
    join(__dirname, 'styles', CSS_FILENAME),
    join(backendRoot, 'dist', 'src', ...CSS_SEGMENTS),
    join(backendRoot, 'dist', ...CSS_SEGMENTS),
  ]);
}

export function resolveLandingPageStylesheetPath(): string {
  const candidates = getLandingPageStylesheetCandidates();
  for (const cssPath of candidates) {
    if (existsSync(cssPath)) {
      return cssPath;
    }
  }

  const tried = candidates.map((p) => `  - ${p}`).join('\n');
  throw new Error(
    `landing-page.css introuvable. Chemins testés :\n${tried}`,
  );
}

export function getLandingPageStylesheet(): string {
  if (cachedCss) {
    return cachedCss;
  }

  const cssPath = resolveLandingPageStylesheetPath();
  cachedCss = readFileSync(cssPath, 'utf8');
  return cachedCss;
}
