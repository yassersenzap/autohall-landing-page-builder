import { generateExportJs } from '../src/features/builder-v4/lib/export-js';
import * as fs from 'fs';

const ctx = {
  apiBaseUrl: 'http://localhost:3000',
  campaignId: '75da464c-843b-4e31-865a-04e9f32090e7',
  landingPageId: '75da464c-843b-4e31-865a-04e9f32090e7',
  pageVersionId: '75da464c-843b-4e31-865a-04e9f32090e7',
};

const js = generateExportJs(ctx);
fs.writeFileSync('exported-app.js', js);
console.log('Exported app.js successfully!');
