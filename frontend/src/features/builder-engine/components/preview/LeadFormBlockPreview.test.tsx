import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LeadFormBlockPreview } from './LeadFormBlockPreview';

describe('LeadFormBlockPreview', () => {
  it('rend le formulaire et le bouton submit dans le DOM', () => {
    render(
      <LeadFormBlockPreview
        propsJson={{
          title: 'Contact',
          submitText: 'Envoyer ma demande',
          fields: [
            { name: 'fullName', label: 'Nom', type: 'text', required: true },
            { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
          ],
        }}
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Contact');
    expect(screen.getByRole('button', { name: /envoyer ma demande/i })).toBeInTheDocument();
    expect(document.querySelector('.lp-lead-form__layout')).toBeTruthy();
  });
});
