import { describe, expect, it } from 'vitest';
import { resolveOutlineLabel } from './outline-labels';

describe('resolveOutlineLabel', () => {
  it('prefixes hero with title', () => {
    expect(
      resolveOutlineLabel('HeroAutoHall', { title: 'Votre entretien à prix maîtrisé' }),
    ).toBe('Hero — Votre entretien à prix maîtrisé');
  });

  it('describes benefits card count', () => {
    expect(
      resolveOutlineLabel('Benefits', { items: [{}, {}, {}] }),
    ).toBe('Avantages — 3 cartes');
  });

  it('labels lead form from title', () => {
    expect(
      resolveOutlineLabel('LeadFormAutoHall', { title: 'Prenez rendez-vous SAV' }),
    ).toBe('Formulaire — Prenez rendez-vous SAV');
  });
});
