import { describe, expect, it } from 'vitest';
import { HERO_VEHICLE_OFFER_TYPE } from '../blocks/hero-vehicle-offer';
import {
  getAllPremiumBlockDefinitions,
  getPremiumBlockDefinition,
  hasPremiumBlockDefinition,
} from './block-registry';

describe('premium block-registry foundation', () => {
  it('registers and reads hero_vehicle_offer', () => {
    expect(hasPremiumBlockDefinition(HERO_VEHICLE_OFFER_TYPE)).toBe(true);

    const definition = getPremiumBlockDefinition(HERO_VEHICLE_OFFER_TYPE);
    expect(definition).toBeDefined();
    expect(definition?.type).toBe('hero_vehicle_offer');
    expect(definition?.builderRenderer).toBe('HeroVehicleOfferBlockPreview');
    expect(definition?.exportRenderer).toBe('hero-vehicle-offer.render');
    expect(definition?.availability).toBe('foundation');
  });

  it('exposes hero_vehicle_offer in the foundation catalog', () => {
    const types = getAllPremiumBlockDefinitions().map((d) => d.type);
    expect(types).toContain('hero_vehicle_offer');
  });

  it('hero_vehicle_offer includes design and image controls', () => {
    const definition = getPremiumBlockDefinition(HERO_VEHICLE_OFFER_TYPE);
    expect(definition?.designControls.length).toBeGreaterThan(0);
    expect(definition?.imageControls.length).toBeGreaterThan(0);

    const designKeys = definition?.designControls.map((c) => c.key) ?? [];
    expect(designKeys).toContain('tone');
    expect(designKeys).toContain('layoutVariant');

    const imageKeys = definition?.imageControls.map((c) => c.key) ?? [];
    expect(imageKeys).toContain('heroImage');
    expect(imageKeys).toContain('imageFit');
    expect(imageKeys).toContain('cropPreset');
    expect(definition?.editableFields.map((f) => f.key)).toContain('heroImageAlt');
    expect(imageKeys).toContain('overlayIntensity');
    expect(imageKeys).toContain('mobileImage');
  });

  it('hero_vehicle_offer default content includes brand and image fields', () => {
    const definition = getPremiumBlockDefinition(HERO_VEHICLE_OFFER_TYPE);
    const content = definition?.defaultContent;

    expect(content?.brandId).toBeTruthy();
    expect(content?.modelName).toBeTruthy();
    expect(content?.headline).toBeTruthy();
    expect(content?.heroImage).toBeNull();
    expect(content?.layoutVariant).toBe('split-media-right');
    expect(content?.mobileImage).toBeNull();
  });
});
