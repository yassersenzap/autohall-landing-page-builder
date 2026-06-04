import {
  BACKGROUND_THEME_OPTIONS,
  type BlockBackgroundTheme,
} from '../../lib/block-design-props';
import { extractDesignRaw, getLayoutOptionsForBlockType } from '../../lib/block-style';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorFieldLabel,
  InspectorInput,
  InspectorSection,
  InspectorSelect,
} from './InspectorPrimitives';

const SPACING_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'spacious', label: 'Aéré' },
];

const WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Étroit' },
  { value: 'normal', label: 'Standard' },
  { value: 'wide', label: 'Large' },
];

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centré' },
  { value: 'right', label: 'Droite' },
];

const FIT_OPTIONS = [
  { value: 'cover', label: 'Remplir (cover)' },
  { value: 'contain', label: 'Contenir (contain)' },
];

const FOCAL_OPTIONS = [
  { value: 'center', label: 'Centre' },
  { value: 'top', label: 'Haut' },
  { value: 'bottom', label: 'Bas' },
  { value: 'left', label: 'Gauche' },
  { value: 'right', label: 'Droite' },
];

const RADIUS_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'soft', label: 'Léger' },
  { value: 'medium', label: 'Moyen' },
  { value: 'strong', label: 'Fort' },
];

const SHADOW_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'soft', label: 'Douce' },
  { value: 'strong', label: 'Forte' },
];

const OVERLAY_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'light', label: 'Léger' },
  { value: 'medium', label: 'Moyen' },
  { value: 'strong', label: 'Fort' },
];

const HEADING_SIZE_OPTIONS = [
  { value: 'small', label: 'Petit' },
  { value: 'medium', label: 'Moyen' },
  { value: 'large', label: 'Grand' },
  { value: 'xlarge', label: 'Très grand' },
];

const BUTTON_VARIANT_OPTIONS = [
  { value: 'primary', label: 'Principal' },
  { value: 'secondary', label: 'Secondaire' },
  { value: 'ghost', label: 'Discret' },
];

const BUTTON_RADIUS_OPTIONS = [
  { value: 'pill', label: 'Pilule' },
  { value: 'rounded', label: 'Arrondi' },
  { value: 'square', label: 'Carré' },
];

type BlockStyleInspectorFieldsProps = {
  blockId: string;
  blockType: string;
  propsJson: Record<string, unknown>;
  showMedia?: boolean;
};

export function BlockStyleInspectorFields({
  blockId,
  blockType,
  propsJson,
  showMedia = false,
}: BlockStyleInspectorFieldsProps) {
  const { patchDesign, readOnly } = useBlockPropsPatch(blockId);
  const design = extractDesignRaw(propsJson);
  const layoutOptions = getLayoutOptionsForBlockType(blockType);

  const d = (key: string) => (typeof design[key] === 'string' ? design[key] : '') as string;

  return (
    <InspectorAccordion defaultValue={['layout', ...(showMedia ? ['media'] : []), 'design']}>
      <InspectorSection value="layout" title="Mise en page">
        {layoutOptions.length > 0 ? (
          <InspectorSelect
            label="Variante de section"
            value={d('layoutVariant') || layoutOptions[0]?.value}
            options={[...layoutOptions]}
            onChange={(value) => patchDesign({ layoutVariant: value })}
          />
        ) : null}
        <InspectorSelect
          label="Thème clair / sombre"
          value={(d('backgroundMode') || 'light') as BlockBackgroundTheme}
          options={BACKGROUND_THEME_OPTIONS}
          onChange={(value) => patchDesign({ backgroundMode: value })}
        />
        <InspectorSelect
          label="Espacement vertical (haut)"
          value={d('paddingTop') || 'normal'}
          options={SPACING_OPTIONS}
          onChange={(value) => patchDesign({ paddingTop: value })}
        />
        <InspectorSelect
          label="Espacement vertical (bas)"
          value={d('paddingBottom') || 'normal'}
          options={SPACING_OPTIONS}
          onChange={(value) => patchDesign({ paddingBottom: value })}
        />
        <InspectorSelect
          label="Largeur du contenu"
          value={d('contentWidth') || 'normal'}
          options={WIDTH_OPTIONS}
          onChange={(value) => patchDesign({ contentWidth: value })}
        />
        <InspectorSelect
          label="Alignement du texte"
          value={d('alignment') || 'left'}
          options={ALIGN_OPTIONS}
          onChange={(value) => patchDesign({ alignment: value })}
        />
        <InspectorSelect
          label="Taille du titre"
          value={d('headingSize') || 'large'}
          options={HEADING_SIZE_OPTIONS}
          onChange={(value) => patchDesign({ headingSize: value })}
        />
      </InspectorSection>

      {showMedia ? (
        <InspectorSection value="media" title="Média">
          <p className="text-xs text-muted-foreground">
            Réglages d’affichage de l’image (recadrage via object-fit, pas d’éditeur crop).
          </p>
          <InspectorSelect
            label="Position du visuel"
            value={d('mediaPosition') || 'right'}
            options={[
              { value: 'right', label: 'À droite' },
              { value: 'left', label: 'À gauche' },
              { value: 'background', label: 'En arrière-plan' },
              { value: 'none', label: 'Masqué' },
            ]}
            onChange={(value) => patchDesign({ mediaPosition: value })}
          />
          <InspectorSelect
            label="Ajustement image"
            value={d('mediaFit') || 'cover'}
            options={FIT_OPTIONS}
            onChange={(value) => patchDesign({ mediaFit: value })}
          />
          <InspectorSelect
            label="Point focal"
            value={d('mediaFocal') || 'center'}
            options={FOCAL_OPTIONS}
            onChange={(value) => patchDesign({ mediaFocal: value })}
          />
          <InspectorSelect
            label="Coins de l’image"
            value={d('mediaRadius') || 'medium'}
            options={RADIUS_OPTIONS}
            onChange={(value) => patchDesign({ mediaRadius: value })}
          />
          <InspectorSelect
            label="Ombre"
            value={d('mediaShadow') || 'soft'}
            options={SHADOW_OPTIONS}
            onChange={(value) => patchDesign({ mediaShadow: value })}
          />
          <InspectorSelect
            label="Overlay (image de fond)"
            value={d('overlayOpacity') || 'none'}
            options={OVERLAY_OPTIONS}
            onChange={(value) => patchDesign({ overlayOpacity: value })}
          />
        </InspectorSection>
      ) : null}

      <InspectorSection value="design" title="Design">
        <InspectorFieldLabel>Couleurs (optionnel)</InspectorFieldLabel>
        <InspectorInput
          label="Fond"
          type="color"
          value={d('backgroundColor') || '#ffffff'}
          onChange={(e) => patchDesign({ backgroundColor: e.target.value })}
          disabled={readOnly}
        />
        <InspectorInput
          label="Texte"
          type="color"
          value={d('textColor') || '#18181b'}
          onChange={(e) => patchDesign({ textColor: e.target.value })}
          disabled={readOnly}
        />
        <InspectorInput
          label="Titres"
          type="color"
          value={d('headingColor') || '#18181b'}
          onChange={(e) => patchDesign({ headingColor: e.target.value })}
          disabled={readOnly}
        />
        <InspectorInput
          label="Bouton principal"
          type="color"
          value={d('ctaColor') || '#b91c1c'}
          onChange={(e) => patchDesign({ ctaColor: e.target.value })}
          disabled={readOnly}
        />
        <InspectorSelect
          label="Style du bouton"
          value={d('buttonVariant') || 'primary'}
          options={BUTTON_VARIANT_OPTIONS}
          onChange={(value) => patchDesign({ buttonVariant: value })}
        />
        <InspectorSelect
          label="Forme du bouton"
          value={d('buttonRadius') || 'pill'}
          options={BUTTON_RADIUS_OPTIONS}
          onChange={(value) => patchDesign({ buttonRadius: value })}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
