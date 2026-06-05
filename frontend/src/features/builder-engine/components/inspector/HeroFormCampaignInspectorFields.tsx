import { asPropString } from '../../lib/block-props';
import { extractDesignRaw } from '../../lib/block-style';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { MediaAssetField } from '../media/MediaAssetField';
import { FormInspectorFields } from './FormInspectorFields';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorSelect,
  InspectorTextarea,
} from './InspectorPrimitives';

const LAYOUT_OPTIONS = [
  { value: 'text_left_form_right', label: 'Texte gauche · formulaire droite' },
  { value: 'form_left_text_right', label: 'Formulaire gauche · texte droite' },
  { value: 'image_left_form_right', label: 'Image gauche · formulaire droite' },
  { value: 'dark_promo_form', label: 'Promo sombre + formulaire' },
  { value: 'sav_light_form', label: 'SAV clair + formulaire' },
] as const;

const TONE_OPTIONS = [
  { value: 'light', label: 'Clair' },
  { value: 'soft', label: 'Doux' },
  { value: 'dark', label: 'Sombre' },
  { value: 'brand', label: 'Marque' },
] as const;

type HeroFormCampaignInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

function formProps(propsJson: Record<string, unknown>): Record<string, unknown> {
  const form = propsJson.form;
  if (form && typeof form === 'object' && !Array.isArray(form)) {
    return form as Record<string, unknown>;
  }
  return {};
}

export function HeroFormCampaignInspectorFields({
  blockId,
  propsJson,
}: HeroFormCampaignInspectorFieldsProps) {
  const { patchString, patchProps } = useBlockPropsPatch(blockId);
  const design = extractDesignRaw(propsJson);
  const fp = formProps(propsJson);

  function patchForm(patch: Record<string, unknown>) {
    patchProps({ form: { ...fp, ...patch } });
  }

  function patchDesignField(key: string, value: string) {
    patchProps({ design: { ...design, [key]: value } });
  }

  return (
    <InspectorAccordion defaultValue={['content', 'form', 'media', 'layout']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Surtitre"
          value={asPropString(propsJson.eyebrow)}
          onChange={(e) => patchString('eyebrow', e.target.value)}
        />
        <InspectorInput
          label="Titre"
          value={asPropString(propsJson.title)}
          onChange={(e) => patchString('title', e.target.value)}
        />
        <InspectorTextarea
          label="Sous-titre"
          rows={2}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="form" title="Champs formulaire">
        <FormInspectorFields
          blockId={blockId}
          propsJson={fp}
          onPatch={{
            patchString: (key, value) => patchForm({ [key]: value }),
            patchProps: patchForm,
            patchDesign: (partial) => {
              const prev =
                fp.design && typeof fp.design === 'object' && !Array.isArray(fp.design)
                  ? (fp.design as Record<string, unknown>)
                  : {};
              patchForm({ design: { ...prev, ...partial } });
            },
          }}
        />
      </InspectorSection>

      <InspectorSection value="media" title="Média">
        <InspectorSelect
          label="Position image"
          value={asPropString(design.imagePosition) || 'none'}
          options={[
            { value: 'none', label: 'Aucune' },
            { value: 'left', label: 'Gauche' },
            { value: 'right', label: 'Droite' },
          ]}
          onChange={(value) => patchDesignField('imagePosition', value)}
        />
        {asPropString(design.imagePosition) !== 'none' ? (
          <>
            <MediaAssetField
              imageAssetId={asPropString(propsJson.imageAssetId)}
              onPickAsset={(assetId) => patchProps({ imageAssetId: assetId, imageUrl: '' })}
            />
            <InspectorInput
              label="Texte alternatif"
              value={asPropString(propsJson.alt)}
              onChange={(e) => patchString('alt', e.target.value)}
            />
          </>
        ) : null}
      </InspectorSection>

      <InspectorSection value="layout" title="Mise en page">
        <InspectorSelect
          label="Disposition"
          value={asPropString(propsJson.layoutVariant) || 'sav_light_form'}
          options={[...LAYOUT_OPTIONS]}
          onChange={(value) => patchString('layoutVariant', value)}
        />
        <InspectorSelect
          label="Ton"
          value={asPropString(design.tone) || 'light'}
          options={[...TONE_OPTIONS]}
          onChange={(value) => patchDesignField('tone', value)}
        />
        <InspectorInput
          label="CTA principal"
          value={asPropString(propsJson.buttonText)}
          onChange={(e) => patchString('buttonText', e.target.value)}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
