import type { RenderAssetMap } from '../landing-render/render-asset.types';
import {
  STATIC_LEAD_FORM_JS,
  STATIC_MOTION_JS,
  STATIC_STYLE_CSS,
} from '../page-export/static-export.builder';

export type BuilderV3ZipTextEntry = {
  kind: 'text';
  path: string;
  content: string;
};

export type BuilderV3ZipFileEntry = {
  kind: 'file';
  path: string;
  absolutePath: string;
};

export type BuilderV3ZipEntry = BuilderV3ZipTextEntry | BuilderV3ZipFileEntry;

export function buildBuilderV3ZipEntries(input: {
  indexHtml: string;
  landingConfigJs: string;
  assetMap: RenderAssetMap;
  extraTextEntries?: BuilderV3ZipTextEntry[];
}): BuilderV3ZipEntry[] {
  const entries: BuilderV3ZipEntry[] = [
    { kind: 'text', path: 'index.html', content: input.indexHtml },
    { kind: 'text', path: 'assets/style.css', content: STATIC_STYLE_CSS },
    {
      kind: 'text',
      path: 'js/landing-config.js',
      content: input.landingConfigJs,
    },
    { kind: 'text', path: 'js/lead-form.js', content: STATIC_LEAD_FORM_JS },
    { kind: 'text', path: 'js/motion-runtime.js', content: STATIC_MOTION_JS },
    {
      kind: 'text',
      path: 'README_DEPLOYMENT.txt',
      content: `Auto Hall — Landing page statique (Builder V3)
============================================

1. Déployez le contenu du ZIP sur un hébergement statique.
2. Ouvrez index.html dans un navigateur pour vérifier le rendu.
3. Testez le formulaire lead en conditions réelles.

Support : Auto Hall SI Digital
`,
    },
  ];

  if (input.extraTextEntries?.length) {
    entries.push(...input.extraTextEntries);
  }

  for (const entry of Object.values(input.assetMap)) {
    entries.push({
      kind: 'file',
      path: entry.exportPath,
      absolutePath: entry.absolutePath,
    });
  }

  return entries;
}
