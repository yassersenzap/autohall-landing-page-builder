import { describe, expect, it } from 'vitest';
import { DEFAULT_AUTOHALL_CONSENT_LABEL } from '@/features/builder-engine/constants/autohall-lead-form';
import { buildDefaultStudioV2Document } from './default-document';

describe('buildDefaultStudioV2Document', () => {
  it('returns puck document with layout hierarchy', () => {
    const doc = buildDefaultStudioV2Document();
    expect(doc.root?.props).toBeTruthy();
    expect(doc.content?.[0]?.type).toBe('Section');
    expect(doc.content?.[0]?.props?.id).toBeTruthy();

    const sectionProps = doc.content?.[0]?.props as Record<string, unknown>;
    const items = sectionProps.items as Array<{ type: string; props: { id?: string } }>;
    expect(items?.[0]?.type).toBe('Container');
    expect(items?.[0]?.props.id).toBeTruthy();
  });

  it('includes theme preset and seo metadata on root', () => {
    const doc = buildDefaultStudioV2Document();
    const root = doc.root?.props as Record<string, unknown>;
    expect(root.themePreset).toBe('autohall-blue');
    expect(root.seo).toBeTruthy();
    expect((root.seo as { title?: string }).title).toBeTruthy();
    expect((root.seo as { description?: string }).description).toBeTruthy();
  });

  it('includes HeroAutoHall and LeadFormAutoHall in columns', () => {
    const doc = buildDefaultStudioV2Document();
    const sectionProps = doc.content?.[0]?.props as Record<string, unknown>;
    const container = (sectionProps.items as Array<{ props: Record<string, unknown> }>)?.[0];
    const columns = (container?.props.items as Array<{ props: Record<string, unknown> }>)?.[0];
    const colProps = columns?.props ?? {};
    const left = colProps.left as Array<{ type: string; props: Record<string, unknown> }>;
    const right = colProps.right as Array<{ type: string; props: Record<string, unknown> }>;
    expect(left?.[0]?.type).toBe('HeroAutoHall');
    expect(right?.[0]?.type).toBe('LeadFormAutoHall');
    expect(left?.[0]?.props.eyebrow).toBe('Auto Hall');
    expect(right?.[0]?.props.showCity).toBe(true);
    expect(right?.[0]?.props.consentText).toBe(DEFAULT_AUTOHALL_CONSENT_LABEL);
  });
});
