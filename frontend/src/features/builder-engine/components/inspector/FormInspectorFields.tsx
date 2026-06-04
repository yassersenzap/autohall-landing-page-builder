import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorTextarea,
} from './InspectorPrimitives';

type FormInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

export function FormInspectorFields({ blockId, propsJson }: FormInspectorFieldsProps) {
  const { patchString } = useBlockPropsPatch(blockId);

  return (
    <InspectorAccordion defaultValue={['content', 'fields', 'submit']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre du formulaire"
          value={asPropString(propsJson.title)}
          onChange={(e) => patchString('title', e.target.value)}
          placeholder="Ex : Demander un essai"
        />
        <InspectorTextarea
          label="Texte d’aide"
          rows={3}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
          placeholder="Ex : Un conseiller vous recontacte sous 48h."
        />
        <InspectorTextarea
          label="Note confidentialité"
          rows={2}
          value={asPropString(propsJson.privacyNote)}
          onChange={(e) => patchString('privacyNote', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="fields" title="Champs">
        <p className="text-xs text-muted-foreground">
          Les champs visibles (nom, téléphone, email…) sont configurés dans le catalogue
          lead. Personnalisation avancée à venir.
        </p>
      </InspectorSection>

      <InspectorSection value="submit" title="Soumission">
        <InspectorInput
          label="Texte du bouton"
          value={asPropString(propsJson.submitText)}
          onChange={(e) => patchString('submitText', e.target.value)}
        />
      </InspectorSection>
    </InspectorAccordion>
  );
}
