import { asPropString } from '../../lib/block-props';

import { extractDesignRaw } from '../../lib/block-style';

import { useBlockPropsPatch } from '../../lib/use-block-props-patch';

import { MediaAssetField } from '../media/MediaAssetField';

import { InspectorInput, InspectorAccordion, InspectorSection, InspectorSelect, InspectorTextarea } from './InspectorPrimitives';



type HeroInspectorFieldsProps = {

  blockId: string;

  propsJson: Record<string, unknown>;

};



type HeroVariantPreset =

  | 'light_right'

  | 'light_left'

  | 'dark_right'

  | 'dark_left'

  | 'centered_light'

  | 'centered_dark';



const HERO_VARIANT_OPTIONS: { value: HeroVariantPreset; label: string }[] = [

  { value: 'light_right', label: 'Clair — image à droite' },

  { value: 'light_left', label: 'Clair — image à gauche' },

  { value: 'dark_right', label: 'Sombre — image à droite' },

  { value: 'dark_left', label: 'Sombre — image à gauche' },

  { value: 'centered_light', label: 'Centré — thème clair' },

  { value: 'centered_dark', label: 'Centré — thème sombre' },

];



function readHeroVariant(design: Record<string, unknown>): HeroVariantPreset {

  const layout = asPropString(design.layoutVariant);

  const mode = asPropString(design.backgroundMode) || 'light';

  const media = asPropString(design.mediaPosition) || 'right';



  if (layout === 'centered' || layout === 'minimal' || media === 'none') {

    return mode === 'dark' ? 'centered_dark' : 'centered_light';

  }

  if (media === 'left' || layout === 'split_image_left') {

    return mode === 'dark' ? 'dark_left' : 'light_left';

  }

  return mode === 'dark' ? 'dark_right' : 'light_right';

}



function designForHeroVariant(variant: HeroVariantPreset): Record<string, unknown> {

  switch (variant) {

    case 'light_left':

      return { layoutVariant: 'split_image_left', backgroundMode: 'light', mediaPosition: 'left' };

    case 'dark_left':

      return { layoutVariant: 'split_image_left', backgroundMode: 'dark', mediaPosition: 'left' };

    case 'dark_right':

      return { layoutVariant: 'split_image_right', backgroundMode: 'dark', mediaPosition: 'right' };

    case 'centered_light':

      return { layoutVariant: 'centered', backgroundMode: 'light', mediaPosition: 'none', alignment: 'center' };

    case 'centered_dark':

      return { layoutVariant: 'centered', backgroundMode: 'dark', mediaPosition: 'none', alignment: 'center' };

    case 'light_right':

    default:

      return { layoutVariant: 'split_image_right', backgroundMode: 'light', mediaPosition: 'right' };

  }

}



export function HeroInspectorFields({ blockId, propsJson }: HeroInspectorFieldsProps) {

  const { patchString, patchProps, patchDesign } = useBlockPropsPatch(blockId);

  const design = extractDesignRaw(propsJson);

  const variant = readHeroVariant(design);



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

          placeholder="Ex : Profitez d’une offre limitée en concession."

        />

        <InspectorInput

          label="Accroche (eyebrow)"

          value={asPropString(propsJson.eyebrow)}

          onChange={(e) => patchString('eyebrow', e.target.value)}

          placeholder="Ex : Offre en cours"

        />

        <InspectorInput

          label="Badge promo (optionnel)"

          value={asPropString(propsJson.promoBadge)}

          onChange={(e) => patchString('promoBadge', e.target.value)}

          placeholder="Ex : Offre limitée"

        />

      </InspectorSection>



      <InspectorSection value="media" title="Média">

        <MediaAssetField

          imageAssetId={asPropString(propsJson.imageAssetId)}

          onPickAsset={(assetId) => {

            patchProps({ imageAssetId: assetId, imageUrl: '' });

          }}

        />

        <InspectorInput

          label="Texte alternatif"

          value={asPropString(propsJson.alt)}

          onChange={(e) => patchString('alt', e.target.value)}

          hint="Décrivez le visuel véhicule ou l’offre."

        />

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

          label="Variante"

          value={variant}

          options={HERO_VARIANT_OPTIONS}

          onChange={(value) => patchDesign(designForHeroVariant(value as HeroVariantPreset))}

        />

      </InspectorSection>

    </InspectorAccordion>

  );

}

