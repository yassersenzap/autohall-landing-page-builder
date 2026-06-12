import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const frontendRoot = resolve(process.cwd());

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      listSourceFiles(fullPath, acc);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

const ALLOWED_RANDOM_UUID_FILES = new Set([
  resolve(frontendRoot, 'src/lib/create-safe-random-id.ts'),
  resolve(frontendRoot, 'src/polyfills/crypto-random-uuid.polyfill.ts'),
]);

describe('production runtime guards', () => {
  it('bootstraps crypto polyfill before React app', () => {
    const mainSource = readFileSync(resolve(frontendRoot, 'src/main.tsx'), 'utf8');
    const polyfillImport = mainSource.indexOf("import './polyfills/crypto-random-uuid.polyfill'");
    const reactImport = mainSource.indexOf("from 'react'");
    expect(polyfillImport).toBeGreaterThanOrEqual(0);
    expect(reactImport).toBeGreaterThan(polyfillImport);
  });

  it('browser source avoids direct crypto.randomUUID outside safe helpers', () => {
    const offenders = listSourceFiles(resolve(frontendRoot, 'src')).filter((file) => {
      if (ALLOWED_RANDOM_UUID_FILES.has(file)) return false;
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return false;
      const content = readFileSync(file, 'utf8');
      return /crypto\.randomUUID/.test(content);
    });

    expect(offenders).toEqual([]);
  });

  it('production dist entry includes random id fallback when build output exists', () => {
    const distAssets = resolve(frontendRoot, 'dist/assets');
    if (!existsSync(distAssets)) return;

    const entryChunk = readdirSync(distAssets).find(
      (name) => name.startsWith('index-') && name.endsWith('.js'),
    );
    expect(entryChunk).toBeTruthy();

    const content = readFileSync(join(distAssets, entryChunk!), 'utf8');
    expect(content).toMatch(/randomUUID|createSafeRandomId|createPolyfillRandomUUID/);
    expect(content).not.toMatch(/crypto\.randomUUID is not a function/);
  });
});
