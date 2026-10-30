import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

const CSS_FILENAME = 'landing-page.css';
const V4_CSS_FILENAME = 'v4-blocks.css';
const CSS_SEGMENTS = ['landing-render', 'styles', CSS_FILENAME] as const;
const V4_CSS_SEGMENTS = ['landing-render', 'styles', V4_CSS_FILENAME] as const;

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
  throw new Error(`landing-page.css introuvable. Chemins testés :\n${tried}`);
}

export function getLandingPageStylesheet(): string {
  const cssPath = resolveLandingPageStylesheetPath();
  const mainCss = readFileSync(cssPath, 'utf8');
  const v4Path = resolveV4BlocksStylesheetPath();
  const v4Css = existsSync(v4Path) ? readFileSync(v4Path, 'utf8') : '';
  return `${mainCss}\n/* --- V4 blocks --- */\n${v4Css}`;
}

function resolveV4BlocksStylesheetPath(): string {
  const backendRoot = findBackendRoot(__dirname);
  const candidates = uniquePaths([
    join(backendRoot, 'src', ...V4_CSS_SEGMENTS),
    join(__dirname, 'styles', V4_CSS_FILENAME),
    join(backendRoot, 'dist', 'src', ...V4_CSS_SEGMENTS),
    join(backendRoot, 'dist', ...V4_CSS_SEGMENTS),
  ]);
  for (const cssPath of candidates) {
    if (existsSync(cssPath)) {
      return cssPath;
    }
  }
  return candidates[0] ?? join(backendRoot, 'src', ...V4_CSS_SEGMENTS);
}
