import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import LandingStudioLegacyRedirect from './LandingStudioLegacyRedirect';

const pageVersionId = '11111111-1111-1111-1111-111111111111';

describe('LandingStudioLegacyRedirect', () => {
  it('redirects /blocks to the official studio route', () => {
    render(
      <MemoryRouter initialEntries={[`/page-versions/${pageVersionId}/blocks`]}>
        <Routes>
          <Route
            path="/page-versions/:pageVersionId/blocks"
            element={<LandingStudioLegacyRedirect target="studio" />}
          />
          <Route
            path="/page-versions/:pageVersionId/studio"
            element={<div data-testid="studio">Studio</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('studio')).toBeInTheDocument();
  });

  it('redirects legacy preview to studio preview', () => {
    render(
      <MemoryRouter initialEntries={[`/page-versions/${pageVersionId}/preview`]}>
        <Routes>
          <Route
            path="/page-versions/:pageVersionId/preview"
            element={<LandingStudioLegacyRedirect target="preview" />}
          />
          <Route
            path="/page-versions/:pageVersionId/studio/preview"
            element={<div data-testid="studio-preview">Preview</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('studio-preview')).toBeInTheDocument();
  });
});
