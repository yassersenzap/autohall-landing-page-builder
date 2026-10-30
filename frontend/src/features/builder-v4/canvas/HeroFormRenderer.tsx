/**
 * HeroFormRenderer — pro form component for preview mode.
 * Used when previewMode=true or in standalone preview page.
 * Handles single-step and multi-step with framer-motion transitions,
 * react-hook-form validation, and real lead submission.
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormNodeProps, FormFieldConfig, FormStepConfig } from '../types/nodes.types';
import { MOROCCO_CITIES, isCityField } from '../constants/morocco-cities';
import { resolveFormSteps, getFieldsForStep, stepNumberLabel, stepProgressPercent } from '../lib/form-steps';
import { useBuilderV4Store } from '../store/document.store';
import { apiRequest } from '@/lib/api';
import { isDarkColor } from '../lib/color-utils';

// ── Semantic field resolution ───────────────────────────────────────────────

/**
 * Scans fields array for the first match, returns values[field.id].
 * Decouples submission payload building from hardcoded field IDs so all
 * inspector presets (f_name, f_phone, etc.) work correctly.
 */
function resolveFieldValue(
  values: Record<string, string>,
  fields: FormFieldConfig[],
  matcher: (f: FormFieldConfig) => boolean,
): string {
  const field = fields.find(matcher);
  return field ? (values[field.id] ?? '') : '';
}

function buildApiPayload(values: Record<string, string>, fields: FormFieldConfig[]) {
  const fullName =
    resolveFieldValue(values, fields, f => ['fullName', 'name', 'f_name', 'nom_complet'].includes(f.id)) ||
    resolveFieldValue(
      values, fields,
      f => (f.type ?? 'text') === 'text' && Boolean(f.label?.toLowerCase().includes('nom')),
    ) ||
    (
      `${resolveFieldValue(values, fields, f => ['firstname', 'prenom', 'firstName'].includes(f.id))} ` +
      `${resolveFieldValue(values, fields, f => ['lastname', 'nom', 'lastName'].includes(f.id))}`
    ).trim();

  const phone =
    resolveFieldValue(values, fields, f => f.type === 'phone') ||
    resolveFieldValue(values, fields, f => ['phone', 'tel', 'f_phone', 'telephone'].includes(f.id));

  const email =
    resolveFieldValue(values, fields, f => f.type === 'email') ||
    resolveFieldValue(values, fields, f => ['email', 'f_email', 'mail'].includes(f.id));

  const vehicleModel =
    resolveFieldValue(values, fields, f => ['model', 'vehicleModel', 'f_model'].includes(f.id)) ||
    resolveFieldValue(values, fields, f => Boolean(f.label?.toLowerCase().includes('modèle')));

  const city =
    resolveFieldValue(values, fields, f => ['city', 'ville', 'f_city'].includes(f.id)) ||
    resolveFieldValue(
      values, fields,
      f => Boolean(f.label?.toLowerCase().includes('ville') || f.label?.toLowerCase().includes('concession')),
    );

  const message =
    resolveFieldValue(values, fields, f => f.type === 'textarea') ||
    resolveFieldValue(values, fields, f => ['message', 'f_message', 'msg'].includes(f.id));

  const preferredDate =
    resolveFieldValue(values, fields, f => ['preferredDate', 'f_date', 'testDate', 'date'].includes(f.id)) ||
    resolveFieldValue(values, fields, f => f.type === 'date');

  return { fullName, phone, email, vehicleModel, city, message, preferredDate };
}

// ── Zod schema builder ──────────────────────────────────────────────────────

function buildFieldSchema(field: FormFieldConfig) {
  const type = field.type ?? 'text';
  const label = field.label || 'Ce champ';

  if (type === 'email' || field.id === 'email') {
    const base = z.string().email({ message: `${label} : adresse email invalide` });
    return field.required ? base.min(1, `${label} est obligatoire`) : base.optional();
  }

  if (type === 'phone' || field.id === 'phone' || field.id === 'tel') {
    // Accepts: 0612345678 | +212612345678 | 06 12 34 56 78 | 06-12-34-56-78
    const base = z.string().refine(
      (v) => {
        const digits = v.replace(/[\s\-]/g, '');
        return /^(0[5-9]\d{8}|\+?212[5-9]\d{8})$/.test(digits);
      },
      { message: `${label} : format invalide (ex: 0612345678 ou +212612345678)` }
    );
    return field.required ? base.min(1, `${label} est obligatoire`) : base.optional();
  }

  if (type === 'checkbox' || field.id === 'consent') {
    return field.required
      ? z.literal(true, { error: 'Vous devez accepter pour continuer' })
      : z.boolean().optional();
  }

  if (type === 'date') {
    return field.required ? z.string().min(1, `${label} est obligatoire`) : z.string().optional();
  }

  return field.required ? z.string().min(1, `${label} est obligatoire`) : z.string().optional();
}

function buildZodSchema(fields: FormFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    shape[f.id] = buildFieldSchema(f);
  }
  return z.object(shape);
}

// ── City combobox ───────────────────────────────────────────────────────────

function CityCombobox({ value, onChange, placeholder, id }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = MOROCCO_CITIES.filter(c =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="hfr-city-combo" role="combobox" aria-expanded={open}>
      <div className="hfr-city-combo__input-wrap">
        <Search size={14} className="hfr-city-combo__icon" aria-hidden />
        <input
          id={id}
          type="text"
          className="hfr-field__input hfr-city-combo__input"
          value={value || query}
          placeholder={placeholder || 'Rechercher une ville…'}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={e => { setQuery(e.target.value); onChange(''); }}
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="hfr-city-combo__list" role="listbox">
          {filtered.map(city => (
            <li
              key={city}
              className={`hfr-city-combo__option${value === city ? ' hfr-city-combo__option--selected' : ''}`}
              role="option"
              aria-selected={value === city}
              onMouseDown={() => { onChange(city); setQuery(''); setOpen(false); }}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Individual field renderer ───────────────────────────────────────────────

function FieldControl({ field, register, setValue, watch, errors }: {
  field: FormFieldConfig;
  register: ReturnType<typeof useForm>['register'];
  setValue: ReturnType<typeof useForm>['setValue'];
  watch: ReturnType<typeof useForm>['watch'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
}) {
  const type = field.type ?? 'text';
  const isCity = isCityField(field.id, field.label);
  const isModel = field.id === 'model' || field.id === 'vehicleModel' || field.label?.toLowerCase().includes('modèle');
  const isConsent = type === 'checkbox' || field.id === 'consent';
  const currentValue = String(watch(field.id) ?? '');
  const error = errors[field.id];

  const fieldId = `hfr-${field.id}`;

  if (isConsent) {
    return (
      <label className="hfr-consent" htmlFor={fieldId}>
        <input id={fieldId} type="checkbox" className="hfr-consent__check" {...register(field.id)} />
        <span className="hfr-consent__text">{field.label}{field.required ? <span className="hfr-required">*</span> : null}</span>
        {error ? <span className="hfr-error">{String(error.message ?? '')}</span> : null}
      </label>
    );
  }

  if (isCity) {
    return (
      <div className="hfr-field">
        <label className="hfr-field__label" htmlFor={fieldId}>
          {field.label}{field.required ? <span className="hfr-required">*</span> : null}
        </label>
        <CityCombobox
          id={fieldId}
          value={currentValue}
          onChange={v => setValue(field.id, v, { shouldValidate: true })}
          placeholder={field.placeholder}
        />
        {error ? <span className="hfr-error">{String(error.message ?? '')}</span> : null}
      </div>
    );
  }

  if (type === 'select' || isModel) {
    const options = field.options ?? [];
    return (
      <div className="hfr-field">
        <label className="hfr-field__label" htmlFor={fieldId}>
          {field.label}{field.required ? <span className="hfr-required">*</span> : null}
        </label>
        <select id={fieldId} className="hfr-field__input hfr-field__select" {...register(field.id)}>
          <option value="">{field.placeholder || 'Sélectionner…'}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {error ? <span className="hfr-error">{String(error.message ?? '')}</span> : null}
      </div>
    );
  }

  if (type === 'date') {
    return (
      <div className="hfr-field">
        <label className="hfr-field__label" htmlFor={fieldId}>
          {field.label}{field.required ? <span className="hfr-required">*</span> : null}
        </label>
        <input id={fieldId} type="date" className="hfr-field__input" {...register(field.id)} />
        {error ? <span className="hfr-error">{String(error.message ?? '')}</span> : null}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="hfr-field">
        <label className="hfr-field__label" htmlFor={fieldId}>
          {field.label}{field.required ? <span className="hfr-required">*</span> : null}
        </label>
        <textarea
          id={fieldId}
          className="hfr-field__input hfr-field__textarea"
          placeholder={field.placeholder}
          rows={3}
          {...register(field.id)}
        />
        {error ? <span className="hfr-error">{String(error.message ?? '')}</span> : null}
      </div>
    );
  }

  const htmlType = type === 'phone' || field.id === 'phone' ? 'tel'
    : type === 'email' || field.id === 'email' ? 'email'
    : 'text';

  return (
    <div className="hfr-field">
      <label className="hfr-field__label" htmlFor={fieldId}>
        {field.label}{field.required ? <span className="hfr-required">*</span> : null}
      </label>
      <input
        id={fieldId}
        type={htmlType}
        className="hfr-field__input"
        placeholder={field.placeholder}
        autoComplete={field.id === 'fullName' || field.id === 'name' ? 'name' : 'on'}
        {...register(field.id)}
      />
      {error ? <span className="hfr-error">{String(error.message ?? '')}</span> : null}
    </div>
  );
}

// ── Confirmation screen ─────────────────────────────────────────────────────

function ConfirmationScreen({ props, values }: {
  props: FormNodeProps;
  values: Record<string, string>;
}) {
  const name = values['fullName'] || values['name'] || values['f_name'] || '';
  const model = values['model'] || values['vehicleModel'] || values['f_model'] || '';
  const city = values['city'] || values['ville'] || values['f_city'] || '';
  const date = values['date'] || values['testDate'] || values['f_date'] || '';

  return (
    <motion.div
      className="hfr-confirmation"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="hfr-confirmation__icon">
        <Check size={28} strokeWidth={2.5} />
      </div>
      <h2 className="hfr-confirmation__title">
        {props.successMessage || 'Merci pour votre demande !'}
      </h2>
      {(name || model || city || date) ? (
        <dl className="hfr-confirmation__recap">
          {name ? <><dt>Nom</dt><dd>{name}</dd></> : null}
          {model ? <><dt>Modèle</dt><dd>{model}</dd></> : null}
          {city ? <><dt>Ville</dt><dd>{city}</dd></> : null}
          {date ? <><dt>Date</dt><dd>{new Date(date).toLocaleDateString('fr-MA')}</dd></> : null}
        </dl>
      ) : null}
    </motion.div>
  );
}

// ── Step form ───────────────────────────────────────────────────────────────

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export function HeroFormRenderer({
  node,
  props,
}: {
  node: { id: string };
  props: FormNodeProps;
}) {
  const campaignId = useBuilderV4Store(s => s.campaignId);
  const landingPageId = useBuilderV4Store(s => s.landingPageId);
  const pageVersionId = useBuilderV4Store(s => s.pageVersionId);

  const steps = resolveFormSteps(props);
  const totalSteps = steps.length;
  const isSingleStep = totalSteps <= 1;

  const [stepIndex, setStepIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedValues, setConfirmedValues] = useState<Record<string, string>>({});

  const currentStep: FormStepConfig | undefined = steps[stepIndex];
  const visibleFields = currentStep
    ? getFieldsForStep(props.fields, currentStep)
    : props.fields.filter(f => f.enabled !== false);

  const schema = buildZodSchema(visibleFields);

  const { register, setValue, watch, trigger, formState: { errors }, getValues, reset } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: Object.fromEntries(props.fields.map(f => [f.id, ''])),
  });

  // Auto-reset after success
  useEffect(() => {
    if (submitState !== 'success') return;
    if (!props.autoReset) return;
    const delay = (props.autoResetDelay ?? 5) * 1000;
    const timer = setTimeout(() => {
      reset(Object.fromEntries(props.fields.map(f => [f.id, ''])));
      setStepIndex(0);
      setDir(1);
      setSubmitState('idle');
      setConfirmedValues({});
    }, delay);
    return () => clearTimeout(timer);
  }, [submitState, props.autoReset, props.autoResetDelay, props.fields, reset]);

  const progress = stepProgressPercent(stepIndex, Math.max(totalSteps, 1));

  async function goNext() {
    const valid = await trigger(visibleFields.map(f => f.id));
    if (!valid) return;
    if (!isSingleStep && stepIndex < totalSteps - 1) {
      setDir(1);
      setStepIndex(i => i + 1);
    } else {
      await onSubmit(getValues() as Record<string, string>);
    }
  }

  function goBack() {
    setDir(-1);
    setStepIndex(i => Math.max(0, i - 1));
  }

  async function onSubmit(values: Record<string, string>) {
    setSubmitState('loading');
    setSubmitError(null);

    const { fullName, phone, email, vehicleModel, city, message, preferredDate } = buildApiPayload(values, props.fields);

    if (!fullName || !phone) {
      setSubmitState('error');
      setSubmitError('Nom et téléphone sont obligatoires.');
      return;
    }

    const submissionMode   = (props as any).submissionMode ?? 'DATABASE';
    const enableLeadsApi   = (props as any).enableLeadsApi !== false;
    const webhookUrl       = (props as any).webhookUrl as string | undefined;
    const redirectUrl      = (props as any).redirectUrl as string | undefined;
    const errorMsg         = (props as any).errorMessage as string | undefined;
    const effectiveCampId  = (props as any).campaignIdOverride || campaignId || undefined;

    // requestType: use explicit prop, or derive from template name, or default TEST_DRIVE
    const TEMPLATE_REQUEST_TYPE: Record<string, 'TEST_DRIVE' | 'CONTACT'> = {
      essai: 'TEST_DRIVE',
      devis: 'CONTACT',
      reprise: 'CONTACT',
      sav: 'CONTACT',
      contact: 'CONTACT',
    };
    const rawReqType = (props as any).requestType as string | undefined;
    const templateKey = ((props as any).formTemplate as string | undefined)?.toLowerCase() ?? '';
    const resolvedRequestType: 'TEST_DRIVE' | 'CONTACT' =
      (rawReqType === 'TEST_DRIVE' || rawReqType === 'CONTACT') ? rawReqType
      : TEMPLATE_REQUEST_TYPE[templateKey] ?? 'TEST_DRIVE';

    const payload = {
      campaignId:    effectiveCampId   || undefined,
      landingPageId: landingPageId     || undefined,
      pageVersionId: pageVersionId     || undefined,
      fullName,
      phone,
      email:         email || undefined,
      vehicleModel:  vehicleModel || undefined,
      city:          city || undefined,
      message:       message || undefined,
      preferredDate: preferredDate || undefined,
      requestType:   resolvedRequestType,
      sourceUrl:     window.location.href,
      rawPayload:    values as Record<string, unknown>,
    };

    console.log('[HeroForm] onSubmit', { mode: submissionMode, enableLeadsApi, payload });

    // ── LOCAL mode ────────────────────────────────────────────────────────────
    if (!enableLeadsApi || submissionMode === 'LOCAL') {
      if (submissionMode === 'LOCAL') {
        try {
          const prev: unknown[] = JSON.parse(localStorage.getItem('ah_leads') ?? '[]');
          localStorage.setItem('ah_leads', JSON.stringify([...prev, { ...payload, submittedAt: new Date().toISOString() }]));
        } catch { /* ignore */ }
      }
      setConfirmedValues({ ...values });
      setSubmitState('success');
      if (redirectUrl) setTimeout(() => { window.location.href = redirectUrl; }, 1200);
      return;
    }

    // ── WEBHOOK mode ──────────────────────────────────────────────────────────
    if (submissionMode === 'WEBHOOK' && webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        console.log('[HeroForm] Webhook response:', { status: res.status, body });
        if (!res.ok) throw new Error((body as any).message ?? `HTTP ${res.status}`);
        setConfirmedValues({ ...values });
        setSubmitState('success');
        if (redirectUrl) setTimeout(() => { window.location.href = redirectUrl; }, 1200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[HeroForm] Webhook error:', msg);
        setSubmitState('error');
        setSubmitError(errorMsg ?? "Erreur lors de l'envoi. Veuillez réessayer.");
      }
      return;
    }

    // ── DATABASE mode — POST /api/public/leads ────────────────────────────────
    try {
      const response = await apiRequest('/api/public/leads', { method: 'POST', body: payload, auth: false });
      console.log('[HeroForm] API response ✓', response);
      setConfirmedValues({ ...values });
      setSubmitState('success');
      if (redirectUrl) setTimeout(() => { window.location.href = redirectUrl; }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[HeroForm] API error:', msg);
      setSubmitState('error');
      setSubmitError(errorMsg ?? "Erreur lors de l'envoi. Veuillez réessayer.");
    }
  }

  const isDark = isDarkColor(props.cardBackground);
  const cardClassName = isDark ? 'hfr-card hfr-card--dark' : 'hfr-card';

  if (submitState === 'success') {
    return (
      <div className={cardClassName} style={{
        borderRadius: props.cardRadius ?? 12,
        background: props.cardBackground ?? '#fff',
        padding: props.cardSpacing ?? 24,
        color: props.textColor ?? '#111827',
      }}>
        <ConfirmationScreen props={props} values={confirmedValues} />
      </div>
    );
  }

  const isLastStep = isSingleStep || stepIndex === totalSteps - 1;
  const actionLabel = currentStep?.nextLabel ?? (isLastStep ? (props.submitLabel || 'Envoyer') : (props.submitLabel || 'Suivant'));
  const loadingLabel = props.loadingMessage || 'Envoi…';

  return (
    <div
      className={cardClassName}
      style={{
        borderRadius: props.cardRadius ?? 12,
        background: props.cardBackground ?? '#fff',
        padding: props.cardSpacing ?? 24,
        color: props.textColor ?? '#111827',
        ['--hfr-accent' as string]: props.accentColor ?? '#e85d04',
      }}
      data-hfr-node={node.id}
    >
      {/* Progress bar */}
      {!isSingleStep && props.showProgress !== false ? (
        <div className="hfr-progress" aria-hidden>
          <motion.div
            className="hfr-progress__fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      ) : null}

      {/* Step label */}
      {!isSingleStep ? (
        <p className="hfr-step-label">{stepNumberLabel(stepIndex, totalSteps)}</p>
      ) : null}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={stepIndex}
          custom={dir}
          variants={SLIDE_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {/* Step title */}
          <h2 className="hfr-step-title">{currentStep?.title ?? props.title}</h2>
          {currentStep?.description ? (
            <p className="hfr-step-desc">{currentStep.description}</p>
          ) : null}

          {/* Fields */}
          <div className="hfr-fields">
            {visibleFields.map(field => (
              <div
                key={field.id}
                className={`hfr-field-wrap${field.width === '50%' ? ' hfr-field-wrap--half' : ''}`}
              >
                <FieldControl
                  field={field}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {submitState === 'error' && submitError ? (
        <p className="hfr-submit-error">{submitError}</p>
      ) : null}

      {/* Actions */}
      <div className="hfr-actions">
        {!isSingleStep && stepIndex > 0 ? (
          <button type="button" className="hfr-btn hfr-btn--back" onClick={goBack}>
            <ChevronLeft size={16} aria-hidden />
            {currentStep?.backLabel ?? props.backLabel ?? 'Retour'}
          </button>
        ) : <span />}

        <button
          type="button"
          className={`hfr-btn hfr-btn--next ${submitState === 'loading' ? 'hfr-btn--loading' : ''}`}
          onClick={goNext}
          disabled={submitState === 'loading'}
        >
          {submitState === 'loading' ? loadingLabel : actionLabel}
          {submitState !== 'loading' && !isLastStep ? <ChevronRight size={16} aria-hidden /> : null}
        </button>
      </div>
    </div>
  );
}
