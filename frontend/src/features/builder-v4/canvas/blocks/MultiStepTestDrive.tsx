import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ChevronDown, ChevronLeft, MapPin, Calendar, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { AUTOHALL_RGPD_CLAUSE } from '../../lib/pro-blocks';
import type { MultiStepTestDriveBlockProps } from '../../lib/pro-blocks';

interface FormState {
  model: string;
  city: string;
  date: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
}

// ─── Field label ────────────────────────────────────────────────────────────

function FieldLabel({ icon: Icon, children }: { icon?: typeof MapPin | typeof Calendar; children: React.ReactNode }) {
  return (
    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
      {children}
    </span>
  );
}

// ─── LeadFormCard component ──────────────────────────────────────────────────

export function LeadFormCard({ props }: { props: MultiStepTestDriveBlockProps }) {
  const villesList = props.villesList ?? [];
  const modelesList = props.modelesList ?? [];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>({
    model: modelesList[0] || '',
    city: villesList[0] || '',
    date: '',
    name: '',
    phone: '',
    email: '',
    consent: false,
  });
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const goNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.model) { setError('Veuillez sélectionner un modèle.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!formData.city) { setError('Veuillez sélectionner une ville.'); return; }
      if (!formData.date) { setError("Veuillez choisir une date d'essai."); return; }
      setStep(3);
    }
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name || !formData.phone) { setError('Veuillez remplir tous les champs obligatoires.'); return; }
    if (!formData.consent) { setError('Veuillez accepter les conditions de confidentialité.'); return; }
    setStep(4);
  };

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="relative mb-4">
            <FieldLabel icon={MapPin}>Sélectionner le modèle *</FieldLabel>
            <div className="relative">
              <select
                value={formData.model}
                onChange={(e) => updateField('model', e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none cursor-pointer appearance-none"
              >
                <option value="" disabled>Choisir un modèle...</option>
                {modelesList.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-1 flex-col gap-4">
            <div className="relative">
              <FieldLabel icon={MapPin}>Ville de l'essai *</FieldLabel>
              <div className="relative">
                <select
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none cursor-pointer appearance-none"
                >
                  <option value="" disabled>Choisir une ville...</option>
                  {villesList.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <FieldLabel icon={Calendar}>Date d'essai préférée *</FieldLabel>
              <Input
                type="date"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-1 flex-col gap-3">
            <div className="mb-2">
              <FieldLabel>Nom et Prénom *</FieldLabel>
              <Input
                type="text"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="Votre nom complet"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="mb-2">
              <FieldLabel>Téléphone *</FieldLabel>
              <Input
                type="tel"
                required
                maxLength={10}
                pattern="0[1-9][0-9]{8}"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="ex : 06xxxxxxxx"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="mb-2">
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="contact@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <label className="mt-1 flex cursor-pointer items-start gap-2.5 select-none">
              <Checkbox
                required
                checked={formData.consent}
                onCheckedChange={(checked) => updateField('consent', checked === true)}
                className="mt-0.5 shrink-0 data-[state=checked]:bg-slate-950 data-[state=checked]:border-slate-950"
              />
              <span className="text-[10px] leading-relaxed text-slate-500">{AUTOHALL_RGPD_CLAUSE}</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between transition-all duration-300 h-full">
      {step === 4 ? (
        <div className="flex flex-col items-center justify-center bg-white text-center z-10 p-6 py-12 animate-in fade-in zoom-in-95 duration-300">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
          </div>
          <h3 className="m-0 mb-2 text-xl font-bold text-slate-950">Demande Reçue !</h3>
          <p className="m-0 text-sm leading-relaxed text-slate-500 max-w-xs">
            Votre demande d'essai a été enregistrée avec succès. Un conseiller Auto Hall vous contactera sous peu.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between h-full w-full relative">
          <input type="hidden" name="testdrive_modelle" value={formData.model} />
          <input type="hidden" name="testdrive_ville" value={formData.city} />
          <input type="hidden" name="testdrive_date" value={formData.date} />
          <input type="hidden" name="testdrive_nomprenom" value={formData.name} />
          <input type="hidden" name="testdrive_telephone" value={formData.phone} />

          {/* En-tête formulaire */}
          <div className="select-none">
            <div className="mb-3 flex flex-col items-start pt-1">
              <span className="mb-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
                Test Drive Officiel
              </span>
              <h2 className="text-xl font-black text-slate-900 leading-tight m-0 tracking-tight">
                {props.formTitle || 'RÉSERVER UN ESSAI'}
              </h2>
              <p className="text-xs text-slate-500 mb-2 mt-1 leading-relaxed m-0">
                {props.formSubtitle || 'Complétez vos informations pour planifier votre essai.'}
              </p>
            </div>

            {/* Barre de progression */}
            <div className="mb-4 pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Étape 0{step}/03
                </span>
                <span className="text-[11px] font-semibold text-blue-600">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-4">
              {renderStep()}
            </div>
          </div>

          {/* Boutons d'actions */}
          <div className="pt-3 mt-auto border-t border-slate-100 flex flex-col gap-2 bg-white">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={goBack}
                className="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-600 font-bold text-xs rounded-xl h-10 w-full flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Retour
              </Button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="w-full py-3 px-5 bg-slate-900 hover:bg-blue-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Suivant</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-3 px-5 bg-slate-900 hover:bg-blue-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{props.btnSubmitLabel || 'Confirmer'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}

            <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1 select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Sans engagement
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── MultiStepTestDriveBlock (Grille 12 colonnes Pixel-Perfect) ──────────────

export function MultiStepTestDriveBlock({ props }: { props: MultiStepTestDriveBlockProps }) {
  const rawImageSrc = props.promoImageUrl || props.imageSrc;

  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => setImgFailed(false), [rawImageSrc]);
  const imageSrc = imgFailed ? null : rawImageSrc;

  return (
    <div className="w-full bg-[#f4f6f8] py-6 px-4 md:px-8 flex items-center justify-center min-h-fit">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        
        {/* Colonne de Gauche (Bannière Visuelle de l'Offre - 7 ou 8 colonnes) */}
        <div className="lg:col-span-7 xl:col-span-8 relative bg-[#eef2f6] flex items-center justify-center p-4 lg:p-6">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={props.promoImageAlt || "Gamme Tiggo Auto Hall"}
              className="w-full h-auto max-h-[620px] object-contain object-center select-none"
              loading="eager"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 p-8 text-center bg-slate-50/50 rounded-xl my-8">
              <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <span className="text-sm font-semibold text-slate-600">Aucune image sélectionnée</span>
              <p className="text-xs text-slate-400 mt-1">Déposez une bannière dans l'inspecteur pour l'afficher ici.</p>
            </div>
          )}
        </div>

        {/* Colonne de Droite (Formulaire Multi-Étapes - 5 ou 4 colonnes) */}
        <div className="lg:col-span-5 xl:col-span-4 p-6 sm:p-8 flex flex-col justify-center bg-white border-l border-zinc-100">
          <LeadFormCard props={props} />
        </div>

      </div>
    </div>
  );
}
