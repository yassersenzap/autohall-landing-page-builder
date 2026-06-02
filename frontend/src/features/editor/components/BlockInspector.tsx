import { useMemo, useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { EditorPageBlock } from '../types/editor.types';

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

  if (advanced) {
    return (
      <div className="editor-inspector">
        <label className="ui-field">
          <span className="ui-field__label">Mode avancé JSON</span>
          <textarea
            className="ui-input editor-advanced-json"
            rows={14}
            value={JSON.stringify(props, null, 2)}
            disabled={disabled}
            onChange={(event) => {
              try {
                const parsed = JSON.parse(event.target.value) as Record<string, unknown>;
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                  onChangeProps(parsed);
                }
              } catch {
                // conserve la saisie sans crasher; validation implicite à la prochaine modification valide
              }
            }}
          />
        </label>
        <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => setAdvanced(false)}>
          Mode guidé
        </button>
      </div>
    );
  }

  const type = block.blockType.toLowerCase();

  return (
    <div className="editor-inspector">
      {type === 'hero' ? (
        <>
          <Input label="Eyebrow" value={asString(props.eyebrow)} disabled={disabled} onChange={(e) => handleField('eyebrow', e.target.value)} />
          <Input label="Titre" value={asString(props.title)} disabled={disabled} onChange={(e) => handleField('title', e.target.value)} />
          <Input label="Sous-titre" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <Input label="Texte bouton" value={asString(props.buttonText)} disabled={disabled} onChange={(e) => handleField('buttonText', e.target.value)} />
          <Input label="Target bouton" value={asString(props.buttonTarget)} disabled={disabled} onChange={(e) => handleField('buttonTarget', e.target.value)} />
        </>
      ) : null}

      {type === 'text' ? (
        <>
          <Input label="Titre section" value={asString(props.heading)} disabled={disabled} onChange={(e) => handleField('heading', e.target.value)} />
          <label className="ui-field">
            <span className="ui-field__label">Contenu</span>
            <textarea
              className="ui-input editor-textarea"
              rows={8}
              value={asString(props.content)}
              disabled={disabled}
              onChange={(e) => handleField('content', e.target.value)}
            />
          </label>
        </>
      ) : null}

      {type === 'image' ? (
        <>
          <Input label="URL image" value={asString(props.imageUrl ?? props.src)} disabled={disabled} onChange={(e) => handleField('imageUrl', e.target.value)} />
          <Input label="Texte alternatif" value={asString(props.alt)} disabled={disabled} onChange={(e) => handleField('alt', e.target.value)} />
          <Input label="Légende" value={asString(props.caption)} disabled={disabled} onChange={(e) => handleField('caption', e.target.value)} />
        </>
      ) : null}

      {type === 'button' ? (
        <>
          <Input label="Label CTA" value={asString(props.label ?? props.text)} disabled={disabled} onChange={(e) => handleField('label', e.target.value)} />
          <Input label="Lien cible" value={asString(props.target ?? props.href)} disabled={disabled} onChange={(e) => handleField('target', e.target.value)} />
          <Input label="Description" value={asString(props.description)} disabled={disabled} onChange={(e) => handleField('description', e.target.value)} />
        </>
      ) : null}

      {type === 'lead_form' ? (
        <>
          <Input label="Titre formulaire" value={asString(props.title)} disabled={disabled} onChange={(e) => handleField('title', e.target.value)} />
          <Input label="Sous-titre formulaire" value={asString(props.subtitle)} disabled={disabled} onChange={(e) => handleField('subtitle', e.target.value)} />
          <Input label="Texte bouton submit" value={asString(props.submitText)} disabled={disabled} onChange={(e) => handleField('submitText', e.target.value)} />
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

      <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => setAdvanced((x) => !x)}>
        {advanced ? 'Mode guidé' : 'Mode avancé JSON'}
      </button>
    </div>
  );
}
