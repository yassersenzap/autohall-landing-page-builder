import type { CSSProperties } from 'react';
import { Fragment, useState } from 'react';
import { InlineTextRenderer } from '../inline/InlineTextRenderer';
import { useImageAssetDrop } from '../../hooks/use-image-asset-drop';
import { useHeroTextDrop } from '../../hooks/use-hero-text-drop';
import { HERO_TEXT_DRAG_MIME } from '../../lib/geometry/hero-overlay-text';
import { ASSET_DRAG_MIME } from '../../types/assets.types';
import { resolveImageObjectFit, isHeroFormBlock } from '../../lib/studio-compat.js';
import { isDarkColor } from '../../lib/color-utils';
import {
  Shield,
  Percent,
  Truck,
  Star,
  Clock,
  Award,
  CheckCircle,
  Zap,
  Heart,
  Gift,
  Lock,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type {
  BuilderNode,
  FormFieldConfig,
  FormNodeProps,
  FrameNodeProps,
  ImageNodeProps,
  TextNodeProps,
  FormStepConfig,
} from '../../types/nodes.types';
import { AUTOHALL_FORM_STEP_1 } from '../../constants/campaign-autohall';

import { HeroFormRenderer } from '../HeroFormRenderer';
import {
  clampPreviewStepIndex,
  getFieldsForStep,
  resolveFormSteps,
  stepNumberLabel,
  createFormStepId,
} from '../../lib/form-steps';
import { imageOverlayGradient } from '../resolve-node-style';
import { HeroImageShell } from './HeroImageShell';
import { HeroImageEmptyPrompt } from './HeroImageEmptyPrompt';
import { HeroImageMediaToolbar } from './HeroImageMediaToolbar';
import { MediaImage } from '../../media/MediaImage';
import { resolveMediaSrc, resolveUserMediaSrc } from '../../media/resolve-media-src';
import { isUserHeroMediaAssigned } from '../../media/hero-media-state';
import { useAssetsStore } from '../../store/assets.store';
import { useBuilderV4Store } from '../../store/document.store';

function textStyleFromNode(node: BuilderNode<'text'>): CSSProperties {
  const props = node.props as TextNodeProps;
  return {
    textAlign: props.align,
    color: node.style.color,
    fontSize: node.style.fontSize,
    fontWeight: node.style.fontWeight,
    lineHeight: node.style.lineHeight,
    letterSpacing: node.style.letterSpacing,
  };
}

export function TextNodeView({
  node,
  editorMode = false,
}: {
  node: BuilderNode<'text'>;
  editorMode?: boolean;
}) {
  const props = node.props as TextNodeProps;
  const Tag = props.tag ?? 'p';
  const text = props.text ?? props.content ?? '';

  return (
    <InlineTextRenderer
      nodeId={node.id}
      fieldKey="text"
      text={text}
      as={Tag}
      className="v4-text-node"
      style={textStyleFromNode(node)}
      editorMode={editorMode}
      testId={`inline-text-${node.name.toLowerCase()}`}
    />
  );
}

export function ImageNodeView({
  node,
  editorMode = false,
}: {
  node: BuilderNode<'image'>;
  editorMode?: boolean;
}) {
  const props = node.props as ImageNodeProps;
  const isHeroImage = node.name === 'HeroImage' || node.name === 'ImageLayer';
  const [dropActive, setDropActive] = useState(false);
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const { onDragOver, onDrop } = useImageAssetDrop(node.id, editorMode && isHeroImage);
  const heroTextDrop = useHeroTextDrop(node.id, editorMode && isHeroImage);
  const getAsset = useAssetsStore((s) => s.getAsset);
  const userMediaAssigned = isUserHeroMediaAssigned(props, getAsset);
  const userMediaSrc = resolveUserMediaSrc(props, getAsset);
  const { src: resolvedSrc } = resolveMediaSrc(props, getAsset);
  const behavior = props.imageBehavior ?? (isHeroImage ? 'campaign-poster' : undefined);
  const fit =
    node.style.objectFit
    ?? (behavior ? resolveImageObjectFit(behavior) : undefined)
    ?? props.fit
    ?? 'contain';
  const imgStyle: CSSProperties = {
    objectFit: fit,
    objectPosition: `${node.style.objectPositionX ?? 50}% ${node.style.objectPositionY ?? 50}%`,
    transform: node.style.scale && node.style.scale !== 100 ? `scale(${node.style.scale / 100})` : undefined,
    transformOrigin: `${node.style.objectPositionX ?? 50}% ${node.style.objectPositionY ?? 50}%`,
  };
  const filterParts: string[] = [];
  if (node.style.brightness !== undefined && node.style.brightness !== 100) {
    filterParts.push(`brightness(${node.style.brightness / 100})`);
  }
  if (node.style.saturation !== undefined && node.style.saturation !== 100) {
    filterParts.push(`saturate(${node.style.saturation / 100})`);
  }
  if (node.style.blur) filterParts.push(`blur(${node.style.blur}px)`);
  if (filterParts.length) imgStyle.filter = filterParts.join(' ');

  const overlayStyle: CSSProperties | undefined =
    props.overlayEnabled && userMediaAssigned
      ? {
        background: imageOverlayGradient(
          props.overlayColor ?? '#000000',
          props.overlayOpacity ?? 35,
          props.overlayDirection ?? 'to-bottom',
          props.overlayGradient ?? true,
        ),
        mixBlendMode: (props.overlayBlendMode ?? 'normal') as CSSProperties['mixBlendMode'],
      }
      : undefined;

  const isHeroMediaEmpty = isHeroImage && !userMediaAssigned;
  const showEmptyPrompt = isHeroMediaEmpty && editorMode && !previewMode;
  const heroMediaSrc = userMediaAssigned ? userMediaSrc : '';
  const showMedia = isHeroImage
    ? userMediaAssigned && Boolean(heroMediaSrc)
    : Boolean(resolvedSrc?.trim()) || previewMode;

  function handleDragOver(event: React.DragEvent) {
    onDragOver(event);
    heroTextDrop.onDragOver(event);
    if (
      event.dataTransfer.types.includes(ASSET_DRAG_MIME)
      || event.dataTransfer.types.includes('Files')
      || event.dataTransfer.types.includes(HERO_TEXT_DRAG_MIME)
    ) {
      setDropActive(true);
    }
  }

  function handleDrop(event: React.DragEvent) {
    heroTextDrop.onDrop(event);
    if (!event.defaultPrevented) {
      void onDrop(event);
    }
    setDropActive(false);
  }

  function resolveSrcFromStore() {
    const current = useBuilderV4Store.getState().getNode(node.id);
    if (!current || current.kind !== 'image') return isHeroImage ? heroMediaSrc : resolvedSrc;
    const currentProps = current.props as ImageNodeProps;
    return isHeroImage
      ? resolveUserMediaSrc(currentProps, getAsset)
      : resolveMediaSrc(currentProps, getAsset).src;
  }

  return (
    <HeroImageShell
      nodeId={node.id}
      editorMode={isHeroImage && editorMode}
      dropActive={dropActive}
      isEmpty={showEmptyPrompt}
      overlayStyle={overlayStyle}
      onDragOver={handleDragOver}
      onDragLeave={() => setDropActive(false)}
      onDrop={handleDrop}
    >
      {showEmptyPrompt ? (
        <HeroImageEmptyPrompt nodeId={node.id} dropActive={dropActive} />
      ) : showMedia ? (
        <>
          <MediaImage
            src={isHeroImage ? heroMediaSrc : resolvedSrc}
            alt={props.alt || 'Hero'}
            variant="hero"
            imgClassName="v4-image-node__img"
            imgStyle={imgStyle}
            resolveSrc={resolveSrcFromStore}
            errorLabel={previewMode ? '' : 'Image indisponible'}
            testId={`media-image-${node.name}`}
          />
          {isHeroImage && userMediaAssigned ? <HeroImageMediaToolbar nodeId={node.id} /> : null}
        </>
      ) : null}
    </HeroImageShell>
  );
}

export function ButtonNodeView({
  node,
  editorMode = false,
}: {
  node: BuilderNode<'button'>;
  editorMode?: boolean;
}) {
  const props = node.props;
  return (
    <InlineTextRenderer
      nodeId={node.id}
      fieldKey="button.label"
      text={props.label}
      as="span"
      className={['v4-button-node', `v4-button-node--${props.variant ?? 'primary'}`].join(' ')}
      editorMode={editorMode}
      testId="inline-text-button"
    />
  );
}

const FIELD_PLACEHOLDERS: Record<string, string> = {
  model: AUTOHALL_FORM_STEP_1.modelPlaceholder,
  city: 'Casablanca',
  date: 'jj/mm/aaaa',
  name: 'Entrez votre nom',
  phone: 'Entrez votre Téléphone',
};



/* ── Static field mockup for canvas builder ────────────────────── */

function FieldMockup({ field }: { field: FormFieldConfig }) {
  const type = field.type ?? 'text';
  const isConsent = type === 'checkbox' || field.id === 'consent';

  if (isConsent) {
    return (
      <label className="hfr-consent" style={{ pointerEvents: 'none' }}>
        <span className="hfr-consent__check-mock" />
        <span className="hfr-consent__text">
          {field.label}
          {field.required ? <span className="hfr-required">*</span> : null}
        </span>
      </label>
    );
  }

  const previewText = field.placeholder
    || (type === 'select' || type === 'radio' ? (field.options?.[0] ?? 'Sélectionner…') : '')
    || (type === 'date' ? 'jj/mm/aaaa' : '');

  const inputClass = [
    'hfr-field__input',
    'hfr-field__input--mock',
    type === 'select' || type === 'radio' ? 'hfr-field__select hfr-field__input--mock-select' : '',
    type === 'textarea' ? 'hfr-field__input--mock-textarea' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="hfr-field">
      <span className="hfr-field__label">
        {field.label}
        {field.required ? <span className="hfr-required">*</span> : null}
      </span>
      <div className={inputClass}>{previewText}</div>
    </div>
  );
}

/* ── WYSIWYG canvas form (editor mode, premium hfr-* styles) ───── */

function CampaignMultiStepFormView({
  node,
  props,
  editorMode,
}: {
  node: BuilderNode<'form'>;
  props: FormNodeProps;
  editorMode: boolean;
}) {
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const selectNode = useBuilderV4Store((s) => s.selectNode);
  const focusBusinessInspectorTab = useBuilderV4Store((s) => s.focusBusinessInspectorTab);
  const setSelectedFormFieldId = useBuilderV4Store((s) => s.setSelectedFormFieldId);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);
  const selectedFormFieldId = useBuilderV4Store((s) => s.selectedFormFieldId);

  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const isFormLayer = node.name === 'FormLayer';

  const steps = resolveFormSteps(props);
  const isSingleStep = steps.length <= 1;
  const editorStepIndex = clampPreviewStepIndex(props);
  const currentStep = steps[editorStepIndex];
  const isConfirmation = currentStep?.kind === 'confirmation';
  const visibleFields = currentStep && !isConfirmation
    ? getFieldsForStep(props.fields, currentStep)
    : [];
  const isLastStep = editorStepIndex >= steps.length - 1;
  const actionLabel =
    currentStep?.nextLabel
    ?? (isLastStep ? props.submitLabel || 'Envoyer' : props.submitLabel || 'Suivant');

  if (steps.length === 0 && isFormLayer) {
    return (
      <div className="v4-form-node v4-form-layer v4-form-layer--empty" data-v4-node={node.id}>
        <div className="hfr-card hfr-card--empty">
          <p className="v4-form-layer__placeholder-title">Formulaire</p>
          <p className="v4-form-layer__placeholder-hint">Ajoutez des étapes et des champs depuis l&apos;inspecteur.</p>
        </div>
      </div>
    );
  }

  function navigateTo(idx: number) {
    updateNodeProps(node.id, {
      previewStepIndex: Math.max(0, Math.min(idx, steps.length - 1)),
    } as Partial<FormNodeProps>);
  }

  function openFieldEditor(fieldId: string) {
    selectNode(node.id);
    setRightPanelOpen(true);
    focusBusinessInspectorTab('form');
    setSelectedFormFieldId(fieldId);
  }

  function toggleFieldRequired(fieldId: string) {
    const nextFields = props.fields.map((f) => {
      if (f.id === fieldId) {
        return { ...f, required: !f.required };
      }
      return f;
    });
    updateNodeProps(node.id, { fields: nextFields } as Partial<FormNodeProps>);
  }

  function deleteField(fieldId: string) {
    const nextFields = props.fields.filter((f) => f.id !== fieldId);
    const nextSteps = steps.map((step) => ({
      ...step,
      fieldIds: step.fieldIds.filter((id) => id !== fieldId),
    }));
    updateNodeProps(node.id, {
      fields: nextFields,
      steps: nextSteps,
    } as Partial<FormNodeProps>);
  }

  function addStepOnCanvas() {
    const next: FormStepConfig = {
      id: createFormStepId(),
      title: `Étape ${steps.length + 1}`,
      description: '',
      fieldIds: [],
    };
    const nextSteps = [...steps, next];
    updateNodeProps(node.id, {
      steps: nextSteps,
      stepCount: nextSteps.length,
      previewStepIndex: nextSteps.length - 1,
    } as Partial<FormNodeProps>);
  }

  function deleteStepOnCanvas(index: number) {
    if (steps.length <= 1) {
      alert('Au moins une étape est requise');
      return;
    }
    const nextSteps = steps.filter((_, i) => i !== index);
    updateNodeProps(node.id, {
      steps: nextSteps,
      stepCount: nextSteps.length,
      previewStepIndex: Math.max(0, index - 1),
    } as Partial<FormNodeProps>);
  }

  function moveStepOnCanvas(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const nextSteps = [...steps];
    const temp = nextSteps[index];
    nextSteps[index] = nextSteps[targetIndex];
    nextSteps[targetIndex] = temp;
    updateNodeProps(node.id, {
      steps: nextSteps,
      previewStepIndex: targetIndex,
    } as Partial<FormNodeProps>);
  }

  const isDark = isDarkColor(props.cardBackground);

  return (
    <div
      className={['v4-form-node', isFormLayer ? 'v4-form-layer' : ''].filter(Boolean).join(' ')}
      data-v4-node={node.id}
    >
      <div
        className={isDark ? 'hfr-card hfr-card--dark' : 'hfr-card'}
        style={{
          borderRadius: props.cardRadius ?? 24,
          background: props.cardBackground ?? '#ffffff',
          color: props.textColor ?? '#111827',
          ['--hfr-accent' as string]: props.accentColor ?? '#e85d04',
        }}
      >
        {/* ── Dot stepper (full-bleed at card top) ── */}
        {!isSingleStep && props.showProgress !== false ? (
          <div className="hfr-stepper-wrap" aria-label={`Étape ${editorStepIndex + 1} sur ${steps.length}`}>
            {steps.map((s, i) => (
              <Fragment key={s.id}>
                {i > 0 && (
                  <div
                    className={['hfr-stepper__line', i <= editorStepIndex ? 'hfr-stepper__line--done' : ''].filter(Boolean).join(' ')}
                  />
                )}
                <button
                  type="button"
                  className={[
                    'hfr-stepper__dot',
                    i === editorStepIndex ? 'hfr-stepper__dot--active' : '',
                    i < editorStepIndex ? 'hfr-stepper__dot--done' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => navigateTo(i)}
                  title={`Étape ${i + 1}${s.title ? ` — ${s.title}` : ''}`}
                  aria-label={`Aller à l'étape ${i + 1}`}
                  aria-current={i === editorStepIndex ? 'step' : undefined}
                />
              </Fragment>
            ))}
          </div>
        ) : null}

        {/* ── Card content (padded) ── */}
        <div className="hfr-card__body" style={{ padding: 0 }}>
          {isConfirmation ? (
            <div className="hfr-confirmation">
              <div className="hfr-confirmation__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="hfr-confirmation__title">
                {props.successMessage || 'Merci ! Notre équipe vous contactera dans les 24h.'}
              </h2>
              <p className="hfr-confirmation__msg">Notre équipe vous contactera.</p>
            </div>
          ) : (
            <>
              {editorMode && !previewMode ? (
                <div className="hfr-canvas-step-toolbar">
                  <span className="hfr-canvas-step-toolbar__label">
                    {stepNumberLabel(editorStepIndex, steps.length)}
                  </span>
                  <div className="hfr-canvas-step-toolbar__actions">
                    <button
                      type="button"
                      className="hfr-canvas-step-toolbar__btn"
                      onClick={() => moveStepOnCanvas(editorStepIndex, -1)}
                      disabled={editorStepIndex === 0}
                      title="Reculer"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="hfr-canvas-step-toolbar__btn"
                      onClick={() => moveStepOnCanvas(editorStepIndex, 1)}
                      disabled={editorStepIndex === steps.length - 1}
                      title="Avancer"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      className="hfr-canvas-step-toolbar__btn"
                      onClick={addStepOnCanvas}
                      title="Ajouter une étape"
                    >
                      + Étape
                    </button>
                    <button
                      type="button"
                      className="hfr-canvas-step-toolbar__btn hfr-canvas-step-toolbar__btn--danger"
                      onClick={() => deleteStepOnCanvas(editorStepIndex)}
                      disabled={steps.length <= 1}
                      title="Supprimer cette étape"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : !isSingleStep ? (
                <p className="hfr-step-label">{stepNumberLabel(editorStepIndex, steps.length)}</p>
              ) : null}

              {/* Inline-editable step title — double-click to edit */}
              <InlineTextRenderer
                nodeId={node.id}
                fieldKey="form.stepTitle"
                text={currentStep?.title ?? props.title}
                as="h2"
                className="hfr-step-title"
                editorMode={editorMode && !previewMode}
                testId="form-canvas-step-title"
              />

              {/* Inline-editable step description */}
              <InlineTextRenderer
                nodeId={node.id}
                fieldKey="form.stepDescription"
                text={currentStep?.description ?? ''}
                as="p"
                className="hfr-step-desc"
                editorMode={editorMode && !previewMode}
                options={{ multiline: true, placeholder: 'Description de l\'étape…' }}
                testId="form-canvas-step-desc"
              />

              {/* ── Fields ── */}
              <div className="hfr-fields">
                {visibleFields.length === 0 ? (
                  <div className="hfr-fields-placeholder">
                    Ajoutez des champs depuis l&apos;inspecteur Formulaire.
                  </div>
                ) : (
                  visibleFields.map((field: FormFieldConfig) => (
                    <div
                      key={field.id}
                      className={[
                        'hfr-field-wrap',
                        field.width === '50%' ? 'hfr-field-wrap--half' : '',
                        editorMode && !previewMode && selectedFormFieldId === field.id ? 'hfr-field-wrap--selected' : '',
                      ].filter(Boolean).join(' ')}
                      onPointerEnter={() => editorMode && !previewMode && setHoveredFieldId(field.id)}
                      onPointerLeave={() => setHoveredFieldId(null)}
                      data-form-field-id={field.id}
                    >
                      <FieldMockup field={field} />

                      {/* Builder hover overlay — ✏ Modifier / 🗑 Retirer */}
                      {editorMode && !previewMode ? (
                        <div
                          className="hfr-field-overlay"
                          style={{ opacity: hoveredFieldId === field.id || selectedFormFieldId === field.id ? 1 : 0 }}
                        >
                          <button
                            type="button"
                            className="hfr-field-overlay__btn"
                            title="Modifier ce champ"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openFieldEditor(field.id);
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Modifier
                          </button>
                          <div className="hfr-field-overlay__sep" />
                          <button
                            type="button"
                            className={["hfr-field-overlay__btn", field.required ? "hfr-field-overlay__btn--active" : ""].filter(Boolean).join(" ")}
                            title="Rendre ce champ obligatoire"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFieldRequired(field.id);
                            }}
                          >
                            {field.required ? '★ Requis' : '☆ Facultatif'}
                          </button>
                          <div className="hfr-field-overlay__sep" />
                          <button
                            type="button"
                            className="hfr-field-overlay__btn hfr-field-overlay__btn--danger"
                            title="Supprimer ce champ"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteField(field.id);
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              {/* ── Actions ── */}
              <div className="hfr-actions">
                {editorStepIndex > 0 ? (
                  <button
                    type="button"
                    className="hfr-btn hfr-btn--back"
                    onClick={() => navigateTo(editorStepIndex - 1)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {currentStep?.backLabel ?? props.backLabel ?? 'Retour'}
                  </button>
                ) : <span />}

                <button
                  type="button"
                  className="hfr-btn hfr-btn--next"
                  onClick={() => navigateTo(editorStepIndex + 1)}
                >
                  <InlineTextRenderer
                    nodeId={node.id}
                    fieldKey="form.submitLabel"
                    text={actionLabel}
                    as="span"
                    editorMode={editorMode && !previewMode}
                    testId="form-canvas-submit-label"
                  />
                  {!isLastStep ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  ) : null}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AutohallCampaignFormView({
  node,
  props,
  editorMode,
}: {
  node: BuilderNode<'form'>;
  props: FormNodeProps;
  editorMode: boolean;
}) {
  const activeIds = new Set(props.activeStepFieldIds ?? ['model']);
  const visibleFields = props.fields.filter(
    (f: FormFieldConfig) => f.enabled && f.id !== 'consent' && activeIds.has(f.id),
  );

  const cardStyle: CSSProperties = {
    borderRadius: props.cardRadius ?? 24,
    background: props.cardBackground ?? '#ffffff',
    padding: props.cardSpacing ?? 32,
    color: props.textColor ?? '#18181b',
    boxShadow: props.cardShadow === false ? 'none' : undefined,
    ['--ah-form-accent' as string]: props.accentColor ?? '#e85d04',
  };

  return (
    <div className="v4-autohall-form" data-v4-node={node.id} style={cardStyle}>
      <div className="v4-autohall-form__progress" aria-hidden>
        <span
          className="v4-autohall-form__progress-fill"
          style={{ width: `${props.progressPercent ?? 25}%` }}
        />
      </div>
      <InlineTextRenderer
        nodeId={node.id}
        fieldKey="form.currentStepLabel"
        text={props.currentStepLabel}
        as="p"
        className="v4-autohall-form__step-number"
        editorMode={editorMode}
        testId="inline-text-step-number"
      />
      <InlineTextRenderer
        nodeId={node.id}
        fieldKey="form.stepTitle"
        text={props.stepTitle ?? props.title}
        as="h2"
        className="v4-autohall-form__step-title"
        editorMode={editorMode}
        testId="inline-text-step-title"
      />
      <InlineTextRenderer
        nodeId={node.id}
        fieldKey="form.stepDescription"
        text={props.stepDescription ?? props.subtitle}
        as="p"
        className="v4-autohall-form__step-description"
        editorMode={editorMode}
        options={{ multiline: true }}
        testId="inline-text-step-description"
      />
      {visibleFields.map((field) => (
        <label key={field.id} className="v4-autohall-form__field">
          <span className="v4-autohall-form__label">{field.label}</span>
          <span className="v4-autohall-form__select">{FIELD_PLACEHOLDERS[field.id] ?? ''}</span>
        </label>
      ))}
      <button type="button" className="v4-autohall-form__submit">
        <InlineTextRenderer
          nodeId={node.id}
          fieldKey="form.submitLabel"
          text={props.submitLabel}
          as="span"
          editorMode={editorMode}
          testId="inline-text-submit"
        />
        <span className="v4-autohall-form__submit-arrow" aria-hidden>
          →
        </span>
      </button>
    </div>
  );
}

const BENEFIT_ICON_MAP: Record<string, LucideIcon> = {
  Shield, Percent, Truck, Star, Clock, Award, CheckCircle, Zap, Heart, Gift, Lock, Wrench,
};

/**
 * Renders the marketing add-ons (price, benefits, secondary CTA, trust badges)
 * stored on the root frame's props (`HeroContentInspector`). These props had no
 * corresponding node in the tree, so toggling them in the sidebar had no visual
 * effect — this closes that gap for both the editor canvas and preview.
 */
export function HeroMarketingExtras({ rootId }: { rootId: string }) {
  const rootNode = useBuilderV4Store((s) => s.document.nodes[rootId]);
  if (!rootNode) return null;
  const props = rootNode.props as FrameNodeProps;

  const benefits = (props.heroBenefits ?? []).filter((b) => b.enabled !== false);
  const trustBadges = (props.heroTrustBadges ?? []).filter((b) => b.enabled !== false);

  const showPrice = Boolean(props.heroShowPrice && props.heroPrice);
  const showBenefits = (props.heroShowBenefits ?? true) && benefits.length > 0;
  const showSecondaryCta = Boolean(props.heroShowSecondaryCta && props.heroSecondaryCtaLabel);
  const showTrust = Boolean(props.heroShowTrustBadges && trustBadges.length > 0);

  if (!showPrice && !showBenefits && !showSecondaryCta && !showTrust) return null;

  return (
    <div className="v4-hero-extras" data-testid="hero-marketing-extras">
      {showPrice ? (
        <div className="v4-hero-price">
          {props.heroPriceLabel ? <span className="v4-hero-price__label">{props.heroPriceLabel}</span> : null}
          <span className="v4-hero-price__value">{props.heroPrice}</span>
        </div>
      ) : null}

      {showBenefits ? (
        <ul className="v4-hero-benefits">
          {benefits.map((b) => {
            const Icon = BENEFIT_ICON_MAP[b.icon ?? ''] ?? CheckCircle;
            return (
              <li key={b.id} className="v4-hero-benefits__item">
                <span className="v4-hero-benefits__icon" style={{ color: b.color ?? '#22c55e' }}>
                  <Icon size={16} strokeWidth={2.25} />
                </span>
                <span className="v4-hero-benefits__text">
                  <span className="v4-hero-benefits__title">{b.title}</span>
                  {b.description ? <span className="v4-hero-benefits__desc">{b.description}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {showSecondaryCta ? (
        <a
          className="v4-hero-secondary-cta"
          href={props.heroSecondaryCtaUrl || '#'}
          onClick={(e) => { if (!props.heroSecondaryCtaUrl) e.preventDefault(); }}
        >
          {props.heroSecondaryCtaLabel}
        </a>
      ) : null}

      {showTrust ? (
        <div className="v4-hero-trust">
          {trustBadges.map((b) => (
            <span key={b.id} className="v4-hero-trust__badge">{b.text}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DefaultFormView({
  node,
  props,
  editorMode,
}: {
  node: BuilderNode<'form'>;
  props: FormNodeProps;
  editorMode: boolean;
}) {
  const steps = Array.from({ length: props.stepCount }, (_, i) => i + 1);
  const fields = props.fields.filter((f: FormFieldConfig) => f.enabled && f.id !== 'consent');

  return (
    <div className="v4-form-node" data-v4-node={node.id}>
      <div
        className={['v4-form-node__card', props.cardShadow ? 'v4-form-node__card--shadow' : ''].filter(Boolean).join(' ')}
        style={{
          borderRadius: props.cardRadius ?? 12,
          backgroundColor: props.cardBackground ?? '#ffffff',
        }}
      >
        <div className="v4-form-node__head">
          <InlineTextRenderer
            nodeId={node.id}
            fieldKey="form.currentStepLabel"
            text={props.currentStepLabel}
            as="span"
            className="v4-form-node__step"
            editorMode={editorMode}
          />
          <div className="v4-form-node__progress" aria-hidden>
            {steps.map((step) => (
              <span
                key={step}
                className={['v4-form-node__dot', step === 1 ? 'v4-form-node__dot--active' : ''].join(' ')}
              />
            ))}
          </div>
        </div>
        <InlineTextRenderer
          nodeId={node.id}
          fieldKey="form.stepTitle"
          text={props.title}
          as="h2"
          className="v4-form-node__title"
          editorMode={editorMode}
        />
        <InlineTextRenderer
          nodeId={node.id}
          fieldKey="form.stepDescription"
          text={props.subtitle}
          as="p"
          className="v4-form-node__subtitle"
          editorMode={editorMode}
          options={{ multiline: true }}
        />
        <div className="v4-form-node__fields">
          {fields.map((field: FormFieldConfig) => (
            <label key={field.id} className="v4-form-node__field">
              <span className="v4-form-node__field-label">
                {field.label}
                {field.required ? <span className="v4-form-node__required">*</span> : null}
              </span>
              <span className="v4-form-node__field-input">{FIELD_PLACEHOLDERS[field.id] ?? ''}</span>
            </label>
          ))}
        </div>
        {props.showConsent ? (
          <label className="v4-form-node__consent">
            <span className="v4-form-node__consent-box" aria-hidden />
            <span>{props.consentLabel}</span>
          </label>
        ) : null}
        <div className="v4-form-node__actions">
          <InlineTextRenderer
            nodeId={node.id}
            fieldKey="form.submitLabel"
            text={props.submitLabel}
            as="span"
            className="v4-form-node__submit"
            editorMode={editorMode}
          />
        </div>
      </div>
    </div>
  );
}

export function FormNodeView({
  node,
  editorMode = false,
}: {
  node: BuilderNode<'form'>;
  editorMode?: boolean;
}) {
  const props = node.props as FormNodeProps;
  const previewMode = useBuilderV4Store((s) => s.previewMode);

  // In live preview mode, use the pro form renderer (validation + animations + real submission)
  if (previewMode || !editorMode) {
    if (props.variant === 'campaign' || props.variant === 'dynamic' || props.variant === 'autohall-campaign') {
      return <HeroFormRenderer node={node} props={props} />;
    }
  }

  if (props.variant === 'campaign' || props.variant === 'dynamic') {
    return <CampaignMultiStepFormView node={node} props={props} editorMode={editorMode} />;
  }
  if (props.variant === 'autohall-campaign') {
    return <AutohallCampaignFormView node={node} props={props} editorMode={editorMode} />;
  }
  return <DefaultFormView node={node} props={props} editorMode={editorMode} />;
}

export function CardNodeView({ node, children }: { node: BuilderNode<'card'>; children: React.ReactNode }) {
  return (
    <div className="v4-card-node" data-v4-node={node.id}>
      {children}
    </div>
  );
}

export function ContainerNodeView({
  node,
  children,
}: {
  node: BuilderNode;
  children: React.ReactNode;
}) {
  const stackProps = node.kind === 'stack' ? (node.props as import('../../types/nodes.types').StackNodeProps) : null;
  const isContentLayer = node.name === 'ContentLayer' || node.name === 'HeroSafeArea';
  const showBackdrop =
    stackProps?.smartBackdrop &&
    (node.name === 'HeroContentGroup' || node.name === 'HeroContent' || isContentLayer);
  const backdropOpacity = stackProps?.backdropOpacity ?? 55;
  const passThroughGrid = isHeroFormBlock(node);

  return (
    <div
      className={`v4-container-node v4-container-node--${node.kind}`}
      data-v4-node={node.id}
      data-v4-kind={node.kind}
      style={passThroughGrid ? { display: 'contents' } : undefined}
    >
      {showBackdrop ? (
        <div
          className="v4-hero-content-backdrop"
          aria-hidden
          style={{
            background: `linear-gradient(105deg, rgba(0,0,0,${backdropOpacity / 100}) 0%, rgba(0,0,0,${Math.max(0, backdropOpacity / 100 - 0.25)}) 55%, transparent 100%)`,
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
