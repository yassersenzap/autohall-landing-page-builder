import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BlocksCatalogPanel } from '@/features/builder-v3/panels/BlocksCatalogPanel';
import { CoreCampaignFormLandingBlockPreview } from '@/features/builder-v3/canvas/blocks/CoreCampaignFormLandingBlockPreview';
import { TemplatesPanel } from '@/features/builder-v3/panels/TemplatesPanel';
import { getDefaultBlockProps } from '@/features/builder-engine/constants/default-block-props';
import {
  getAdvancedSectionCatalog,
  getComplementarySectionCatalog,
  getCoreBusinessCatalog,
} from '@/features/builder-engine/foundation/catalog-tiers';
import { LEGACY_BLOCK_TYPES } from '@/features/builder-engine/foundation/catalog-visibility';
import {
  materializeCampaignTemplate,
  selectFirstMeaningfulBlockId,
} from '@/features/builder-engine/foundation/apply-campaign-template';
import { getCampaignPageTemplateById } from '@/features/builder-engine/foundation/campaign-page-templates';
import { getCoreCampaignTemplates } from '@/features/builder-engine/foundation/core-campaign-templates';
import { CORE_CAMPAIGN_FORM_LANDING_INSPECTOR_CONTROLS } from '@/features/builder/blocks/core-campaign-form-landing/core-campaign-form-landing.inspector-controls';

describe('core campaign landing v1', () => {
  it('catalog archives all blocks including core landing', () => {
    render(<BlocksCatalogPanel />);
    const panel = screen.getByTestId('studio-blocks-panel');
    expect(panel.textContent).not.toContain('Landing image + formulaire');
    expect(panel.textContent).not.toContain('catalog-premium-animated-group');
    expect(panel.textContent).not.toContain('Véhicule & offre');
    expect(panel.textContent).not.toContain('Blocs de contenu');
    expect(screen.getByTestId('catalog-archived-blocks-section')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Blocs archivés/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: /Blocs archivés/i }));
    expect(
      screen
        .getByTestId('catalog-archived-blocks-section')
        .querySelector('[data-catalog-block="core_campaign_form_landing"]'),
    ).toBeTruthy();
    expect(
      screen.getByTestId('catalog-archived-blocks-section').querySelector('[data-catalog-block="rich_text"]'),
    ).toBeTruthy();
    expect(getCoreBusinessCatalog().map((b) => b.type)).toEqual(['core_campaign_form_landing']);

    for (const hidden of LEGACY_BLOCK_TYPES) {
      expect(panel.textContent).not.toContain(hidden);
    }
    const complementaryTypes = getComplementarySectionCatalog().map((b) => b.type);
    expect(complementaryTypes).not.toContain('promo_autohall');
    expect(complementaryTypes).not.toContain('hero_vehicle_offer');
    expect(complementaryTypes).not.toContain('vehicle_offer');
    expect(complementaryTypes).not.toContain('final_cta');
  });

  it('legacy blocks live in archived catalog', () => {
    const advancedTypes = getAdvancedSectionCatalog().map((b) => b.type);
    expect(advancedTypes).toContain('campaign_lead_hero');
    expect(advancedTypes).toContain('lead_form');
    expect(advancedTypes).toContain('hero_form_campaign');
    expect(advancedTypes).toContain('sticky_lead_cta');
    expect(advancedTypes).toContain('promo_autohall');
    expect(advancedTypes).toContain('hero_vehicle_offer');
    expect(advancedTypes).toContain('vehicle_offer');
    expect(advancedTypes).toContain('final_cta');
  });

  it('core block preview renders with layout class', () => {
    const props = getDefaultBlockProps('core_campaign_form_landing');
    render(<CoreCampaignFormLandingBlockPreview propsJson={props} interactive={false} />);
    expect(screen.getByTestId('core-campaign-form-landing-preview')).toBeTruthy();
    expect(screen.getByTestId('core-campaign-form-landing-preview').className).toContain(
      'lp-core-campaign-landing--image_left_form_right',
    );
  });

  it('core block preview renders step indicator and polished form card', () => {
    const props = {
      ...getDefaultBlockProps('core_campaign_form_landing'),
      stepCount: 2,
      formTitle: 'Réservez votre essai',
    };
    const { container } = render(
      <CoreCampaignFormLandingBlockPreview propsJson={props} interactive={false} />,
    );
    expect(screen.getByText('Étape 1/2')).toBeTruthy();
    expect(container.querySelector('.lp-core-campaign-landing__step-progress-fill')).toBeTruthy();
    expect(container.querySelector('.lp-core-campaign-landing__form-card')).toBeTruthy();
  });

  it('inspector exposes business-friendly groups', () => {
    const groups = new Set(CORE_CAMPAIGN_FORM_LANDING_INSPECTOR_CONTROLS.map((c) => c.group));
    expect(groups).toEqual(
      new Set(['Contenu', 'Visuel', 'Formulaire', 'Mise en page', 'Mentions légales']),
    );
  });

  it('layout switching updates preview class via business layout props', () => {
    const props = {
      ...getDefaultBlockProps('core_campaign_form_landing'),
      layoutDirection: 'image-left' as const,
      layoutVariant: 'banner' as const,
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
        propsJson={{ ...props, layoutDirection: 'image-right', layoutVariant: 'split' }}
        interactive={false}
      />,
    );
    expect(screen.getByTestId('core-campaign-form-landing-preview').className).toContain(
      'form_left_image_right',
    );
  });

  it('legacy coreLayout still resolves for old documents', () => {
    const props = {
      ...getDefaultBlockProps('core_campaign_form_landing'),
      coreLayout: 'background_image_form_card',
      layoutDirection: undefined,
    };
    delete (props as Record<string, unknown>).layoutDirection;
    delete (props as Record<string, unknown>).layoutVariant;
    render(<CoreCampaignFormLandingBlockPreview propsJson={props} interactive={false} />);
    expect(screen.getByTestId('core-campaign-form-landing-preview').className).toContain(
      'background_image_form_card',
    );
  });

  it('core templates panel lists métier templates in archive', () => {
    render(<TemplatesPanel />);
    fireEvent.click(screen.getByRole('button', { name: /Modèles archivés/i }));
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
