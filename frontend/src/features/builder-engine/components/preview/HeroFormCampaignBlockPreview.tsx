import { resolveLeadFormFieldsFromProps } from '../../constants/autohall-lead-form';
import { asPropString } from '../../lib/block-props';
import { buildButtonClasses, buildMediaImgClasses, getDesignFromProps } from '../../lib/block-style';
import { HeroBlockImage } from '../media/HeroBlockImage';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type HeroFormCampaignBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function formProps(propsJson: Record<string, unknown>): Record<string, unknown> {
  const form = propsJson.form;
  if (form && typeof form === 'object' && !Array.isArray(form)) {
    return form as Record<string, unknown>;
  }
  return propsJson;
}

export function HeroFormCampaignBlockPreview({ propsJson }: HeroFormCampaignBlockPreviewProps) {
  const layoutVariant = asPropString(propsJson.layoutVariant) || 'text_left_form_right';
  const design = (propsJson.design as Record<string, unknown> | undefined) ?? {};
  const tone = asPropString(design.tone) || 'light';
  const imagePosition = asPropString(design.imagePosition) || 'none';
  const heroDesign = getDesignFromProps('hero', propsJson);
  const imgClass = buildMediaImgClasses('lp-hero', heroDesign);
  const primaryBtnClass = buildButtonClasses(heroDesign);

  const fp = formProps(propsJson);
  const fields = resolveLeadFormFieldsFromProps(fp);
  const submitText = asPropString(fp.submitText) || 'Envoyer votre demande';
  const consentLabel = asPropString(fp.consentLabel);
  const formConfig = fp.formConfig as Record<string, unknown> | undefined;
  const showConsent = formConfig?.showConsent !== false;

  const hasImage = Boolean(asPropString(propsJson.imageAssetId) || asPropString(propsJson.imageUrl));

  const content = (
    <div className="lp-hero-form-campaign__content">
      {asPropString(propsJson.eyebrow) ? (
        <p className="lp-hero-form-campaign__eyebrow">{asPropString(propsJson.eyebrow)}</p>
      ) : null}
      {asPropString(propsJson.title) ? (
        <h1 className="lp-hero-form-campaign__title">{asPropString(propsJson.title)}</h1>
      ) : (
        <CanvasEmptyHint className="lp-hero-form-campaign__title opacity-60">Titre à renseigner</CanvasEmptyHint>
      )}
      {asPropString(propsJson.subtitle) ? (
        <p className="lp-hero-form-campaign__subtitle">{asPropString(propsJson.subtitle)}</p>
      ) : null}
      {asPropString(propsJson.buttonText) ? (
        <div className="lp-hero-form-campaign__actions">
          <span className={primaryBtnClass}>{asPropString(propsJson.buttonText)}</span>
        </div>
      ) : null}
    </div>
  );

  const media =
    imagePosition !== 'none' ? (
      hasImage ? (
        <div className="lp-hero-form-campaign__media">
          <HeroBlockImage
            imageAssetId={asPropString(propsJson.imageAssetId)}
            imageUrl={asPropString(propsJson.imageUrl)}
            alt={asPropString(propsJson.alt)}
            className={imgClass}
          />
        </div>
      ) : (
        <div className="lp-hero-form-campaign__media lp-hero-form-campaign__media--placeholder" aria-hidden>
          <CanvasEmptyHint>Visuel campagne</CanvasEmptyHint>
        </div>
      )
    ) : null;

  const formBlock = (
    <div className="lp-hero-form-campaign__form" id="lead-form">
      <div className="lp-hero-form-campaign__form-card">
        {asPropString(fp.title) ? (
          <h2 className="lp-hero-form-campaign__form-title">{asPropString(fp.title)}</h2>
        ) : null}
        <form className="lp-lead-form__form">
          <div className="lp-lead-form__grid">
            {fields.map((field) => (
              <label key={field.name} className="lp-lead-form__field">
                <span className="lp-lead-form__label">{field.label}</span>
                <input className="lp-lead-form__input" disabled readOnly />
              </label>
            ))}
          </div>
          {showConsent && consentLabel ? (
            <label className="lp-lead-form__consent">
              <input type="checkbox" disabled />
              <span>{consentLabel}</span>
            </label>
          ) : null}
          <button type="button" className="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit" disabled>
            {submitText}
          </button>
        </form>
      </div>
    </div>
  );

  const formFirst = layoutVariant === 'form_left_text_right';
  const inner =
    layoutVariant === 'image_left_form_right' ? (
      <>
        {media}
        {content}
        {formBlock}
      </>
    ) : formFirst ? (
      <>
        {formBlock}
        {content}
        {media}
      </>
    ) : (
      <>
        {content}
        {media}
        {formBlock}
      </>
    );

  return (
    <section
      className={`lp-block lp-hero-form-campaign lp-hero-form-campaign--${layoutVariant} lp-hero-form-campaign--tone-${tone}`}
    >
      <div className="lp-section lp-hero-form-campaign__inner">{inner}</div>
    </section>
  );
}
