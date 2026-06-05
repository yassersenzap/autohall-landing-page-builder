import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlocksTab } from './BlocksTab';
import { BuilderEditorProvider } from '../../context/BuilderEditorContext';

describe('BlocksTab palette', () => {
  it('does not render the upcoming blocks section', () => {
    render(
      <BuilderEditorProvider canWrite pageVersionId="v1">
        <BlocksTab />
      </BuilderEditorProvider>,
    );

    expect(screen.queryByText(/à venir/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bientôt/i)).not.toBeInTheDocument();
    expect(screen.getByText('Hero Campaign')).toBeInTheDocument();
    expect(screen.getByText('Formulaire Auto Hall')).toBeInTheDocument();
  });
});
