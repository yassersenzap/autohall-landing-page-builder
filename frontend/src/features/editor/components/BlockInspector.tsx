import { useMemo, useState } from 'react';
import { Code2 } from 'lucide-react';
import { ShadButton, ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { Select } from '../../../components/ui/Select';
import type { EditorPageBlock } from '../types/editor.types';
import { InspectorFieldGroup } from './InspectorFieldGroup';
import { ListFieldEditor } from './ListFieldEditor';

type BlockInspectorProps = {
  block: EditorPageBlock;
  disabled?: boolean;
  onChangeProps: (nextProps: Record<string, unknown>) => void;
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function update(next: Record<string, unknown>, key: string, value: string) {
  return { ...next, [key]: value };
}

function asObjectList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item),
  );
}

export function BlockInspector({ block, disabled, onChangeProps }: BlockInspectorProps) {
  const [advanced, setAdvanced] = useState(false);

  const props = useMemo(
    () =>
      block.propsJson && typeof block.propsJson === 'object'
        ? { ...block.propsJson }
        : {},
    [block.propsJson],
  );

  function handleField(key: string, value: string) {
    onChangeProps(update(props, key, value));
  }

  function handleList(key: string, items: Record<string, unknown>[]) {
    onChangeProps({ ...props, [key]: items });
  }

  function handleBullets(value: string) {
    const bullets = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    onChangeProps({ ...props, bullets });
  }

  if (advanced) {
    return (
      <div className="space-y-4">
        <ShadTextarea
          label="Mode avancé JSON"
          rows={14}
          className="font-mono text-xs"
          value={JSON.stringify(props, null, 2)}
          disabled={disabled}
          onChange={(event) => {
            try {
              const parsed = JSON.parse(event.target.value) as Record<string, unknown>;
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                onChangeProps(parsed);
              }
            } catch {
              // ignore invalid JSON while typing
            }
          }}
        />
        <ShadButton type="button" variant="ghost" size="sm" className="w-full" onClick={() => setAdvanced(false)}>
          Retour au mode guidé
        </ShadButton>
      </div>
    );
  }

  const type = block.blockType.toLowerCase();

  return (
    <div className="space-y-4 pb-6">
      {type === 'hero' ? (
        <>
          <InspectorFieldGroup title="Contenu" showSeparator={false}>
            <ShadInput label="Accroche" value={asString(props.eyebrow)} disabled={disabled} onChange={(e) => handleField('eyebrow', e.target.value)} />
            <ShadInput label="Titre" value={asString(props.title)} disabled={disabled} onChange={(e) => handleField('title', e.target.value)} />
            <ShadInput label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
            <ShadInput label="URL image véhicule" value={asString(props.imageUrl)} disabled={disabled} onChange={(e) => handleField('imageUrl', e.target.value)} />
          </InspectorFieldGroup>
          <InspectorFieldGroup title="Actions">
            <ShadInput label="Texte bouton principal" value={asString(props.buttonText)} disabled={disabled} onChange={(e) => handleField('buttonText', e.target.value)} />
            <ShadInput label="Lien bouton principal" value={asString(props.buttonTarget)} disabled={disabled} onChange={(e) => handleField('buttonTarget', e.target.value)} />
            <ShadInput label="Texte bouton secondaire" value={asString(props.secondaryButtonText)} disabled={disabled} onChange={(e) => handleField('secondaryButtonText', e.target.value)} />
            <ShadInput label="Lien bouton secondaire" value={asString(props.secondaryButtonTarget)} disabled={disabled} onChange={(e) => handleField('secondaryButtonTarget', e.target.value)} />
          </InspectorFieldGroup>
        </>
      ) : null}

      {type === 'trust_bar' ? (
        <ListFieldEditor
          label="Indicateurs de confiance"
          columns={[
            { key: 'value', label: 'Valeur', placeholder: '4.8/5' },
            { key: 'label', label: 'Libellé', placeholder: 'Satisfaction clients' },
          ]}
          items={asObjectList(props.metrics)}
          disabled={disabled}
          maxItems={4}
          onChange={(items) => handleList('metrics', items)}
        />
      ) : null}

      {type === 'text' ? (
        <>
          <ShadInput label="Titre section" value={asString(props.heading)} disabled={disabled} onChange={(e) => handleField('heading', e.target.value)} />
          <ShadTextarea
            label="Contenu"
            rows={8}
            value={asString(props.content)}
            disabled={disabled}
            onChange={(e) => handleField('content', e.target.value)}
          />
        </>
      ) : null}

      {type === 'image' ? (
        <>
          <ShadInput label="URL image" value={asString(props.imageUrl ?? props.src)} disabled={disabled} onChange={(e) => handleField('imageUrl', e.target.value)} />
          <ShadInput label="Texte alternatif" value={asString(props.alt)} disabled={disabled} onChange={(e) => handleField('alt', e.target.value)} />
          <ShadInput label="Légende" value={asString(props.caption)} disabled={disabled} onChange={(e) => handleField('caption', e.target.value)} />
        </>
      ) : null}

      {type === 'button' ? (
        <>
          <ShadInput label="Label CTA" value={asString(props.label ?? props.text)} disabled={disabled} onChange={(e) => handleField('label', e.target.value)} />
          <ShadInput label="Lien cible" value={asString(props.target ?? props.href)} disabled={disabled} onChange={(e) => handleField('target', e.target.value)} />
          <ShadInput label="Description" value={asString(props.description)} disabled={disabled} onChange={(e) => handleField('description', e.target.value)} />
        </>
      ) : null}

      {type === 'benefits' || type === 'after_sales' ? (
        <>
          <ShadInput label="Titre de section" value={asString(props.heading)} disabled={disabled} onChange={(e) => handleField('heading', e.target.value)} />
          <ShadInput label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <ListFieldEditor
            label="Éléments"
            columns={[
              { key: 'title', label: 'Titre' },
              { key: 'description', label: 'Description' },
            ]}
            items={asObjectList(props.items)}
            disabled={disabled}
            maxItems={6}
            onChange={(items) => handleList('items', items)}
          />
        </>
      ) : null}

      {type === 'offer_highlights' ? (
        <>
          <ShadInput label="Titre de section" value={asString(props.heading)} disabled={disabled} onChange={(e) => handleField('heading', e.target.value)} />
          <ShadInput label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <ListFieldEditor
            label="Points forts"
            columns={[
              { key: 'title', label: 'Titre' },
              { key: 'description', label: 'Description' },
            ]}
            items={asObjectList(props.highlights).length ? asObjectList(props.highlights) : asObjectList(props.items)}
            disabled={disabled}
            maxItems={6}
            onChange={(items) => handleList('highlights', items)}
          />
        </>
      ) : null}

      {type === 'features' ? (
        <>
          <ShadInput label="Titre de section" value={asString(props.heading)} disabled={disabled} onChange={(e) => handleField('heading', e.target.value)} />
          <ShadInput label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <ShadInput label="Nom du modèle" value={asString(props.modelName)} disabled={disabled} onChange={(e) => handleField('modelName', e.target.value)} />
          <ShadInput label="Accroche modèle" value={asString(props.modelTagline)} disabled={disabled} onChange={(e) => handleField('modelTagline', e.target.value)} />
          <ShadInput label="URL visuel modèle" value={asString(props.imageUrl)} disabled={disabled} onChange={(e) => handleField('imageUrl', e.target.value)} />
          <ListFieldEditor
            label="Caractéristiques"
            columns={[
              { key: 'title', label: 'Titre' },
              { key: 'description', label: 'Description' },
            ]}
            items={asObjectList(props.items)}
            disabled={disabled}
            maxItems={6}
            onChange={(items) => handleList('items', items)}
          />
        </>
      ) : null}

      {type === 'financing' ? (
        <>
          <ShadInput label="Titre" value={asString(props.heading)} disabled={disabled} onChange={(e) => handleField('heading', e.target.value)} />
          <ShadInput label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <ShadInput label="Exemple mensualité" value={asString(props.paymentExample)} disabled={disabled} onChange={(e) => handleField('paymentExample', e.target.value)} />
          <ShadTextarea
            label="Points clés (un par ligne)"
            rows={4}
            value={(Array.isArray(props.bullets) ? props.bullets : []).map(String).join('\n')}
            disabled={disabled}
            onChange={(e) => handleBullets(e.target.value)}
          />
          <ShadInput label="Texte bouton" value={asString(props.ctaLabel)} disabled={disabled} onChange={(e) => handleField('ctaLabel', e.target.value)} />
          <ShadInput label="Lien bouton" value={asString(props.ctaTarget)} disabled={disabled} onChange={(e) => handleField('ctaTarget', e.target.value)} />
        </>
      ) : null}

      {type === 'testimonials' ? (
        <>
          <ShadInput label="Titre de section" value={asString(props.heading)} disabled={disabled} onChange={(e) => handleField('heading', e.target.value)} />
          <ShadInput label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <p className="text-xs text-muted-foreground">Les témoignages détaillés se modifient en mode JSON avancé.</p>
        </>
      ) : null}

      {type === 'faq' ? (
        <>
          <ShadInput label="Titre de section" value={asString(props.heading)} disabled={disabled} onChange={(e) => handleField('heading', e.target.value)} />
          <ShadInput label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <ListFieldEditor
            label="Questions / réponses"
            columns={[
              { key: 'question', label: 'Question' },
              { key: 'answer', label: 'Réponse' },
            ]}
            items={asObjectList(props.items)}
            disabled={disabled}
            maxItems={8}
            onChange={(items) => handleList('items', items)}
          />
        </>
      ) : null}

      {type === 'final_cta' ? (
        <>
          <ShadInput label="Titre" value={asString(props.title)} disabled={disabled} onChange={(e) => handleField('title', e.target.value)} />
          <ShadInput label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <ShadInput label="Texte bouton" value={asString(props.buttonText)} disabled={disabled} onChange={(e) => handleField('buttonText', e.target.value)} />
          <ShadInput label="Lien bouton" value={asString(props.buttonTarget)} disabled={disabled} onChange={(e) => handleField('buttonTarget', e.target.value)} />
        </>
      ) : null}

      {type === 'footer_legal' ? (
        <ShadTextarea
          label="Texte légal"
          rows={4}
          value={asString(props.legalText)}
          disabled={disabled}
          onChange={(e) => handleField('legalText', e.target.value)}
        />
      ) : null}

      {type === 'lead_form' ? (
        <>
          <ShadInput label="Titre formulaire" value={asString(props.title)} disabled={disabled} onChange={(e) => handleField('title', e.target.value)} />
          <ShadInput label="Sous-titre formulaire" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <ShadInput label="Texte bouton submit" value={asString(props.submitText)} disabled={disabled} onChange={(e) => handleField('submitText', e.target.value)} />
          <ShadInput label="Note confidentialité" value={asString(props.privacyNote)} disabled={disabled} onChange={(e) => handleField('privacyNote', e.target.value)} />
          <ShadTextarea
            label="Réassurance (un point par ligne)"
            rows={3}
            value={(Array.isArray(props.reassurance) ? props.reassurance : []).map(String).join('\n')}
            disabled={disabled}
            onChange={(e) => {
              const reassurance = e.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);
              onChangeProps({ ...props, reassurance });
            }}
          />
          <Select
            label="Type champ principal"
            value={asString(
              Array.isArray(props.fields) && props.fields[0] && typeof props.fields[0] === 'object'
                ? (props.fields[0] as Record<string, unknown>).type
                : 'text',
            )}
            disabled={disabled}
            onChange={(e) => {
              const fields = Array.isArray(props.fields) ? [...props.fields] : [];
              if (fields[0] && typeof fields[0] === 'object') {
                fields[0] = { ...(fields[0] as Record<string, unknown>), type: e.target.value };
                onChangeProps({ ...props, fields });
              }
            }}
          >
            <option value="text">text</option>
            <option value="tel">tel</option>
            <option value="email">email</option>
          </Select>
        </>
      ) : null}

      <ShadButton
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 w-full text-muted-foreground"
        onClick={() => setAdvanced(true)}
      >
        <Code2 className="h-3.5 w-3.5" />
        JSON avancé
      </ShadButton>
    </div>
  );
}
