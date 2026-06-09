import { BuilderV3HtmlCompilerService } from './builder-v3-html-compiler.service';

describe('BuilderV3HtmlCompilerService', () => {
  const compiler = new BuilderV3HtmlCompilerService();

  it('produces HTML5 document with landing CSS and primary color tokens', () => {
    const html = compiler.compile({
      pageTitle: 'Promo Ford',
      metaDescription: 'Offre exclusive Auto Hall',
      primaryColor: '#b91c1c',
      secondaryColor: '#1e293b',
      headingFont: 'Inter',
      bodyFont: 'Roboto',
      blocks: [
        {
          type: 'cta_band',
          sortOrder: 1,
          propsJson: {
            title: 'Prêt à essayer ?',
            buttonText: 'Réserver',
            buttonHref: '#lead-form',
          },
        },
        {
          type: 'lead_form',
          sortOrder: 2,
          propsJson: {
            title: 'Contact',
            submitText: 'Envoyer',
          },
        },
      ],
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('assets/style.css');
    expect(html).toContain('lp-document');
    expect(html).toContain('--lp-primary: #b91c1c');
    expect(html).toContain('Promo Ford');
    expect(html).toContain('Offre exclusive Auto Hall');
    expect(html).toContain('lp-lead-form__layout');
    expect(html).toContain('js/lead-form.js');
  });
});
