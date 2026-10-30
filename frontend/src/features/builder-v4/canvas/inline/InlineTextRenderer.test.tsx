import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { InlineTextRenderer } from './InlineTextRenderer';
import { readTextField } from '../../lib/editable-text';
import { createPopulatedHeroFormDocument } from '../../templates/campaign-hero-form';
import { useBuilderV4Store } from '../../store/document.store';
import { useEditingStore } from '../../store/editing.store';

describe('InlineTextRenderer', () => {
  beforeEach(() => {
    const document = createPopulatedHeroFormDocument();
    useBuilderV4Store.setState({ document, selectedNodeId: null, previewMode: false });
    useEditingStore.setState({ session: null });
  });

  it('opens Lexical editor on double-click', () => {
    const form = Object.values(useBuilderV4Store.getState().document.nodes).find((n) => n.kind === 'form');
    expect(form).toBeDefined();

    render(
      <InlineTextRenderer
        nodeId={form!.id}
        fieldKey="form.stepTitle"
        text="Titre test"
        as="h2"
        editorMode
        testId="inline-text-step-title"
      />,
    );

    fireEvent.doubleClick(screen.getByTestId('inline-text-step-title'));
    expect(screen.getByTestId('inline-lexical-editor')).toBeInTheDocument();
  });

  it('commits edited text on Enter', () => {
    const form = Object.values(useBuilderV4Store.getState().document.nodes).find((n) => n.kind === 'form');
    expect(form).toBeDefined();

    render(
      <InlineTextRenderer
        nodeId={form!.id}
        fieldKey="form.stepTitle"
        text="Titre test"
        as="h2"
        editorMode
        testId="inline-text-step-title"
      />,
    );

    fireEvent.doubleClick(screen.getByTestId('inline-text-step-title'));
    const editable = screen.getByTestId('inline-lexical-editor').querySelector('[contenteditable="true"]');
    expect(editable).toBeTruthy();
    useEditingStore.getState().commitEditing('Nouveau titre inline');
    const updated = useBuilderV4Store.getState().document.nodes[form!.id];
    expect(readTextField(updated, 'form.stepTitle')).toBe('Nouveau titre inline');
  });
});
