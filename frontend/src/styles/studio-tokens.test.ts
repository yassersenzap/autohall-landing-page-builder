import { describe, expect, it } from 'vitest';
import tokensSource from './studio-tokens.css?raw';

describe('Auto Hall Studio OS tokens', () => {
  it('defines layered color tokens without pure black backgrounds', () => {
    expect(tokensSource).toContain('--color-bg: #0a0b0d');
    expect(tokensSource).toContain('--color-bg: #f5f7fb');
    expect(tokensSource).not.toContain('--color-bg: #000');
    expect(tokensSource).not.toContain('--studio-bg: #050505');
  });

  it('defines required semantic tokens', () => {
    const required = [
      '--color-surface',
      '--color-surface-2',
      '--color-surface-3',
      '--color-panel',
      '--color-border-strong',
      '--color-primary-soft',
      '--color-accent',
      '--shadow-lg',
      '--space-8',
      '--font-sans',
      '--font-display',
    ];
    for (const token of required) {
      expect(tokensSource).toContain(token);
    }
  });
});
