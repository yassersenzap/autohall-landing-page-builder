import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
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
    <Card title={compact ? undefined : 'Choisir un modèle de landing'}>
      <p className="ui-page-header__subtitle" style={{ marginTop: 0 }}>
        Démarrez avec une structure professionnelle prête à personnaliser : sections hero,
        offre, confiance, formulaire et mentions légales.
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
              <p className="template-picker__count">
                {template.blocks.length} sections incluses
              </p>
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
                    ? 'Modèle sélectionné'
                    : 'Utiliser ce modèle'}
              </Button>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
