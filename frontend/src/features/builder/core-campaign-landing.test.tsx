import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlocksCatalogPanel } from '@/features/builder-v3/panels/BlocksCatalogPanel';
import { CoreCampaignFormLandingBlockPreview } from '@/features/builder-v3/canvas/blocks/CoreCampaignFormLandingBlockPreview';
import { TemplatesPanel } from '@/features/builder-v3/panels/TemplatesPanel';
import { getDefaultBlockProps } from '@/features/builder-engine/constants/default-block-props';
import {
  getAdvancedSectionCatalog,
  getCoreBusinessCatalog,
} from '@/features/builder-engine/foundation/catalog-tiers';
import { MAIN_CATALOG_HIDDEN_BLOCK_TYPES } from '@/features/builder-engine/foundation/catalog-visibility';
import {
  materializeCampaignTemplate,
  selectFirstMeaningfulBlockId,
} from '@/features/builder-engine/foundation/apply-campaign-template';
import { getCampaignPageTemplateById } from '@/features/builder-engine/foundation/campaign-page-templates';
import { getCoreCampaignTemplates } from '@/features/builder-engine/foundation/core-campaign-templates';
import { CORE_CAMPAIGN_FORM_LANDING_INSPECTOR_CONTROLS } from '@/features/builder/blocks/core-campaign-form-landing/core-campaign-form-landing.inspector-controls';

describe('core campaign landing v1', () => {
  it('catalog shows Landing métier first and hides duplicate form blocks from main path', () => {
    render(<BlocksCatalogPanel />);
    const panel = screen.getByTestId('studio-blocks-panel');
    const coreGroup = screen.getByTestId('catalog-core-business-group');
    expect(coreGroup.textContent).toContain('Landing image + formulaire');
    expect(panel.textContent).not.toContain('catalog-premium-animated-group');
    expect(getCoreBusinessCatalog().map((b) => b.type)).toEqual(['core_campaign_form_landing']);

    for (const hidden of MAIN_CATALOG_HIDDEN_BLOCK_TYPES) {
      expect(screen.queryByText(new RegExp(hidden, 'i'))).toBeNull();
    }
  });

  it('premium and legacy form blocks live in advanced catalog only', () => {
    const advancedTypes = getAdvancedSectionCatalog().map((b) => b.type);
    expect(advancedTypes).toContain('campaign_lead_hero');
    expect(advancedTypes).toContain('lead_form');
    expect(advancedTypes).toContain('hero_form_campaign');
    expect(advancedTypes).toContain('sticky_lead_cta');
  });

  it('core block preview renders with layout class', () => {
    const props = getDefaultBlockProps('core_campaign_form_landing');
    render(<CoreCampaignFormLandingBlockPreview propsJson={props} interactive={false} />);
    expect(screen.getByTestId('core-campaign-form-landing-preview')).toBeTruthy();
    expect(screen.getByTestId('core-campaign-form-landing-preview').className).toContain(
      'lp-core-campaign-landing--image_left_form_right',
    );
  });

  it('inspector exposes business-friendly groups', () => {
    const groups = new Set(CORE_CAMPAIGN_FORM_LANDING_INSPECTOR_CONTROLS.map((c) => c.group));
    expect(groups).toEqual(
      new Set(['Contenu', 'Visuel', 'Formulaire', 'Mise en page', 'Mentions légales']),
    );
  });

  it('layout switching updates preview class', () => {
    const props = {
      ...getDefaultBlockProps('core_campaign_form_landing'),
      coreLayout: 'full_width_banner_form_side',
      title: 'Campagne test',
      formTitle: 'Formulaire',
    };
    const { rerender } = render(
      <CoreCampaignFormLandingBlockPreview propsJson={props} interactive={false} />,
    );
    expect(screen.getByTestId('core-campaign-form-landing-preview').className).toContain(
      'full_width_banner_form_side',
    );

    rerender(
      <CoreCampaignFormLandingBlockPreview
        propsJson={{ ...props, coreLayout: 'form_left_image_right' }}
        interactive={false}
      />,
    );
    expect(screen.getByTestId('core-campaign-form-landing-preview').className).toContain(
      'form_left_image_right',
    );
  });

  it('core templates panel lists métier templates first', () => {
    render(<TemplatesPanel />);
    const coreSection = screen.getByTestId('core-campaign-templates');
    expect(coreSection.textContent).toContain('Campagne visuel + formulaire');
    expect(coreSection.textContent).toContain('Modèle véhicule + essai');
    expect(coreSection.textContent).toContain('Gamme / offre + formulaire');
    expect(getCoreCampaignTemplates().length).toBe(3);
  });

  it('core templates apply with canonical block', () => {
    for (const template of getCoreCampaignTemplates()) {
      const resolved = getCampaignPageTemplateById(template.id);
      expect(resolved).toBeDefined();
      const blocks = materializeCampaignTemplate(resolved!);
      expect(blocks.some((b) => b.type === 'core_campaign_form_landing')).toBe(true);
      expect(selectFirstMeaningfulBlockId(blocks)).toBe(blocks[0]?.id);
    }
  });

  it('old documents with hidden blocks still materialize', () => {
    const legacy = getCampaignPageTemplateById('chery-campaign-offer');
    expect(legacy).toBeDefined();
    const blocks = materializeCampaignTemplate(legacy!);
    expect(blocks.some((b) => b.type === 'campaign_lead_hero')).toBe(true);
    expect(blocks.length).toBeGreaterThan(0);
  });
});
