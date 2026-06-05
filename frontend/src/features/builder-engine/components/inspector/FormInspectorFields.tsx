import { asPropString } from '../../lib/block-props';
import { useBlockPropsPatch } from '../../lib/use-block-props-patch';
import {
  DEFAULT_AUTOHALL_CONSENT_LABEL,
  DEFAULT_AUTOHALL_FORM_CONFIG,
  DEFAULT_AUTOHALL_REQUIRED_NOTE,
  buildAutoHallLeadFormFields,
  type LeadFormConfig,
} from '../../constants/autohall-lead-form';
import {
  InspectorAccordion,
  InspectorInput,
  InspectorSection,
  InspectorSelect,
  InspectorTextarea,
} from './InspectorPrimitives';

type FormInspectorFieldsProps = {
  blockId: string;
  propsJson: Record<string, unknown>;
};

function readFormConfig(propsJson: Record<string, unknown>): LeadFormConfig {
  const raw =
    propsJson.formConfig && typeof propsJson.formConfig === 'object' && !Array.isArray(propsJson.formConfig)
      ? (propsJson.formConfig as Partial<LeadFormConfig>)
      : {};
  return { ...DEFAULT_AUTOHALL_FORM_CONFIG, ...raw };
}

export function FormInspectorFields({ blockId, propsJson }: FormInspectorFieldsProps) {
  const { patchString, patchProps } = useBlockPropsPatch(blockId);
  const config = readFormConfig(propsJson);

  function patchFormConfig(patch: Partial<LeadFormConfig>) {
    const next = { ...config, ...patch };
    patchProps({
      formConfig: next,
      fields: buildAutoHallLeadFormFields(next),
    });
  }

  return (
    <InspectorAccordion defaultValue={['content', 'fields', 'layout', 'submit']}>
      <InspectorSection value="content" title="Contenu">
        <InspectorInput
          label="Titre du formulaire"
          value={asPropString(propsJson.title)}
          onChange={(e) => patchString('title', e.target.value)}
          placeholder="Ex : Contactez-nous"
        />
        <InspectorTextarea
          label="Texte d’aide"
          rows={2}
          value={asPropString(propsJson.subtitle)}
          onChange={(e) => patchString('subtitle', e.target.value)}
        />
        <InspectorTextarea
          label="Note confidentialité"
          rows={2}
          value={asPropString(propsJson.privacyNote)}
          onChange={(e) => patchString('privacyNote', e.target.value)}
        />
      </InspectorSection>

      <InspectorSection value="fields" title="Champs Auto Hall">
        <InspectorSelect
          label="Civilité"
          value={config.showCivility ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: 'Afficher' },
            { value: 'no', label: 'Masquer' },
          ]}
          onChange={(v) => patchFormConfig({ showCivility: v === 'yes' })}
        />
        <InspectorSelect
          label="Nom / prénom séparés"
          value={config.useSplitName ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: 'Nom + prénom' },
            { value: 'no', label: 'Nom complet' },
          ]}
          onChange={(v) => patchFormConfig({ useSplitName: v === 'yes' })}
        />
        <InspectorSelect
          label="Ville"
          value={config.showCity ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: 'Afficher (liste)' },
            { value: 'no', label: 'Masquer' },
          ]}
          onChange={(v) => patchFormConfig({ showCity: v === 'yes' })}
        />
        <InspectorSelect
          label="Modèle souhaité"
          value={config.showVehicleModel ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: 'Afficher' },
            { value: 'no', label: 'Masquer' },
          ]}
          onChange={(v) => patchFormConfig({ showVehicleModel: v === 'yes' })}
        />
        <InspectorSelect
          label="Message libre"
          value={config.showMessage ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: 'Afficher' },
            { value: 'no', label: 'Masquer' },
          ]}
          onChange={(v) => patchFormConfig({ showMessage: v === 'yes' })}
        />
        <InspectorTextarea
          label="Consentement données personnelles"
          rows={3}
          value={asPropString(propsJson.consentLabel) || DEFAULT_AUTOHALL_CONSENT_LABEL}
          onChange={(e) => patchString('consentLabel', e.target.value)}
        />
        <InspectorSelect
          label="Consentement"
          value={config.showConsent ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: 'Afficher (requis)' },
            { value: 'no', label: 'Masquer' },
          ]}
          onChange={(v) => patchFormConfig({ showConsent: v === 'yes' })}
        />
        <InspectorInput
          label="Mention champs obligatoires"
          value={asPropString(propsJson.requiredFieldsNote) || DEFAULT_AUTOHALL_REQUIRED_NOTE}
          onChange={(e) => patchString('requiredFieldsNote', e.target.value)}
        />
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
