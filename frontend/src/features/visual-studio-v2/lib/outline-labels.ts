const TYPE_LABELS: Record<string, string> = {
  Section: 'Section',
  Container: 'Conteneur',
  Columns: 'Colonnes',
  Spacer: 'Espacement',
  StackBlock: 'Empilement',
  HeroAutoHall: 'Hero',
  LeadFormAutoHall: 'Formulaire',
  Benefits: 'Avantages',
  StepsBlock: 'Étapes',
  VehicleOffer: 'Offre véhicule',
  VehicleRange: 'Gamme',
  MediaImage: 'Image',
  TextImageBlock: 'Image + texte',
  HeadingBlock: 'Titre',
  ParagraphBlock: 'Paragraphe',
  ButtonBlock: 'Bouton',
  BadgeBlock: 'Badge',
  CardBlock: 'Carte',
  QuoteBlock: 'Citation',
  StatsBlock: 'Chiffres',
  TestimonialsBlock: 'Témoignages',
  EventScheduleBlock: 'Programme',
  FinancingHighlightBlock: 'Financement',
  DividerBlock: 'Séparateur',
  CTASection: 'CTA',
  FAQ: 'FAQ',
  FooterLegal: 'Pied de page',
};

function truncate(text: string, max = 42): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function resolveOutlineLabel(
  type: string,
  props: Record<string, unknown>,
): string {
  const prefix = TYPE_LABELS[type] ?? type;

  const title =
    (typeof props.text === 'string' && props.text.trim()) ||
    (typeof props.title === 'string' && props.title.trim()) ||
    (typeof props.modelName === 'string' && props.modelName.trim()) ||
    (typeof props.eyebrow === 'string' && props.eyebrow.trim()) ||
    (typeof props.caption === 'string' && props.caption.trim()) ||
    (typeof props.label === 'string' && props.label.trim()) ||
    '';

  if (title) return `${prefix} — ${truncate(title)}`;

  if (type === 'Benefits' && Array.isArray(props.items)) {
    const count = props.items.length;
    return `${prefix} — ${count} carte${count > 1 ? 's' : ''}`;
  }

  if (type === 'StepsBlock' && Array.isArray(props.steps)) {
    const count = props.steps.length;
    return `${prefix} — ${count} étape${count > 1 ? 's' : ''}`;
  }

  if (type === 'VehicleRange' && Array.isArray(props.vehicles)) {
    const count = props.vehicles.length;
    return `${prefix} — ${count} véhicule${count > 1 ? 's' : ''}`;
  }

  if (type === 'LeadFormAutoHall' && props.formPurpose === 'appointment') {
    return `${prefix} — Rendez-vous`;
  }

  if (type === 'Section' && typeof props.backgroundTone === 'string') {
    return `${prefix} (${props.backgroundTone})`;
  }

  return prefix;
}
