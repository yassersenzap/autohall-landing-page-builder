import { Slider } from '@/components/ui/shadcn/slider';
import { useBuilderV4Store } from '../../store/document.store';
import { DEFAULT_HERO_FORM_GEOMETRY, findHeroContentGroup } from '../../lib/studio-compat.js';
import type { FrameNodeProps } from '../../types/nodes.types';
import { InspectorField, InspectorSection, InspectorSegmented } from './InspectorPrimitives';

export function ContentLayoutSection() {
  const geo = useBuilderV4Store((s) => {
    const frame = s.document.nodes[s.document.rootId];
    return (frame?.props as FrameNodeProps).heroFormGeometry ?? DEFAULT_HERO_FORM_GEOMETRY;
  });
  const applyHeroGeometry = useBuilderV4Store((s) => s.applyHeroGeometry);
  const updateNodeLayout = useBuilderV4Store((s) => s.updateNodeLayout);
  const contentGroup = useBuilderV4Store((s) => findHeroContentGroup(s.document)?.contentGroup);

  return (
    <InspectorSection title="Mise en page" value="content-layout">
      <InspectorField label="Alignement horizontal">
        <InspectorSegmented
          value={geo.contentHorizontal ?? 'left'}
          options={[
            { value: 'left', label: 'Gauche' },
            { value: 'center', label: 'Centre' },
            { value: 'right', label: 'Droite' },
          ]}
          onChange={(contentHorizontal) =>
            applyHeroGeometry({
              contentHorizontal: contentHorizontal as 'left' | 'center' | 'right',
            })
          }
        />
      </InspectorField>
      <InspectorField label="Alignement vertical">
        <InspectorSegmented
          value={geo.contentVertical ?? 'center'}
          options={[
            { value: 'top', label: 'Haut' },
            { value: 'center', label: 'Milieu' },
            { value: 'bottom', label: 'Bas' },
          ]}
          onChange={(contentVertical) =>
            applyHeroGeometry({
              contentVertical: contentVertical as 'top' | 'center' | 'bottom',
            })
          }
        />
      </InspectorField>
      <InspectorField label="Largeur max contenu">
        <Slider
          value={[geo.contentMaxWidth ?? 480]}
          min={280}
          max={720}
          step={20}
          onValueChange={([contentMaxWidth]) => applyHeroGeometry({ contentMaxWidth })}
        />
        <span className="v4-inspector-v2__hint">{geo.contentMaxWidth ?? 480}px</span>
      </InspectorField>
      {contentGroup ? (
        <InspectorField label="Espacement blocs">
          <Slider
            value={[contentGroup.layout.gap ?? 16]}
            min={0}
            max={48}
            step={4}
            onValueChange={([gap]) => updateNodeLayout(contentGroup.id, { gap })}
          />
          <span className="v4-inspector-v2__hint">{contentGroup.layout.gap ?? 16}px</span>
        </InspectorField>
      ) : null}
    </InspectorSection>
  );
}
