import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { materializeCampaignTemplate } from '@/features/builder-engine/foundation/apply-campaign-template';
import { getCampaignPageTemplateById } from '@/features/builder-engine/foundation/campaign-page-templates';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { campaignLeadHeroDefaultContent } from '@/features/builder/blocks/campaign-lead-hero';
import { parseCampaignLeadHeroProps } from '@/features/builder/blocks/campaign-lead-hero/parse-campaign-lead-hero-props';
import { getInspectorControlsForBlock } from '@/features/builder/block-registry/inspector-controls-registry';
import { CampaignLeadHeroBlockPreview } from '@/features/builder-v3/canvas/blocks/legacy-components/CampaignLeadHeroBlockPreview';
import { DefinitionDrivenBlockInspector } from '@/features/builder-v3/panels/inspector/DefinitionDrivenBlockInspector';
import {
  DEFAULT_EXPORT_TARGET,
  DEFAULT_FORM_PROVIDER_TYPE,
  EXPORT_TARGET_DEFINITIONS,
  FORM_PROVIDER_DEFINITIONS,
  sanitizeExternalIframeSrc,
  sanitizeSymfonyIncludeKey,
} from './index';

describe('FormProvider contract', () => {
  it('defines defaults for all provider types', () => {
    expect(FORM_PROVIDER_DEFINITIONS.builder_lead_api).toMatchObject({
      endpointPath: '/api/public/leads',
    });
    expect(FORM_PROVIDER_DEFINITIONS.autohall_symfony_testdrive).toMatchObject({
      requiredRuntimeContext: expect.arrayContaining(['brand_slug']),
    });
    expect(FORM_PROVIDER_DEFINITIONS.external_iframe).toMatchObject({
      iframeSrcPlaceholder: expect.stringMatching(/^https:\/\//),
    });
  });

  it('rejects unsafe iframe src and unknown Symfony keys', () => {
    expect(sanitizeExternalIframeSrc('javascript:alert(1)')).toBe('');
    expect(sanitizeExternalIframeSrc('{% include "hack" %}')).toBe('');
    expect(sanitizeSymfonyIncludeKey('../../../twig/evil')).toBe('testdrive_campaign');
    expect(sanitizeSymfonyIncludeKey('testdrive_model')).toBe('testdrive_model');
  });
});

describe('ExportTarget contract', () => {
  it('defines safe defaults for all export targets', () => {
    expect(DEFAULT_EXPORT_TARGET).toBe('static_html');
    expect(EXPORT_TARGET_DEFINITIONS.static_html.outputKind).toBe('zip_html');
    expect(EXPORT_TARGET_DEFINITIONS.symfony_twig_page.outputKind).toBe('symfony_page');
    expect(EXPORT_TARGET_DEFINITIONS.symfony_twig_fragment.outputKind).toBe('symfony_partial');
  });
});

describe('campaign_lead_hero form integration', () => {
  const block = (): BuilderDocumentBlock => ({
    id: 'clh-1',
    type: 'campaign_lead_hero',
    label: 'Hero',
    sortOrder: 0,
    propsJson: {
      brandId: 'chery',
      campaignTitle: 'Test',
      formTitle: 'Contact',
      formCtaLabel: 'Go',
    },
  });

  it('defaults to builder_lead_api and static_html', () => {
    const parsed = parseCampaignLeadHeroProps({});
    expect(parsed.formProviderType).toBe(DEFAULT_FORM_PROVIDER_TYPE);
    expect(parsed.exportTarget).toBe(DEFAULT_EXPORT_TARGET);
    expect(campaignLeadHeroDefaultContent.formProviderType).toBe('builder_lead_api');
    expect(campaignLeadHeroDefaultContent.exportTarget).toBe('static_html');
  });

  it('inspector renders provider controls without raw Twig fields', () => {
    const controls = getInspectorControlsForBlock('campaign_lead_hero');
    const propKeys = controls.map((c) => c.propKey);
    expect(propKeys).not.toContain('twigPath');
    expect(propKeys).not.toContain('includePath');
    expect(propKeys).not.toContain('rawTwig');
    expect(controls.some((c) => c.propKey === 'formProviderType')).toBe(true);
    expect(controls.some((c) => c.propKey === 'exportTarget')).toBe(true);

    render(
      <DefinitionDrivenBlockInspector block={block()} tab="advanced" onPatch={() => {}} />,
    );
    expect(screen.getByLabelText('Fournisseur formulaire')).toBeInTheDocument();
    expect(screen.getByLabelText('Cible d’export')).toBeInTheDocument();
    expect(screen.queryByLabelText(/chemin twig/i)).not.toBeInTheDocument();
    expect(controls.some((c) => c.propKey === 'symfonyFormIncludeKey')).toBe(true);
  });

  it('shows Symfony include only for autohall_symfony_testdrive provider', () => {
    render(
      <DefinitionDrivenBlockInspector block={block()} tab="advanced" onPatch={() => {}} />,
    );
    expect(screen.queryByLabelText('Clé include TestDrive Symfony')).not.toBeInTheDocument();
    cleanup();

    render(
      <DefinitionDrivenBlockInspector
        block={{
          ...block(),
          propsJson: {
            ...block().propsJson,
            formProviderType: 'autohall_symfony_testdrive',
          },
        }}
        tab="advanced"
        onPatch={() => {}}
      />,
    );
    expect(screen.getByLabelText('Clé include TestDrive Symfony')).toBeInTheDocument();
  });

  it('shows external iframe field only for external_iframe provider', () => {
    render(
      <DefinitionDrivenBlockInspector
        block={{
          ...block(),
          propsJson: { ...block().propsJson, formProviderType: 'external_iframe' },
        }}
        tab="advanced"
        onPatch={() => {}}
      />,
    );
    expect(screen.getByLabelText('URL iframe externe')).toBeInTheDocument();
  });

  it('shows Symfony preview note in block preview', () => {
    render(
      <CampaignLeadHeroBlockPreview
        propsJson={{
          brandId: 'opel',
          campaignTitle: 'Essai',
          formTitle: 'Contact',
          formCtaLabel: 'Go',
          formProviderType: 'autohall_symfony_testdrive',
        }}
      />,
    );
    expect(screen.getByTestId('campaign-lead-symfony-form-note')).toHaveTextContent(
      'Formulaire Symfony Auto Hall — rendu réel côté site Auto Hall.',
    );
  });

  it('campaign templates materialize with valid provider defaults', () => {
    const template = getCampaignPageTemplateById('ford-offer-campaign')!;
    const blocks = materializeCampaignTemplate(template);
    const hero = blocks.find((b) => b.type === 'campaign_lead_hero');
    expect(hero?.propsJson.formProviderType).toBe('builder_lead_api');
    expect(hero?.propsJson.exportTarget).toBe('static_html');
  });
});
