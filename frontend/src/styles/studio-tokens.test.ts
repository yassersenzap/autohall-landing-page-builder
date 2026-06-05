import { describe, expect, it } from 'vitest';
import tokensSource from './studio-tokens.css?raw';

describe('Auto Hall Studio OS tokens', () => {
  it('defines layered color tokens without pure black backgrounds', () => {
    expect(tokensSource).toContain('--color-bg: #080b12');
    expect(tokensSource).toContain('--color-bg: #f3f6fa');
    expect(tokensSource).not.toContain('--color-bg: #000');
    expect(tokensSource).not.toContain('--studio-bg: #050505');
  });

  it('defines required semantic tokens', () => {
    const required = [
      '--color-surface',
      '--color-surface-2',
      '--color-surface-3',
      '--color-panel',
      '--color-input-bg',
      '--color-input-border',
      '--color-border-strong',
      '--color-primary-soft',
      '--color-accent',
      '--color-accent-electric',
      '--shadow-lg',
      '--shadow-card',
      '--space-8',
      '--font-sans',
      '--font-display',
    ];
    for (const token of required) {
      expect(tokensSource).toContain(token);
    }
  });
});
