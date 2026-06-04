import { ToggleGroup } from '@/components/ui/primitives';
import {
  BACKGROUND_THEME_OPTIONS,
  IMAGE_ALIGNMENT_OPTIONS,
  parseBackgroundTheme,
  parseImageAlignment,
  type BlockBackgroundTheme,
  type ImageAlignment,
} from '../../lib/block-design-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorFieldLabel,
  InspectorSection,
  InspectorSelect,
} from './InspectorPrimitives';

type BlockDesignLayoutFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function BlockDesignLayoutFields({ blockId, propsJson }: BlockDesignLayoutFieldsProps) {
  const { patchString } = useBlockPropsPatch(blockId);
  const alignment = parseImageAlignment(propsJson.imageAlignment);
  const theme = parseBackgroundTheme(propsJson.backgroundTheme);

  return (
    <InspectorSection value="design" title="Design & Layout">
      <div className="grid gap-2">
        <InspectorFieldLabel>Alignement du visuel</InspectorFieldLabel>
        <ToggleGroup<ImageAlignment>
          value={alignment}
          ariaLabel="Alignement image"
          className="w-full"
          items={IMAGE_ALIGNMENT_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          onChange={(value) => patchString('imageAlignment', value)}
        />
      </div>

      <InspectorSelect
        label="Thème de fond"
        value={theme}
        options={BACKGROUND_THEME_OPTIONS}
        onChange={(value) => patchString('backgroundTheme', value as BlockBackgroundTheme)}
      />
    </InspectorSection>
  );
}
