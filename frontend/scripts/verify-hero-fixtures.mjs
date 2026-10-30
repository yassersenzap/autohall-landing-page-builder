/**
 * CI: verify bundled hero fixtures exist and are valid WebP files.
 * Run: node scripts/verify-hero-fixtures.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, '../public/assets/hero-fixtures');

const REQUIRED = [
  'chery.webp',
  'bmw.webp',
  'ford.webp',
  'jeep.webp',
  'mercedes.webp',
  'opel.webp',
  'nissan.webp',
  'seres.webp',
  'placeholder.webp',
];

function isWebpMagic(buffer) {
  return (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  );
}

let failed = false;

for (const name of REQUIRED) {
  const filePath = path.join(FIXTURE_DIR, name);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING: ${name}`);
    failed = true;
    continue;
  }
  const stat = fs.statSync(filePath);
  if (stat.size < 512) {
    console.error(`TOO SMALL: ${name} (${stat.size} bytes)`);
    failed = true;
    continue;
  }
  const head = fs.readFileSync(filePath).subarray(0, 12);
  if (!isWebpMagic(head)) {
    console.error(`NOT WEBP: ${name}`);
    failed = true;
    continue;
  }
  console.log(`OK: ${name} (${stat.size} bytes)`);
}

if (failed) {
  process.exit(1);
}

console.log('All hero fixtures verified.');
