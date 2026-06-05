import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudioThemeProvider, useStudioTheme } from './StudioThemeContext';

function ThemeProbe() {
  const { mode, toggleMode } = useStudioTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button type="button" onClick={toggleMode}>
        Toggle
      </button>
    </div>
  );
}

describe('StudioThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-studio-theme');
  });

  it('defaults to dark mode when no preference is stored', () => {
    render(
      <StudioThemeProvider>
        <ThemeProbe />
      </StudioThemeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme without breaking document attributes', async () => {
    const user = userEvent.setup();
    render(
      <StudioThemeProvider>
        <ThemeProbe />
      </StudioThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-studio-theme')).toBe('light');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
