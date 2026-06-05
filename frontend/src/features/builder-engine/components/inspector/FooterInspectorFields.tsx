import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';
import { InspectorListField } from './InspectorListField';
import { BlockStyleInspectorFields } from './BlockStyleInspectorFields';

type FooterInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function FooterInspectorFields({ blockId, propsJson }: FooterInspectorFieldsProps) {
  const { patchString, patchList } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['legal', 'links']}>
      <InspectorSection value="legal" title="Mentions">
        <InspectorTextarea
          label="Texte légal"
          rows={4}
          value={asPropString(propsJson.legalText)}
          onChange={(e) => patchString('legalText', e.target.value)}
        />
      </InspectorSection>

      <BlockStyleInspectorFields
        blockId={blockId}
        blockType="footer_legal"
        propsJson={propsJson}
      />
      <InspectorSection value="links" title="Liens">
        <InspectorListField
          label="Liens du pied de page"
          listKey="links"
          columns={[
            { key: 'label', label: 'Libellé' },
            { key: 'href', label: 'URL', placeholder: '#' },
          ]}
          propsJson={propsJson}
          maxItems={4}
          onListChange={patchList}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
