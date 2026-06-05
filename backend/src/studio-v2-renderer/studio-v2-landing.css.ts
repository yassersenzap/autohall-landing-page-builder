/** CSS de base pour preview/export Studio V2 — complété par les tokens inline. */
export const STUDIO_V2_LANDING_CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:var(--vs2-font);color:var(--vs2-text);background:var(--vs2-bg);line-height:1.5}
img{max-width:100%;display:block}
a{color:inherit}
.vs2-page{max-width:var(--vs2-page-max);margin:0 auto}
.vs2-section{width:100%}
.vs2-section--full{min-height:100vh;display:flex;align-items:center}
.vs2-section__inner{width:min(var(--vs2-page-max),100%);margin-inline:auto;padding-inline:clamp(1rem,3vw,2rem)}
.vs2-pad-compact{padding-block:1.5rem}
.vs2-pad-normal{padding-block:3rem}
.vs2-pad-large{padding-block:4.5rem}
.vs2-pad-hero{padding-block:6rem}
.vs2-tone-white{background:#fff;color:var(--vs2-text)}
.vs2-tone-light{background:#f8fafc;color:var(--vs2-text)}
.vs2-tone-dark{background:var(--vs2-secondary);color:#f8fafc}
.vs2-tone-brand{background:linear-gradient(165deg,var(--vs2-primary),var(--vs2-secondary));color:#f8fafc}
.vs2-tone-gradient{background:linear-gradient(135deg,var(--vs2-primary),var(--vs2-accent));color:#fff}
.vs2-container{width:100%;margin-inline:auto}
.vs2-max-narrow{max-width:48rem}
.vs2-max-standard,.vs2-max-default{max-width:72rem}
.vs2-max-wide{max-width:90rem}
.vs2-max-full{max-width:100%}
.vs2-align-left{text-align:left}
.vs2-align-center{text-align:center}
.vs2-columns{display:grid;gap:1.5rem;align-items:start}
@media(min-width:900px){
.vs2-columns.vs2-ratio-50_50{grid-template-columns:1fr 1fr}
.vs2-columns.vs2-ratio-40_60{grid-template-columns:.8fr 1.2fr}
.vs2-columns.vs2-ratio-60_40{grid-template-columns:1.2fr .8fr}
.vs2-columns.vs2-ratio-30_70{grid-template-columns:.6fr 1.4fr}
.vs2-columns.vs2-ratio-70_30{grid-template-columns:1.4fr .6fr}
.vs2-columns.vs2-valign-center{align-items:center}
.vs2-columns.vs2-valign-bottom{align-items:end}
}
.vs2-columns--right-first .vs2-columns__col:first-child{order:2}
.vs2-gap-small,.vs2-gap-compact{gap:.75rem}
.vs2-gap-normal{gap:1.5rem}
.vs2-gap-large{gap:2.5rem}
.vs2-hero{display:grid;gap:1.5rem;padding:1.5rem;border-radius:var(--vs2-card-radius)}
@media(min-width:768px){
.vs2-hero--split_right,.vs2-hero--split_left{grid-template-columns:1.1fr .9fr;align-items:center}
.vs2-hero--split_left .vs2-hero__media{order:-1}
}
.vs2-hero__title{margin:0 0 .75rem;font-size:clamp(1.75rem,3vw,2.5rem);color:var(--vs2-heading);font-weight:700}
.vs2-hero__eyebrow{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;opacity:.85}
.vs2-hero__subtitle{opacity:.9;margin:0 0 1rem}
.vs2-hero__cta{display:inline-flex;padding:.65rem 1.25rem;border-radius:var(--vs2-btn-radius);font-weight:600;text-decoration:none;margin-right:.5rem}
.vs2-hero__cta--primary{background:var(--vs2-accent);color:#fff}
.vs2-hero__cta--secondary{border:1px solid currentColor}
.vs2-hero__badge{display:inline-block;padding:.25rem .75rem;border-radius:999px;background:rgba(255,255,255,.15);font-size:.75rem;margin-bottom:.5rem}
.vs2-hero__media{min-height:12rem;border-radius:var(--vs2-card-radius);overflow:hidden;background:rgba(255,255,255,.08)}
.vs2-form__card{background:#fff;color:#0f172a;border-radius:var(--vs2-card-radius);padding:1.25rem;box-shadow:var(--vs2-shadow)}
.vs2-form__title{margin:0 0 .5rem;color:var(--vs2-heading)}
.vs2-form__fields,.lp-lead-form__grid{display:grid;gap:.75rem;grid-template-columns:repeat(2,minmax(0,1fr))}
.vs2-form__field--full,.lp-lead-form__field--full{grid-column:1/-1}
.lp-lead-form__input,.lp-lead-form__select,.lp-lead-form__textarea{width:100%;padding:.5rem;border:1px solid #cbd5e1;border-radius:.375rem}
.lp-btn{border:0;border-radius:var(--vs2-btn-radius);padding:.65rem 1rem;font-weight:600;cursor:pointer}
.lp-btn--primary{background:var(--vs2-primary);color:#fff}
.vs2-offer,.vs2-range,.vs2-benefits,.vs2-faq,.vs2-cta{padding-block:2rem}
.vs2-offer{display:grid;gap:1.5rem}
@media(min-width:768px){.vs2-offer--split{grid-template-columns:1fr 1fr;align-items:center}}
.vs2-range__grid{display:grid;gap:1rem}
.vs2-range--cols-2 .vs2-range__grid{grid-template-columns:repeat(2,1fr)}
.vs2-range--cols-3 .vs2-range__grid{grid-template-columns:repeat(3,1fr)}
.vs2-range--cols-4 .vs2-range__grid{grid-template-columns:repeat(4,1fr)}
@media(max-width:899px){.vs2-range--cols-3 .vs2-range__grid,.vs2-range--cols-4 .vs2-range__grid{grid-template-columns:1fr 1fr}}
.vs2-range-card{border:1px solid #e2e8f0;border-radius:var(--vs2-card-radius);padding:1rem;box-shadow:var(--vs2-shadow)}
.vs2-benefits__grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.vs2-benefit{padding:1rem;border-radius:var(--vs2-card-radius);background:#fff;box-shadow:var(--vs2-shadow)}
.vs2-faq__item{border-bottom:1px solid #e2e8f0;padding:.75rem 0}
.vs2-cta{text-align:center;padding:2.5rem 1.5rem;border-radius:var(--vs2-card-radius)}
.vs2-cta__button{display:inline-flex;background:var(--vs2-accent);color:#fff;padding:.75rem 1.5rem;border-radius:var(--vs2-btn-radius);text-decoration:none;font-weight:600}
.vs2-footer{padding:2rem 1rem;border-top:1px solid #e2e8f0;font-size:.85rem;color:#64748b}
.vs2-footer__links{display:flex;flex-wrap:wrap;gap:1rem;margin-top:.5rem}
.vs2-steps{padding-block:2rem}
.vs2-steps__list{list-style:none;margin:0;padding:0;display:grid;gap:1rem}
@media(min-width:768px){.vs2-steps__list{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}}
.vs2-steps__item{display:flex;gap:.75rem;padding:1rem;border-radius:var(--vs2-card-radius);background:#fff;box-shadow:var(--vs2-shadow)}
.vs2-steps__number{flex-shrink:0;width:1.75rem;height:1.75rem;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--vs2-primary);color:#fff;font-weight:700}
.vs2-steps__item-title{margin:0 0 .25rem;font-weight:650}
.vs2-steps__item-desc{margin:0;font-size:.85rem;color:#475569}
.vs2-spacer--sm{height:1rem}.vs2-spacer--md{height:2rem}.vs2-spacer--lg{height:3.5rem}.vs2-spacer--xl{height:5rem}
.vs2-media-image{margin:0;padding-block:.5rem}
.vs2-media-image__caption{margin-top:.5rem;font-size:.8125rem;color:#64748b;text-align:center}
.vs2-benefits--trust .vs2-benefits__grid{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}
.vs2-benefits--trust .vs2-benefit{text-align:center;background:#f8fafc;border:1px solid #e2e8f0;box-shadow:none}
.vs2-text-image{display:grid;gap:1.5rem;align-items:center}
@media(min-width:768px){.vs2-text-image--image_right,.vs2-text-image--image_left{grid-template-columns:1fr 1fr}.vs2-text-image--image_left .vs2-text-image__media{order:-1}}
.vs2-stats{padding:1.5rem;border-radius:var(--vs2-card-radius)}
.vs2-stats__grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));text-align:center}
.vs2-stats__value{display:block;font-size:1.75rem;font-weight:800}
.vs2-quote{padding:1.5rem;border-left:4px solid var(--vs2-accent)}
.vs2-card-block{padding:1.25rem;background:#fff;border-radius:var(--vs2-card-radius);box-shadow:var(--vs2-shadow)}
.vs2-btn-block__link{display:inline-flex;padding:.65rem 1.25rem;border-radius:var(--vs2-btn-radius);font-weight:600;text-decoration:none;background:var(--vs2-primary);color:#fff}
.vs2-badge-block__pill{display:inline-flex;padding:.25rem .75rem;border-radius:999px;font-size:.75rem;font-weight:700;background:var(--vs2-accent);color:#fff}
.vs2-testimonials__grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.vs2-testimonials__card{padding:1rem;border-radius:var(--vs2-card-radius);background:#fff;box-shadow:var(--vs2-shadow)}
.vs2-event-schedule__list{list-style:none;margin:0;padding:0;display:grid;gap:.75rem}
.vs2-event-schedule__item{display:grid;grid-template-columns:4rem 1fr;gap:.75rem;padding:1rem;border-radius:var(--vs2-card-radius);background:#f8fafc}
.vs2-financing{text-align:center;padding:2rem;border-radius:var(--vs2-card-radius);background:#f8fafc}
.vs2-financing__cta{display:inline-flex;margin-top:1rem;padding:.75rem 1.5rem;background:var(--vs2-accent);color:#fff;border-radius:var(--vs2-btn-radius);text-decoration:none;font-weight:600}
.vs2-stack{display:grid;gap:1rem}
.vs2-stack--gap-compact{gap:.5rem}.vs2-stack--gap-large{gap:1.75rem}
`;
