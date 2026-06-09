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

function readListItem(
  propsJson: Record<string, unknown>,
  key: string,
  index: number,
): Record<string, unknown> {
  const list = Array.isArray(propsJson[key]) ? [...(propsJson[key] as unknown[])] : [];
  const raw = list[index];
  return raw && typeof raw === 'object' ? { ...(raw as Record<string, unknown>) } : {};
}

function writeListItem(
  propsJson: Record<string, unknown>,
  key: string,
  index: number,
  item: Record<string, unknown>,
  patch: (p: Record<string, unknown>) => void,
): void {
  const list = Array.isArray(propsJson[key]) ? [...(propsJson[key] as unknown[])] : [];
  while (list.length <= index) list.push({});
  list[index] = item;
  patch({ [key]: list });
}

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

  if (type === 'vehicle_range') {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="v3-range-heading" className="text-neutral-400">
            Titre de la gamme
          </Label>
          <ShadInput
            id="v3-range-heading"
            value={asPropString(propsJson.heading)}
            onChange={(e) => patch({ heading: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v3-range-sub" className="text-neutral-400">
            Sous-titre
          </Label>
          <ShadInput
            id="v3-range-sub"
            value={asPropString(propsJson.subtitle)}
            onChange={(e) => patch({ subtitle: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        {[0, 1, 2].map((index) => {
          const vehicle = readListItem(propsJson, 'vehicles', index);
          return (
            <div key={index} className="space-y-2 rounded-lg border border-neutral-800 p-3">
              <p className="text-xs font-medium text-neutral-400">Modèle {index + 1}</p>
              <ShadInput
                value={asPropString(vehicle.name)}
                onChange={(e) => {
                  writeListItem(propsJson, 'vehicles', index, { ...vehicle, name: e.target.value }, patch);
                }}
                placeholder="Nom du modèle"
                className="border-neutral-700 bg-neutral-900 text-neutral-200"
              />
              <select
                value={asPropString(vehicle.energy) || 'Thermique'}
                onChange={(e) => {
                  writeListItem(
                    propsJson,
                    'vehicles',
                    index,
                    { ...vehicle, energy: e.target.value },
                    patch,
                  );
                }}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
              >
                <option value="Thermique">Thermique</option>
                <option value="HEV">HEV</option>
                <option value="PHEV">PHEV</option>
                <option value="Électrique">Électrique</option>
              </select>
              <MediaFieldControl
                label={`Visuel modèle ${index + 1}`}
                value={mediaValueFromProps(vehicle)}
                onChange={(next) => {
                  writeListItem(
                    propsJson,
                    'vehicles',
                    index,
                    {
                      ...vehicle,
                      imageAssetId: next.imageAssetId ?? '',
                      imageUrl: next.imageUrl ?? '',
                      alt: next.alt ?? '',
                      objectFit: next.objectFit ?? 'cover',
                    },
                    patch,
                  );
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (type === 'benefits') {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="v3-benefits-heading" className="text-neutral-400">
            Titre section
          </Label>
          <ShadInput
            id="v3-benefits-heading"
            value={asPropString(propsJson.heading)}
            onChange={(e) => patch({ heading: e.target.value })}
            className="border-neutral-700 bg-neutral-900 text-neutral-200"
          />
        </div>
        {[0, 1, 2].map((index) => {
          const item = readListItem(propsJson, 'items', index);
          return (
            <div key={index} className="space-y-2 rounded-lg border border-neutral-800 p-3">
              <p className="text-xs font-medium text-neutral-400">Avantage {index + 1}</p>
              <ShadInput
                value={asPropString(item.title)}
                onChange={(e) => {
                  writeListItem(propsJson, 'items', index, { ...item, title: e.target.value }, patch);
                }}
                placeholder="Titre"
                className="border-neutral-700 bg-neutral-900 text-neutral-200"
              />
              <ShadTextarea
                rows={2}
                value={asPropString(item.description)}
                onChange={(e) => {
                  writeListItem(
                    propsJson,
                    'items',
                    index,
                    { ...item, description: e.target.value },
                    patch,
                  );
                }}
                placeholder="Description"
                className="border-neutral-700 bg-neutral-900 text-neutral-200"
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (type === 'trust_bar') {
    return (
      <div className="space-y-4">
        <FieldHint>Chiffres de réassurance — laisser vide masque le bandeau à l’export.</FieldHint>
        {[0, 1, 2, 3].map((index) => {
          const metric = readListItem(propsJson, 'metrics', index);
          return (
            <div key={index} className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500">Valeur {index + 1}</Label>
                <ShadInput
                  value={asPropString(metric.value)}
                  onChange={(e) => {
                    writeListItem(
                      propsJson,
                      'metrics',
                      index,
                      { ...metric, value: e.target.value },
                      patch,
                    );
                  }}
                  placeholder="+50"
                  className="border-neutral-700 bg-neutral-900 text-neutral-200"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500">Libellé</Label>
                <ShadInput
                  value={asPropString(metric.label)}
                  onChange={(e) => {
                    writeListItem(
                      propsJson,
                      'metrics',
                      index,
                      { ...metric, label: e.target.value },
                      patch,
                    );
                  }}
                  placeholder="Concessionnaires"
                  className="border-neutral-700 bg-neutral-900 text-neutral-200"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
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
