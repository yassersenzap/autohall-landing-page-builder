import { asPropString } from '../../lib/block-props';
import { extractDesignRaw } from '../../lib/block-style';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { MediaAssetField } from '../media/MediaAssetField';
import {
  InspectorInput,
  InspectorAccordion,
  InspectorSection,
  InspectorSelect,
  InspectorTextarea,
} from './InspectorPrimitives';

type HeroInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

type HeroCampaignPreset =
  | 'promo_vehicle'
  | 'sav_offer'
  | 'gamme'
  | 'minimal_lead'
  | 'dark_premium'
  | 'light_premium';

const HERO_PRESET_OPTIONS: { value: HeroCampaignPreset; label: string }[] = [
  { value: 'promo_vehicle', label: 'Promo véhicule' },
  { value: 'sav_offer', label: 'Offre SAV' },
  { value: 'gamme', label: 'Gamme' },
  { value: 'minimal_lead', label: 'Minimal lead' },
  { value: 'dark_premium', label: 'Dark premium' },
  { value: 'light_premium', label: 'Light premium' },
];

function presetConfig(preset: HeroCampaignPreset): {
  campaignType: string;
  design: Record<string, unknown>;
} {
  switch (preset) {
    case 'sav_offer':
      return {
        campaignType: 'sav',
        design: { layoutVariant: 'split_image_right', backgroundMode: 'light', mediaPosition: 'right' },
      };
    case 'gamme':
      return {
        campaignType: 'gamme',
        design: { layoutVariant: 'split_image_right', backgroundMode: 'light', mediaPosition: 'right' },
      };
    case 'minimal_lead':
      return {
        campaignType: 'lead_capture',
        design: { layoutVariant: 'centered', backgroundMode: 'light', mediaPosition: 'none', alignment: 'center' },
      };
    case 'dark_premium':
      return {
        campaignType: 'promo',
        design: { layoutVariant: 'split_image_right', backgroundMode: 'dark', mediaPosition: 'right' },
      };
    case 'light_premium':
      return {
        campaignType: 'promo',
        design: { layoutVariant: 'split_image_left', backgroundMode: 'light', mediaPosition: 'left' },
      };
    case 'promo_vehicle':
    default:
      return {
        campaignType: 'promo',
        design: { layoutVariant: 'split_image_right', backgroundMode: 'dark', mediaPosition: 'right' },
      };
  }
}

function readPreset(propsJson: Record<string, unknown>, design: Record<string, unknown>): HeroCampaignPreset {
  const campaign = asPropString(propsJson.campaignType);
  const layout = asPropString(design.layoutVariant);
  const mode = asPropString(design.backgroundMode) || 'light';
  const media = asPropString(design.mediaPosition) || 'right';

  if (campaign === 'sav') return 'sav_offer';
  if (campaign === 'gamme') return 'gamme';
  if (campaign === 'lead_capture' || layout === 'centered' || media === 'none') return 'minimal_lead';
  if (mode === 'dark') return 'dark_premium';
  if (media === 'left') return 'light_premium';
  return 'promo_vehicle';
}

export function HeroInspectorFields({ blockId, propsJson }: HeroInspectorFieldsProps) {
  const { patchString, patchProps, patchDesign } = useBlockPropsPatch(blockId);
  const design = extractDesignRaw(propsJson);
  const preset = readPreset(propsJson, design);
  const hasImage = Boolean(asPropString(propsJson.imageAssetId) || asPropString(propsJson.imageUrl));
  const altMissing = hasImage && !asPropString(propsJson.alt).trim();

  return (
    <InspectorAccordion defaultValue={['content', 'media', 'cta', 'layout']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre principal"
          value={asPropString(propsJson.title)}
          onChange={(e) => patchString('title', e.target.value)}
          placeholder="Ex : Nouvelle offre véhicule"
        />
        <InspectorTextarea
          label="Sous-titre"
          rows={3}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
        <InspectorInput
          label="Accroche (eyebrow)"
          value={asPropString(propsJson.eyebrow)}
          onChange={(e) => patchString('eyebrow', e.target.value)}
        />
        <InspectorInput
          label="Badge promo"
          value={asPropString(propsJson.promoBadge)}
          onChange={(e) => patchString('promoBadge', e.target.value)}
          hint="Optionnel — affiché sous l’accroche."
        />
      </InspectorSection>

      <InspectorSection value="media" title="Média">
        <MediaAssetField
          imageAssetId={asPropString(propsJson.imageAssetId)}
          onPickAsset={(assetId) => patchProps({ imageAssetId: assetId, imageUrl: '' })}
        />
        <InspectorInput
          label="Texte alternatif"
          value={asPropString(propsJson.alt)}
          onChange={(e) => patchString('alt', e.target.value)}
          hint={altMissing ? 'Requis pour l’accessibilité et la publication.' : 'Décrivez le visuel véhicule.'}
        />
        {altMissing ? (
          <p className="text-[0.65rem] font-medium text-amber-600">
            Image sans texte alternatif — ajoutez une description avant publication.
          </p>
        ) : null}
      </InspectorSection>

      <InspectorSection value="cta" title="Appels à l’action">
        <InspectorInput
          label="CTA principal"
          value={asPropString(propsJson.buttonText)}
          onChange={(e) => patchString('buttonText', e.target.value)}
          placeholder="Ex : Demander un essai"
        />
        <InspectorInput
          label="Lien CTA principal"
          value={asPropString(propsJson.buttonTarget)}
          onChange={(e) => patchString('buttonTarget', e.target.value)}
          hint="Ex. #lead-form"
        />
        <InspectorInput
          label="CTA secondaire"
          value={asPropString(propsJson.secondaryButtonText)}
          onChange={(e) => patchString('secondaryButtonText', e.target.value)}
        />
        <InspectorInput
          label="Lien CTA secondaire"
          value={asPropString(propsJson.secondaryButtonTarget)}
          onChange={(e) => patchString('secondaryButtonTarget', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="layout" title="Mise en page">
        <InspectorSelect
          label="Variante campagne"
          value={preset}
          options={HERO_PRESET_OPTIONS}
          onChange={(value) => {
            const { campaignType, design: nextDesign } = presetConfig(value as HeroCampaignPreset);
            patchProps({ campaignType });
            patchDesign(nextDesign);
          }}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
