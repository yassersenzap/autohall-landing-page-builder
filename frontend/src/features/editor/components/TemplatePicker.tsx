import { Button } from '../../../components/ui/Button';
import {
  LANDING_TEMPLATES,
  type LandingTemplateId,
} from '../../landing/landing-templates';

type TemplatePickerProps = {
  disabled?: boolean;
  applying?: boolean;
  selectedId?: LandingTemplateId | null;
  onSelect: (templateId: LandingTemplateId) => void;
  compact?: boolean;
};

export function TemplatePicker({
  disabled = false,
  applying = false,
  selectedId = null,
  onSelect,
  compact = false,
}: TemplatePickerProps) {
  return (
    <section className="editor-panel-surface editor-template-picker">
      <header className="editor-panel-surface__header">
        <h2 className="editor-panel-surface__title">
          {compact ? 'Modèles' : 'Modèles de campagne'}
        </h2>
      </header>
      <div className="editor-panel-surface__body">
        <p className="editor-template-picker__hint">
          {compact
            ? 'Structure complète : essai, offre, SAV ou lancement.'
            : 'Démarrez avec un parcours marketing prêt à personnaliser.'}
        </p>
        <div className="template-picker__grid">
          {LANDING_TEMPLATES.map((template) => {
            const isSelected = selectedId === template.id;
            return (
              <article
                key={template.id}
                className={[
                  'template-picker__card',
                  isSelected ? 'template-picker__card--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <h3 className="template-picker__title">{template.name}</h3>
                <p className="template-picker__desc">{template.description}</p>
                <p className="template-picker__meta">{template.audience}</p>
                <p className="template-picker__count">{template.blocks.length} sections</p>
                <Button
                  type="button"
                  size="sm"
                  variant={isSelected ? 'primary' : 'secondary'}
                  disabled={disabled || applying}
                  onClick={() => onSelect(template.id)}
                >
                  {applying && isSelected
                    ? 'Application…'
                    : isSelected
                      ? 'Sélectionné'
                      : 'Utiliser'}
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
