import { beforeEach, describe, expect, it } from 'vitest';
import { readTextField, writeTextFieldPatch } from '../lib/editable-text';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { insertHeroOverlayText } from '../lib/geometry/hero-overlay-text';
import { useEditingStore } from './editing.store';
import { useBuilderV4Store } from './document.store';

describe('editable-text', () => {
  it('reads form step title from campaign multi-step template', () => {
    const doc = createPopulatedHeroFormDocument();
    const form = Object.values(doc.nodes).find((n) => n.kind === 'form');
    expect(form).toBeDefined();
    expect((form!.props as { variant?: string }).variant).toBe('campaign');
    expect(readTextField(form!, 'form.stepTitle')).toContain('Sélectionnez le véhicule');
    expect((form!.props as { fields: unknown[] }).fields.length).toBeGreaterThan(0);
  });

  it('writes text patch for overlay text nodes', () => {
    const doc = createPopulatedHeroFormDocument();
    const heroImage = Object.values(doc.nodes).find((n) => n.name === 'ImageLayer')!;
    const inserted = insertHeroOverlayText(doc.nodes, heroImage.id, { text: 'Titre' }, doc.rootId)!;
    const title = inserted.nodes[inserted.textId];
    const patch = writeTextFieldPatch(title, 'text', 'Nouveau titre');
    expect(patch).toEqual({ text: 'Nouveau titre', content: 'Nouveau titre' });
  });

  it('writes campaign step title into steps array', () => {
    const doc = createPopulatedHeroFormDocument();
    const form = Object.values(doc.nodes).find((n) => n.kind === 'form')!;
    const patch = writeTextFieldPatch(form, 'form.stepTitle', 'Titre étape 1');
    expect((patch as { steps?: { title: string }[] }).steps?.[0]?.title).toBe('Titre étape 1');
  });
});

describe('useEditingStore', () => {
  beforeEach(() => {
    useBuilderV4Store.getState().loadTemplate('blank');
    useBuilderV4Store.getState().insertCanvasBlock('hero-form');
    useEditingStore.getState().cancelEditing();
  });

  it('commits inline edit to document store', () => {
    const form = Object.values(useBuilderV4Store.getState().document.nodes).find((n) => (n.props as any)?.blockType === 'hero-form');
    expect(form).toBeDefined();

    useEditingStore.getState().startEditing(form!.id, 'form.stepTitle');
    useEditingStore.getState().commitEditing('Titre modifié en inline');

    const updated = useBuilderV4Store.getState().getNode(form!.id);
    expect(readTextField(updated!, 'form.stepTitle')).toBe('Titre modifié en inline');
    expect(useEditingStore.getState().session).toBeNull();
  });

  it('cancelEditing clears session without mutating document', () => {
    const form = Object.values(useBuilderV4Store.getState().document.nodes).find((n) => (n.props as any)?.blockType === 'hero-form');
    const before = readTextField(form!, 'form.stepTitle');

    useEditingStore.getState().startEditing(form!.id, 'form.stepTitle');
    useEditingStore.getState().cancelEditing();

    expect(useEditingStore.getState().session).toBeNull();
    expect(readTextField(useBuilderV4Store.getState().getNode(form!.id)!, 'form.stepTitle')).toBe(before);
  });
});
