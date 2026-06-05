import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import { InspectorAccordion, InspectorInput, InspectorSection, InspectorTextarea } from './InspectorPrimitives';

export function FinancingInspectorFields({ blockId, propsJson }: { blockId: string; propsJson: Record<string, unknown> }) {
  const { patchString, patchProps } = useBlockPropsPatch(blockId);
  const bullets = Array.isArray(propsJson.bullets) ? propsJson.bullets.filter((b): b is string => typeof b === 'string').join('\n') : '';

  return (
    <InspectorAccordion defaultValue={['content', 'cta']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput label="Titre" value={asPropString(propsJson.heading)} onChange={(e) => patchString('heading', e.target.value)} />
        <InspectorTextarea label="Sous-titre" rows={2} value={asPropString(propsJson.subtitle)} onChange={(e) => patchString('subtitle', e.target.value)} />
        <InspectorInput label="Exemple mensualité" value={asPropString(propsJson.paymentExample)} onChange={(e) => patchString('paymentExample', e.target.value)} />
        <InspectorTextarea
          label="Conditions (une par ligne)"
          rows={4}
          value={bullets}
          onChange={(e) =>
            patchProps({
              bullets: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
            })
          }
        />
      </InspectorSection>
      <InspectorSection value="cta" title="Action">
        <InspectorInput label="Bouton" value={asPropString(propsJson.ctaLabel)} onChange={(e) => patchString('ctaLabel', e.target.value)} />
        <InspectorInput label="Lien" value={asPropString(propsJson.ctaTarget) || '#lead-form'} onChange={(e) => patchString('ctaTarget', e.target.value)} />
      </InspectorSection>
    </InspectorAccordion>
  );
}
