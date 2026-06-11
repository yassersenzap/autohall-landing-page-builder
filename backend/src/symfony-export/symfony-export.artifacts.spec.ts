import { describe, expect, it } from '@jest/globals';
import { BuilderV3HtmlCompilerService } from '../studio-v2-renderer/builder-v3-html-compiler.service';
import { buildBuilderV3ZipEntries } from '../studio-v2-renderer/builder-v3-export.utils';
import {
  SYMFONY_FRAGMENT_ZIP_PATH,
  SYMFONY_PAGE_EXAMPLE_ZIP_PATH,
  SYMFONY_README_ZIP_PATH,
  analyzeSymfonyExportPlan,
  buildSymfonyExportZipEntries,
} from './symfony-export.artifacts';

describe('symfony-export.artifacts', () => {
  const compiler = new BuilderV3HtmlCompilerService();

  const baseHeroProps = {
    brandId: 'chery',
    campaignTitle: 'Chery Tiggo',
    formTitle: 'Demandez votre offre',
    formCtaLabel: 'Continuer',
  };

  it('does not plan Symfony artifacts for static_html + builder_lead_api', () => {
    const plan = analyzeSymfonyExportPlan([
      {
        type: 'campaign_lead_hero',
        propsJson: {
          ...baseHeroProps,
          formProviderType: 'builder_lead_api',
          exportTarget: 'static_html',
        },
      },
    ]);

    expect(plan.includeArtifacts).toBe(false);
    expect(buildSymfonyExportZipEntries({ blocks: [], pageTitle: 'Test' })).toEqual(
      [],
    );
  });

  it('generates fragment and README when provider is autohall_symfony_testdrive', () => {
    const blocks = [
      {
        type: 'campaign_lead_hero',
        propsJson: {
          ...baseHeroProps,
          formProviderType: 'autohall_symfony_testdrive',
          exportTarget: 'symfony_twig_fragment',
          symfonyFormIncludeKey: 'testdrive_promo',
        },
      },
    ];

    const entries = buildSymfonyExportZipEntries({
      blocks,
      pageTitle: 'Promo Chery',
    });

    expect(entries.map((e) => e.path)).toEqual([
      SYMFONY_FRAGMENT_ZIP_PATH,
      SYMFONY_README_ZIP_PATH,
    ]);

    const fragment = entries.find((e) => e.path === SYMFONY_FRAGMENT_ZIP_PATH)!
      .content;
    expect(fragment).toContain('testdrive_promo');
    expect(fragment).toContain('_promo_form.html.twig');
    expect(entries.find((e) => e.path === SYMFONY_README_ZIP_PATH)!.content).toContain(
      'TestdriveType',
    );
  });

  it('generates page example when exportTarget is symfony_twig_page', () => {
    const entries = buildSymfonyExportZipEntries({
      blocks: [
        {
          type: 'campaign_lead_hero',
          propsJson: {
            ...baseHeroProps,
            formProviderType: 'autohall_symfony_testdrive',
            exportTarget: 'symfony_twig_page',
          },
        },
      ],
      pageTitle: 'Page campagne',
    });

    expect(entries.some((e) => e.path === SYMFONY_PAGE_EXAMPLE_ZIP_PATH)).toBe(true);
  });

  it('sanitizes unknown include key in generated artifacts', () => {
    const entries = buildSymfonyExportZipEntries({
      blocks: [
        {
          type: 'campaign_lead_hero',
          propsJson: {
            ...baseHeroProps,
            formProviderType: 'autohall_symfony_testdrive',
            symfonyFormIncludeKey: 'raw/path/evil.twig',
          },
        },
      ],
      pageTitle: 'Safe',
    });

    const fragment = entries.find((e) => e.path === SYMFONY_FRAGMENT_ZIP_PATH)!
      .content;
    expect(fragment).toContain('testdrive_campaign');
    expect(fragment).not.toContain('evil.twig');
  });

  it('keeps static zip entries unchanged and index.html free of Twig syntax', () => {
    const html = compiler.compile({
      pageTitle: 'Static',
      metaDescription: 'Desc',
      primaryColor: '#b91c1c',
      secondaryColor: '#1e293b',
      headingFont: 'Inter',
      bodyFont: 'Roboto',
      blocks: [
        {
          type: 'campaign_lead_hero',
          sortOrder: 1,
          propsJson: {
            ...baseHeroProps,
            formProviderType: 'autohall_symfony_testdrive',
            exportTarget: 'symfony_twig_page',
          },
        },
      ],
      renderContext: { mode: 'export', assetMap: {} },
    });

    expect(html).not.toMatch(/\{%|\{\{/);
    expect(html).toContain('Formulaire Symfony Auto Hall');

    const symfonyEntries = buildSymfonyExportZipEntries({
      blocks: [
        {
          type: 'campaign_lead_hero',
          propsJson: {
            ...baseHeroProps,
            formProviderType: 'autohall_symfony_testdrive',
            exportTarget: 'symfony_twig_page',
          },
        },
      ],
      pageTitle: 'Static',
    });

    const zipEntries = buildBuilderV3ZipEntries({
      indexHtml: html,
      landingConfigJs: 'window.LANDING_CONFIG = {};',
      assetMap: {},
      extraTextEntries: symfonyEntries,
    });

    const corePaths = zipEntries
      .filter((e) => e.kind === 'text')
      .map((e) => e.path);

    expect(corePaths).toContain('index.html');
    expect(corePaths).toContain('assets/style.css');
    expect(corePaths).toContain('js/lead-form.js');
    expect(corePaths).toContain(SYMFONY_FRAGMENT_ZIP_PATH);
    expect(
      zipEntries.find((e) => e.kind === 'text' && e.path === 'index.html')?.content,
    ).not.toMatch(/\{%|\{\{/);
  });
});
