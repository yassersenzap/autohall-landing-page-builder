import type { AutohallSymfonyIncludeKey } from './export-contracts.types';
import { SYMFONY_REQUIRED_RUNTIME_CONTEXT } from './export-contracts.registry';
import {
  SYMFONY_TESTDRIVE_INCLUDE_PATHS,
  resolveSymfonyIncludePath,
} from './symfony-include-mapping';

export function buildSymfonyIntegrationReadme(input: {
  pageTitle: string;
  includeKey: AutohallSymfonyIncludeKey;
  includePageExample: boolean;
}): string {
  const includePath = resolveSymfonyIncludePath(input.includeKey);
  const runtimeVars = SYMFONY_REQUIRED_RUNTIME_CONTEXT.map((v) => `  - ${v}`).join(
    '\n',
  );
  const mappingLines = Object.entries(SYMFONY_TESTDRIVE_INCLUDE_PATHS)
    .map(([key, path]) => `  ${key} → ${path}`)
    .join('\n');

  const pageSection = input.includePageExample
    ? `
## campaign-page.example.html.twig

Example full-page wrapper extending your Symfony base layout. Copy it into your
templates directory and point a controller action to render it after supplying
the required variables listed below.
`
    : '';

  return `Auto Hall — Symfony / Twig integration (Builder export)
============================================================

This ZIP also contains controlled Symfony/Twig artifacts under symfony/.
They complement the static index.html export — they do NOT replace it.

## Generated files

- symfony/README_SYMFONY_INTEGRATION.md (this file)
- symfony/campaign-lead-hero.fragment.html.twig — reusable form slot
${input.includePageExample ? '- symfony/campaign-page.example.html.twig — example full page wrapper\n' : ''}
## Static HTML (unchanged)

- index.html — visual shell for cPanel/static hosting (no Twig syntax)
- assets/style.css, js/landing-config.js, js/lead-form.js — static export assets

## Where to place Twig files in Symfony

1. Copy symfony/campaign-lead-hero.fragment.html.twig into your Symfony
   templates directory (e.g. templates/builder/ or templates/campaign/).
2. Ensure the {% include %} path inside the fragment resolves from your
   templates root. The builder maps whitelisted keys to paths in backend code
   (symfony-include-mapping.ts) — adjust that mapping in the NestJS repo, not
   in Studio block content.

## Whitelisted include key for this export

  ${input.includeKey} → ${includePath}

Full mapping (maintained in code):

${mappingLines}

## Required runtime variables

Your Symfony controller must create the TestDrive form and pass:

${runtimeVars}

- formtestdrive: Symfony Form view built from TestdriveType (models from Doctrine)
- currentLocale: active locale string (e.g. fr, ar)
- brand_slug / campaign_slug: routing/context identifiers for the campaign page

The builder does NOT fetch Auto Hall database models. Vehicle/model options
come from Symfony/Doctrine when the real site renders the form.

## Controller responsibilities

1. Load campaign/model context from Auto Hall DB via Doctrine repositories.
2. Create the form: $form = $this->createForm(TestdriveType::class, ...).
3. Pass formtestdrive and currentLocale to the Twig template.
4. Handle POST submission with existing Auto Hall lead/TestDrive workflows.

## Safety rules

- No arbitrary Twig paths in the builder — only whitelisted include keys.
- Do not paste user-authored Twig into exported templates.
- To change include paths, update SYMFONY_TESTDRIVE_INCLUDE_PATHS in the
  backend symfony-include-mapping.ts file and redeploy the export service.

## Page title reference

  ${input.pageTitle}
${pageSection}
Support: Auto Hall SI Digital
`;
}
