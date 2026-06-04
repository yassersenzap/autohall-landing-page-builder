import type { Editor } from 'grapesjs';

const LEAD_FORM_INNER = `
<div class="lp-lead-form__layout">
  <aside class="lp-lead-form__aside">
    <h2 class="lp-lead-form__title">Votre demande</h2>
    <p class="lp-lead-form__subtitle">Complétez le formulaire ci-dessous.</p>
  </aside>
  <div class="lp-lead-form__card">
    <form class="lp-lead-form__form" action="#" method="post" novalidate>
      <div class="lp-lead-form__grid">
        <label class="lp-lead-form__field"><span class="lp-lead-form__label">Nom complet *</span><input class="lp-lead-form__input" type="text" name="fullName" required /></label>
        <label class="lp-lead-form__field"><span class="lp-lead-form__label">Téléphone *</span><input class="lp-lead-form__input" type="tel" name="phone" required /></label>
        <label class="lp-lead-form__field"><span class="lp-lead-form__label">Email</span><input class="lp-lead-form__input" type="email" name="email" /></label>
        <label class="lp-lead-form__field"><span class="lp-lead-form__label">Modèle souhaité</span><input class="lp-lead-form__input" type="text" name="vehicleModel" /></label>
      </div>
      <p class="lp-lead-form__feedback" role="status" aria-live="polite"></p>
      <button type="submit" class="lp-btn lp-btn--primary lp-btn--lg">Envoyer ma demande</button>
      <p class="lp-lead-form__privacy">Vos données sont traitées conformément à notre politique de confidentialité.</p>
    </form>
  </div>
</div>`;

export function registerAutoHallBlocks(editor: Editor) {
  const bm = editor.BlockManager;

  bm.add('ah-section', {
    label: 'Section',
    category: 'Structure',
    content: {
      tagName: 'section',
      classes: ['lp-section', 'ah-section'],
      components: '<div class="container" style="max-width:72rem;margin:0 auto;padding:2rem 1.25rem"></div>',
    },
  });

  bm.add('ah-columns', {
    label: 'Colonnes',
    category: 'Structure',
    content: `<div class="ah-columns" style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;max-width:72rem;margin:0 auto;padding:1rem 1.25rem"></div>`,
  });

  bm.add('ah-heading', {
    label: 'Titre',
    category: 'Contenu',
    content: '<h2 class="ah-heading" style="font-size:2rem;font-weight:700;margin:0 0 0.5rem">Titre</h2>',
  });

  bm.add('ah-text', {
    label: 'Texte',
    category: 'Contenu',
    content: '<p class="ah-text" style="line-height:1.6;margin:0 0 1rem">Votre paragraphe ici.</p>',
  });

  bm.add('ah-image', {
    label: 'Image',
    category: 'Média',
    content: {
      type: 'image',
      attributes: { alt: '' },
      style: { 'max-width': '100%', height: 'auto', 'object-fit': 'cover' },
    },
  });

  bm.add('ah-button', {
    label: 'Bouton',
    category: 'Contenu',
    content:
      '<a class="lp-btn lp-btn--primary" href="#lead-form" style="display:inline-flex;padding:0.75rem 1.5rem;background:#b91c1c;color:#fff;border-radius:999px;text-decoration:none;font-weight:600">Appel à l’action</a>',
  });

  bm.add('ah-hero', {
    label: 'Hero Auto Hall',
    category: 'Auto Hall',
    content: `<section class="lp-hero ah-hero" style="padding:3rem 1.25rem;background:#fafafa">
      <div style="max-width:72rem;margin:0 auto;display:grid;gap:2rem;align-items:center">
        <div><p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:#b91c1c">Accroche</p>
        <h1 style="font-size:2.5rem;font-weight:700;margin:0.5rem 0">Titre principal</h1>
        <p style="font-size:1.125rem;color:#52525b">Sous-titre de l’offre.</p>
        <a class="lp-btn lp-btn--primary" href="#lead-form" style="display:inline-flex;margin-top:1rem;padding:0.75rem 1.5rem;background:#b91c1c;color:#fff;border-radius:999px;text-decoration:none">Demander un essai</a></div>
        <div data-gjs-type="image" style="min-height:200px;background:#e4e4e7;border-radius:1rem"></div>
      </div>
    </section>`,
  });

  bm.add('ah-lead-form', {
    label: 'Formulaire lead',
    category: 'Auto Hall',
    content: `<section class="lp-block lp-lead-form" id="lead-form" style="padding:2rem 1.25rem">${LEAD_FORM_INNER}</section>`,
  });

  bm.add('ah-cta', {
    label: 'Bandeau CTA',
    category: 'Auto Hall',
    content: `<section class="lp-final-cta" style="padding:2.5rem 1.25rem;text-align:center;background:#18181b;color:#fff">
      <h2 style="margin:0 0 0.5rem">Prêt à passer à l’action ?</h2>
      <p style="margin:0 0 1.25rem;opacity:0.85">Contactez-nous dès maintenant.</p>
      <a class="lp-btn lp-btn--primary" href="#lead-form" style="display:inline-flex;padding:0.75rem 1.5rem;background:#fff;color:#18181b;border-radius:999px;text-decoration:none;font-weight:600">Je contacte Auto Hall</a>
    </section>`,
  });

  bm.add('ah-trust', {
    label: 'Bandeau confiance',
    category: 'Auto Hall',
    content: `<section class="lp-trust-bar" style="padding:1.5rem 1.25rem;background:#f4f4f5">
      <div style="max-width:72rem;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;text-align:center">
        <div><strong style="font-size:1.25rem">4.8/5</strong><p style="margin:0;font-size:0.8rem">Satisfaction</p></div>
        <div><strong style="font-size:1.25rem">48h</strong><p style="margin:0;font-size:0.8rem">Réponse</p></div>
        <div><strong style="font-size:1.25rem">15+</strong><p style="margin:0;font-size:0.8rem">Années</p></div>
        <div><strong style="font-size:1.25rem">100%</strong><p style="margin:0;font-size:0.8rem">Contrôlé</p></div>
      </div>
    </section>`,
  });

  bm.add('ah-faq', {
    label: 'FAQ',
    category: 'Auto Hall',
    content: `<section class="lp-faq" style="padding:2rem 1.25rem;max-width:48rem;margin:0 auto">
      <h2 style="margin-bottom:1rem">Questions fréquentes</h2>
      <details style="margin-bottom:0.5rem;border:1px solid #e4e4e7;border-radius:0.5rem;padding:0.75rem"><summary>Question</summary><p style="margin:0.5rem 0 0">Réponse.</p></details>
    </section>`,
  });

  bm.add('ah-footer', {
    label: 'Mentions légales',
    category: 'Auto Hall',
    content: `<footer class="lp-footer-legal" style="padding:1.5rem 1.25rem;font-size:0.75rem;color:#71717a;background:#fafafa">
      <p style="max-width:72rem;margin:0 auto">Mentions légales — renseignez votre texte ici.</p>
    </footer>`,
  });

  bm.add('ah-spacer', {
    label: 'Espacement',
    category: 'Structure',
    content: '<div class="ah-spacer" style="height:3rem" aria-hidden="true"></div>',
  });
}
