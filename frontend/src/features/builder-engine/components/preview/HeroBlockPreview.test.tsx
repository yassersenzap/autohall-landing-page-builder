import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroBlockPreview } from './HeroBlockPreview';

describe('HeroBlockPreview empty states', () => {
  it('shows canvas hint when hero has no title', () => {
    render(
      <HeroBlockPreview
        propsJson={{
          title: '',
          subtitle: '',
          imageUrl: '',
          imageAssetId: '',
          backgroundTheme: 'light',
        }}
      />,
    );

    expect(screen.getByText('Titre principal à renseigner')).toBeInTheDocument();
    expect(screen.getByText('Titre principal à renseigner')).toHaveAttribute(
      'data-builder-empty-hint',
    );
  });
});
