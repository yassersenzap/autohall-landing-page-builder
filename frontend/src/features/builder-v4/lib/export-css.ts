/**
 * export-css.ts — Complete CSS for all 9 landing page blocks.
 * Single file, no dependencies. Used in ZIP export.
 * Desktop / Tablet (768px) / Mobile (480px).
 */

export function generateExportCss(): string {
  return `/* ══════════════════════════════════════════════════════════════
   AutoHall Landing Studio — style.css
   Generated automatically. Do not edit manually.
   ══════════════════════════════════════════════════════════════ */

/* ── Variables ─────────────────────────────────────────────────── */
:root {
  --accent: #e85d04;
  --accent-light: rgba(232,93,4,0.12);
  --dark: #111827;
  --muted: #6b7280;
  --light: #f9fafb;
  --border: #f0f0f0;
  --white: #ffffff;
  --font: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --max-w: 1200px;
  --radius-card: 18px;
  --shadow-card: 0 1px 3px rgba(0,0,0,.05), 0 8px 24px rgba(0,0,0,.06);
}

/* ── Reset ─────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font);
  color: var(--dark);
  background: var(--white);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
img { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; }
section, footer, header { width: 100%; box-sizing: border-box; }
ul { list-style: none; padding: 0; margin: 0; }
details > summary::-webkit-details-marker { display: none; }

/* ── Typography ────────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.025em;
  color: var(--dark);
}
h1 { font-size: clamp(2rem, 5vw, 3.5rem); }
h2 { font-size: clamp(1.8rem, 3.5vw, 2.6rem); }
h3 { font-size: clamp(1.2rem, 2vw, 1.5rem); }
p { font-size: 16px; line-height: 1.72; color: #4b5563; }
strong { font-weight: 700; }

/* ── Common section structure ──────────────────────────────────── */
.lp-section { padding: 80px 5%; }
.lp-inner { max-width: var(--max-w); margin: 0 auto; }
.lp-section-header { text-align: center; margin-bottom: 52px; }
.lp-section-header h2 { margin-bottom: 14px; }
.lp-section-header p { font-size: 17px; color: var(--muted); line-height: 1.65; max-width: 560px; margin: 0 auto; }
.lp-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  display: block;
  margin-bottom: 14px;
}

/* ── Card base ─────────────────────────────────────────────────── */
.lp-card {
  background: var(--white);
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}

/* ── Button ────────────────────────────────────────────────────── */
.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  padding: 0 32px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  letter-spacing: 0.01em;
  text-decoration: none;
  transition: transform 120ms ease, box-shadow 120ms ease;
}
.lp-btn--primary {
  background: var(--accent);
  color: var(--white);
  box-shadow: 0 4px 16px rgba(232,93,4,0.3);
}
.lp-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(232,93,4,0.38);
}
.lp-btn--secondary {
  background: var(--white);
  color: var(--accent);
  border: 2px solid var(--accent);
}
.lp-btn--secondary:hover { background: var(--accent-light); }

/* ══════════════════════════════════════════════════════════════
   BLOCK 1 — HERO + FORM
   ══════════════════════════════════════════════════════════════ */
.lp-hero {
  min-height: 70vh;
  display: grid;
  grid-template-columns: 1fr minmax(320px, 480px);
  gap: 48px;
  align-items: center;
  padding: 80px 5%;
  background-size: cover;
  background-position: center;
  font-family: var(--font);
}
.lp-hero__content { color: var(--white); display: flex; flex-direction: column; gap: 22px; }
.lp-hero__badge {
  display: inline-flex;
  width: fit-content;
  padding: 6px 14px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 24px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.92);
}
.lp-hero__title {
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: var(--white);
  margin: 0;
}
.lp-hero__subtitle { font-size: clamp(1rem, 1.8vw, 1.15rem); line-height: 1.65; color: rgba(255,255,255,0.82); }
.lp-hero__bullets { display: flex; flex-direction: column; gap: 10px; }
.lp-hero__bullet {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.88);
}
.lp-hero__bullet-icon {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: 10px;
  color: var(--white);
}

/* Form card */
.lp-form-card {
  background: var(--white);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.05), 0 4px 8px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.1);
  width: 100%;
}
.lp-form-stepper { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.lp-form-stepper__dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: background 200ms;
  flex-shrink: 0;
}
.lp-form-stepper__dot--active {
  width: 12px; height: 12px;
  background: var(--accent);
  box-shadow: 0 0 0 3px rgba(232,93,4,0.18);
}
.lp-form-stepper__dot--done { background: var(--accent); opacity: 0.55; }
.lp-form__step-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
.lp-form__title { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: var(--dark); margin-bottom: 6px; }
.lp-form__subtitle { font-size: 13px; color: var(--muted); line-height: 1.55; margin-bottom: 18px; }
.lp-form__fields { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.lp-field { display: flex; flex-direction: column; gap: 5px; width: 100%; }
.lp-field--half { width: calc(50% - 6px); }
.lp-field__label { font-size: 13px; font-weight: 600; color: #374151; }
.lp-field__required { color: var(--accent); margin-left: 2px; }
.lp-field__input {
  height: 46px;
  padding: 0 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: var(--dark);
  background: #fafafa;
  font-family: var(--font);
  outline: none;
  transition: border-color 120ms, box-shadow 120ms;
  width: 100%;
}
.lp-field__input::placeholder { color: #9ca3af; }
.lp-field__input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(232,93,4,0.12); background: var(--white); }
.lp-field__input--error { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important; }
.lp-field__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='10'%3E%3Cpath d='M1 1l6 6 6-6' stroke='%236b7280' fill='none' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}
.lp-field__consent { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 13px; color: var(--muted); line-height: 1.5; }
.lp-field__consent input { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; accent-color: var(--accent); }
.lp-form__actions { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.lp-form__btn-back {
  height: 46px;
  padding: 0 16px;
  background: transparent;
  color: var(--muted);
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  transition: background 120ms;
}
.lp-form__btn-back:hover { background: #f9fafb; }
.lp-form__btn-next {
  flex: 1;
  height: 50px;
  background: var(--accent);
  color: var(--white);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(232,93,4,0.32);
  transition: transform 100ms, box-shadow 100ms;
}
.lp-form__btn-next:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,93,4,0.38); }
.lp-form__btn-next:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.lp-form__success { display: none; text-align: center; padding: 20px 0; }
.lp-form__success-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: #d1fae5;
  color: #059669;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
  font-size: 24px;
}
.lp-form__success-title { font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
.lp-form__success-msg { font-size: 13px; color: var(--muted); }
.lp-form__error {
  display: none;
  padding: 10px 14px;
  background: #fff7f7;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 13px;
  color: #ef4444;
  margin-bottom: 12px;
}

/* ══════════════════════════════════════════════════════════════
   BLOCK 2 — STATS BANNER
   ══════════════════════════════════════════════════════════════ */
.lp-stats { background: #0f172a; padding: 64px 5%; }
.lp-stats__grid { max-width: var(--max-w); margin: 0 auto; display: grid; }
.lp-stats__item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 24px 20px; }
.lp-stats__item + .lp-stats__item { border-left: 1px solid rgba(255,255,255,0.1); }
.lp-stats__value { font-size: clamp(2.5rem,5vw,3.8rem); font-weight: 900; color: #f59e0b; line-height: 1; letter-spacing: -0.03em; display: block; margin-bottom: 10px; }
.lp-stats__label { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.9); display: block; margin-bottom: 4px; }
.lp-stats__note { font-size: 12px; color: rgba(255,255,255,0.45); display: block; }

/* ══════════════════════════════════════════════════════════════
   BLOCK 3 — FEATURES GRID
   ══════════════════════════════════════════════════════════════ */
.lp-features { background: var(--white); padding: 80px 5%; }
.lp-features__grid { display: grid; gap: 20px; }
.lp-features__card { padding: 32px 28px; border-radius: var(--radius-card); background: var(--white); border: 1px solid var(--border); box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 18px; transition: box-shadow 200ms, transform 200ms; }
.lp-features__card:hover { box-shadow: 0 4px 8px rgba(0,0,0,.06),0 16px 40px rgba(0,0,0,.09); transform: translateY(-2px); }
.lp-features__icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lp-features__card-title { font-size: 17px; font-weight: 700; color: var(--dark); margin-bottom: 6px; }
.lp-features__card-text { font-size: 14px; color: var(--muted); line-height: 1.6; }

/* ══════════════════════════════════════════════════════════════
   BLOCK 4 — GALLERY SHOWCASE
   ══════════════════════════════════════════════════════════════ */
.lp-gallery { background: #f9fafb; padding: 80px 5%; }
.lp-gallery__grid { display: grid; gap: 16px; }
.lp-gallery__item { border-radius: 14px; overflow: hidden; aspect-ratio: 4/3; background: #e5e7eb; position: relative; }
.lp-gallery__item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 300ms ease; }
.lp-gallery__item:hover img { transform: scale(1.04); }
.lp-gallery__caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 14px; background: linear-gradient(to top,rgba(0,0,0,0.6),transparent); color: var(--white); font-size: 12px; font-weight: 600; }

/* ══════════════════════════════════════════════════════════════
   BLOCK 5 — IMAGE + CONTENT
   ══════════════════════════════════════════════════════════════ */
.lp-image-content { padding: 80px 5%; background: var(--white); }
.lp-image-content__inner { max-width: var(--max-w); margin: 0 auto; display: flex; align-items: center; gap: 64px; }
.lp-image-content__image { flex: 1 1 45%; min-width: 0; border-radius: 20px; overflow: hidden; }
.lp-image-content__image img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lp-image-content__body { flex: 1 1 45%; min-width: 0; display: flex; flex-direction: column; gap: 20px; }
.lp-image-content__bullets { display: flex; flex-direction: column; gap: 10px; }
.lp-image-content__bullet { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: #374151; font-weight: 500; }
.lp-image-content__bullet-check { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; font-size: 11px; }

/* ══════════════════════════════════════════════════════════════
   BLOCK 6 — TESTIMONIALS
   ══════════════════════════════════════════════════════════════ */
.lp-testimonials { padding: 80px 5%; }
.lp-testimonials__grid { display: grid; gap: 20px; }
.lp-testimonial-card { padding: 28px; border-radius: var(--radius-card); background: var(--white); border: 1px solid var(--border); box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 16px; position: relative; }
.lp-testimonial-card__quote { position: absolute; top: 20px; right: 22px; font-size: 48px; line-height: 1; font-weight: 900; color: rgba(232,93,4,0.1); user-select: none; }
.lp-testimonial-card__stars { display: flex; gap: 3px; }
.lp-testimonial-card__text { font-size: 15px; color: #374151; line-height: 1.7; font-style: italic; flex: 1; }
.lp-testimonial-card__author { display: flex; align-items: center; gap: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
.lp-testimonial-card__avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--white); font-size: 15px; font-weight: 700; flex-shrink: 0; }
.lp-testimonial-card__name { font-size: 14px; font-weight: 700; color: var(--dark); }
.lp-testimonial-card__model { font-size: 12px; font-weight: 600; margin-top: 2px; }
.lp-testimonial-card__role { font-size: 12px; color: #9ca3af; margin-top: 1px; }

/* ══════════════════════════════════════════════════════════════
   BLOCK 7 — FAQ ACCORDION
   ══════════════════════════════════════════════════════════════ */
.lp-faq { background: var(--white); padding: 80px 5%; }
.lp-faq__list { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
.lp-faq__item { border: 1.5px solid #ebebeb; border-radius: 16px; overflow: hidden; background: var(--white); transition: border-color 150ms, background 150ms; }
.lp-faq__item[data-open] { border-color: var(--accent); background: rgba(232,93,4,0.04); }
.lp-faq__toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border: none; background: transparent; cursor: pointer; text-align: left; gap: 16px; font-family: var(--font); }
.lp-faq__question { font-size: 16px; font-weight: 600; color: var(--dark); flex: 1; line-height: 1.4; }
.lp-faq__icon { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; background: #f3f4f6; color: var(--muted); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 400; transition: background 150ms, color 150ms; }
.lp-faq__item[data-open] .lp-faq__icon { background: var(--accent); color: var(--white); }
.lp-faq__answer { display: none; padding: 0 24px 20px; }
.lp-faq__item[data-open] .lp-faq__answer { display: block; }
.lp-faq__answer p { font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0; }

/* ══════════════════════════════════════════════════════════════
   BLOCK 8 — CTA BANNER PREMIUM
   ══════════════════════════════════════════════════════════════ */
.lp-cta { padding: 88px 5%; text-align: center; }
.lp-cta__inner { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
.lp-cta__title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; color: var(--white); line-height: 1.15; letter-spacing: -0.025em; margin-bottom: 18px; }
.lp-cta__subtitle { font-size: 18px; color: rgba(255,255,255,0.85); line-height: 1.6; max-width: 520px; margin-bottom: 36px; }
.lp-cta__btn { display: inline-flex; align-items: center; justify-content: center; height: 58px; padding: 0 40px; border-radius: 14px; background: var(--white); font-size: 16px; font-weight: 800; text-decoration: none; letter-spacing: 0.01em; box-shadow: 0 4px 20px rgba(0,0,0,0.18); margin-bottom: 28px; transition: transform 120ms, box-shadow 120ms; border: none; }
.lp-cta__btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,0,0,0.22); }
.lp-cta__badges { display: flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 10px 24px; }
.lp-cta__badge { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); }
.lp-cta__badge-check { font-size: 12px; }

/* ══════════════════════════════════════════════════════════════
   BLOCK 9 — FOOTER PREMIUM
   ══════════════════════════════════════════════════════════════ */
.lp-footer { padding: 64px 5% 36px; }
.lp-footer__inner { max-width: var(--max-w); margin: 0 auto; }
.lp-footer__grid { display: grid; gap: 48px; margin-bottom: 56px; align-items: flex-start; }
.lp-footer__brand-name { font-size: 24px; font-weight: 900; letter-spacing: -0.02em; color: var(--white); margin-bottom: 12px; }
.lp-footer__tagline { font-size: 14px; color: #94a3b8; line-height: 1.7; max-width: 220px; }
.lp-footer__col-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 16px; display: block; }
.lp-footer__links { display: flex; flex-direction: column; gap: 10px; }
.lp-footer__link { font-size: 14px; color: #94a3b8; text-decoration: none; transition: color 120ms; }
.lp-footer__link:hover { color: var(--accent); }
.lp-footer__bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.lp-footer__copyright { font-size: 13px; color: #475569; }
.lp-footer__social { display: flex; gap: 20px; }
.lp-footer__social-link { font-size: 13px; color: #475569; text-decoration: none; transition: color 120ms; }
.lp-footer__social-link:hover { color: var(--accent); }

/* ══════════════════════════════════════════════════════════════
   RESPONSIVE — Tablet (768px)
   ══════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .lp-section, .lp-stats, .lp-features, .lp-gallery, .lp-image-content,
  .lp-testimonials, .lp-faq, .lp-cta, .lp-footer { padding-top: 56px; padding-bottom: 56px; }

  .lp-hero { grid-template-columns: 1fr !important; gap: 32px; min-height: auto; padding: 56px 5%; }
  .lp-hero__title { font-size: clamp(1.8rem,6vw,2.8rem); }

  .lp-stats__grid { grid-template-columns: repeat(2, 1fr) !important; }
  .lp-stats__item { padding: 16px; }
  .lp-stats__item + .lp-stats__item:nth-child(odd) { border-left: none; }
  .lp-stats__value { font-size: clamp(2rem,7vw,3rem); }

  .lp-features__grid { grid-template-columns: 1fr !important; }

  .lp-gallery__grid { grid-template-columns: repeat(2, 1fr) !important; }

  .lp-image-content__inner { flex-direction: column !important; gap: 36px; }
  .lp-image-content__image, .lp-image-content__body { flex: none; width: 100%; }

  .lp-testimonials__grid { grid-template-columns: 1fr !important; }

  .lp-footer__grid { grid-template-columns: 1fr 1fr !important; gap: 32px; }

  .lp-cta__title { font-size: clamp(1.8rem,6vw,2.4rem); }
}

/* ══════════════════════════════════════════════════════════════
   RESPONSIVE — Mobile (480px)
   ══════════════════════════════════════════════════════════════ */
@media (max-width: 480px) {
  .lp-section-header { margin-bottom: 36px; }
  .lp-gallery__grid { grid-template-columns: 1fr !important; }
  .lp-field--half { width: 100% !important; }
  .lp-footer__grid { grid-template-columns: 1fr !important; }
  .lp-stats__grid { grid-template-columns: 1fr 1fr !important; }
  .lp-form-card { padding: 20px; }
}
`;
}
