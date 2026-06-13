import { asPropString } from '@/features/builder-engine/lib/block-props';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { Label, ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { FieldHint } from '../components/BlockInspectorPanel.shared';
import { MediaFieldControl } from '../components/MediaFieldControl';
import { mediaValueFromProps, patchMediaProps } from '../components/media-field-utils';

type MarketingBlockInspectorFieldsProps = {
  block: BuilderDocumentBlock;
  patch: (p: Record<string, unknown>) => void;
};

export function MarketingBlockInspectorFields({ block, patch }: MarketingBlockInspectorFieldsProps) {
  const { type, propsJson } = block;

  if (type === 'vehicle_offer') {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="v3-offer-model" className="text-neutral-400">
            Modèle
          </Label>
          <ShadInput
            id="v3-offer-model"
            value={asPropString(propsJson.modelName)}
            onChange={(e) => patch({ modelName: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v3-offer-heading" className="text-neutral-400">
            Titre de l’offre
          </Label>
          <ShadInput
            id="v3-offer-heading"
            value={asPropString(propsJson.heading)}
            onChange={(e) => patch({ heading: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v3-offer-sub" className="text-neutral-400">
            Sous-titre
          </Label>
          <ShadTextarea
            id="v3-offer-sub"
            rows={2}
            value={asPropString(propsJson.subtitle)}
            onChange={(e) => patch({ subtitle: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="v3-offer-price-label" className="text-neutral-400">
              Libellé prix
            </Label>
            <ShadInput
              id="v3-offer-price-label"
              value={asPropString(propsJson.priceLabel) || 'À partir de'}
              onChange={(e) => patch({ priceLabel: e.target.value })}
              className="border-neutral-700 bg-neutral-900 text-neutral-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v3-offer-price" className="text-neutral-400">
              Prix affiché
            </Label>
            <ShadInput
              id="v3-offer-price"
              value={asPropString(propsJson.priceValue)}
              onChange={(e) => patch({ priceValue: e.target.value })}
              placeholder="299 900 DH"
              className="border-neutral-700 bg-neutral-900 text-neutral-200"
            />
          </div>
        </div>
        <MediaFieldControl
          label="Visuel véhicule"
          value={mediaValueFromProps(propsJson)}
          onChange={(next) => patchMediaProps(patch, next)}
        />
        <div className="space-y-1.5">
          <Label htmlFor="v3-offer-cta" className="text-neutral-400">
            Bouton d’action
          </Label>
          <ShadInput
            id="v3-offer-cta"
            value={asPropString(propsJson.buttonText)}
            onChange={(e) => patch({ buttonText: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <FieldHint>Points clés configurables dans l’onglet Avancé si besoin.</FieldHint>
      </div>
    );
  }

  if (type === 'vehicle_range' || type === 'benefits' || type === 'trust_bar') {
    return null;
  }

  if (type === 'final_cta') {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="v3-final-title" className="text-neutral-400">
            Titre
          </Label>
          <ShadInput
            id="v3-final-title"
            value={asPropString(propsJson.title)}
            onChange={(e) => patch({ title: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v3-final-sub" className="text-neutral-400">
            Sous-titre
          </Label>
          <ShadTextarea
            id="v3-final-sub"
            rows={2}
            value={asPropString(propsJson.subtitle)}
            onChange={(e) => patch({ subtitle: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v3-final-btn" className="text-neutral-400">
            Texte bouton
          </Label>
          <ShadInput
            id="v3-final-btn"
            value={asPropString(propsJson.buttonText)}
            onChange={(e) => patch({ buttonText: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v3-final-target" className="text-neutral-400">
            Lien du bouton
          </Label>
          <ShadInput
            id="v3-final-target"
            value={asPropString(propsJson.buttonTarget) || '#lead-form'}
            onChange={(e) => patch({ buttonTarget: e.target.value })}
            placeholder="#lead-form"
            className="border-neutral-700 bg-neutral-900 font-mono text-neutral-200"
          />
        </div>
      </div>
    );
  }

  return null;
}

export function isMarketingInspectorBlock(type: string): boolean {
  return (
    type === 'vehicle_offer' ||
    type === 'vehicle_range' ||
    type === 'benefits' ||
    type === 'trust_bar' ||
    type === 'final_cta'
  );
}
