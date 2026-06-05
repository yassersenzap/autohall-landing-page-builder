import type { Config } from '@puckeditor/core';
import { HIDDEN_IMAGE_PROPS, IMAGE_STYLE_DEFAULTS } from '../fields/field-definitions';
import {
  BLOCK_SPACING_OPTIONS,
  BUTTON_SIZE_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  CONTENT_STYLE_FIELDS,
  blockWrapperStyle,
  buttonClasses,
  cardStyleClasses,
  creativeTextClasses,
} from '../fields/style-field-presets';
import { STUDIO_V2_CREATIVE_SLOT_ALLOW } from '../puck-constants';
import type { ContentAlignment } from '../types';
import { ALIGN_OPTIONS, alignClass, renderHeroMedia, renderMediaField, wrapSlotZone } from './shared';

const BUTTON_FIELDS = {
  label: { type: 'text' as const, label: 'Libellé du bouton' },
  href: { type: 'text' as const, label: 'Destination du bouton' },
  buttonStyle: { type: 'select' as const, label: 'Style bouton', options: [...BUTTON_STYLE_OPTIONS] },
  buttonSize: { type: 'select' as const, label: 'Taille bouton', options: [...BUTTON_SIZE_OPTIONS] },
  alignment: { type: 'select' as const, label: 'Alignement', options: CONTENT_STYLE_FIELDS.alignment.options },
  spacing: { type: 'select' as const, label: 'Espacement', options: [...BLOCK_SPACING_OPTIONS] },
};

export const creativeBlockComponents: Config['components'] = {
  HeadingBlock: {
    label: 'Titre',
    fields: {
      text: { type: 'text', label: 'Titre principal' },
      level: {
        type: 'select',
        label: 'Niveau',
        options: [
          { label: 'Titre page (H1)', value: 'h1' },
          { label: 'Titre section (H2)', value: 'h2' },
          { label: 'Sous-titre (H3)', value: 'h3' },
        ],
      },
      ...CONTENT_STYLE_FIELDS,
    },
    defaultProps: {
      text: 'Votre titre',
      level: 'h2',
      fontSize: 'lg',
      fontWeight: 'bold',
      alignment: 'left',
      colorPreset: 'default',
      spacing: 'normal',
    },
    render: (props) => {
      const level = props.level === 'h1' || props.level === 'h3' ? props.level : 'h2';
      const Tag = level as 'h1' | 'h2' | 'h3';
      const cls = creativeTextClasses(props as Record<string, unknown>, 'vs2-heading-block');
      return <Tag className={cls}>{String(props.text ?? '')}</Tag>;
    },
  },
  ParagraphBlock: {
    label: 'Paragraphe',
    fields: {
      text: { type: 'textarea', label: 'Texte' },
      ...CONTENT_STYLE_FIELDS,
    },
    defaultProps: {
      text: 'Ajoutez votre texte ici.',
      fontSize: 'md',
      fontWeight: 'normal',
      alignment: 'left',
      colorPreset: 'default',
      spacing: 'normal',
    },
    render: (props) => (
      <p className={creativeTextClasses(props as Record<string, unknown>, 'vs2-paragraph-block')}>
        {String(props.text ?? '')}
      </p>
    ),
  },
  ButtonBlock: {
    label: 'Bouton',
    fields: BUTTON_FIELDS,
    defaultProps: {
      label: 'En savoir plus',
      href: '#lead-form',
      buttonStyle: 'primary',
      buttonSize: 'md',
      alignment: 'left',
      spacing: 'normal',
    },
    render: (props) => {
      const cls = buttonClasses(props as Record<string, unknown>);
      return (
        <div className={cls}>
          <a className="vs2-btn-block__link" href={String(props.href ?? '#')}>
            {String(props.label ?? 'Bouton')}
          </a>
        </div>
      );
    },
  },
  BadgeBlock: {
    label: 'Badge',
    fields: {
      text: { type: 'text', label: 'Texte du badge' },
      tone: {
        type: 'select',
        label: 'Style',
        options: [
          { label: 'Marque', value: 'brand' },
          { label: 'Accent', value: 'accent' },
          { label: 'Neutre', value: 'neutral' },
          { label: 'Sombre', value: 'dark' },
        ],
      },
      alignment: CONTENT_STYLE_FIELDS.alignment,
      spacing: CONTENT_STYLE_FIELDS.spacing,
    },
    defaultProps: {
      text: 'Nouveau',
      tone: 'brand',
      alignment: 'left',
      spacing: 'normal',
    },
    render: (props) => (
      <div
        className={`vs2-badge-block vs2-badge-block--${String(props.tone ?? 'brand')} ${alignClass(props.alignment as ContentAlignment)} vs2-block-space--${String(props.spacing ?? 'normal')}`}
      >
        <span className="vs2-badge-block__pill">{String(props.text ?? '')}</span>
      </div>
    ),
  },
  DividerBlock: {
    label: 'Séparateur',
    fields: {
      style: {
        type: 'select',
        label: 'Style',
        options: [
          { label: 'Ligne fine', value: 'line' },
          { label: 'Espace', value: 'space' },
          { label: 'Pointillé', value: 'dashed' },
        ],
      },
      spacing: CONTENT_STYLE_FIELDS.spacing,
    },
    defaultProps: { style: 'line', spacing: 'normal' },
    render: (props) => (
      <hr
        className={`vs2-divider vs2-divider--${String(props.style ?? 'line')} vs2-block-space--${String(props.spacing ?? 'normal')}`}
        aria-hidden
      />
    ),
  },
  TextImageBlock: {
    label: 'Image + texte',
    fields: {
      title: { type: 'text', label: 'Titre principal' },
      text: { type: 'textarea', label: 'Texte d\'introduction' },
      layout: {
        type: 'select',
        label: 'Disposition',
        options: [
          { label: 'Image à droite', value: 'image_right' },
          { label: 'Image à gauche', value: 'image_left' },
          { label: 'Image au-dessus', value: 'stacked' },
        ],
      },
      imageAssetId: {
        type: 'custom',
        label: 'Image',
        render: ({ value, onChange }) => renderMediaField({ value, onChange }),
      },
      ...HIDDEN_IMAGE_PROPS,
      alignment: { type: 'select', label: 'Alignement texte', options: ALIGN_OPTIONS },
    },
    defaultProps: {
      title: 'Titre de section',
      text: '',
      layout: 'image_right',
      alignment: 'left',
      ...IMAGE_STYLE_DEFAULTS,
    },
    render: (props) => (
      <div className={`vs2-text-image vs2-text-image--${String(props.layout ?? 'image_right')}`}>
        <div className={`vs2-text-image__copy ${alignClass(props.alignment as ContentAlignment)}`}>
          {props.title ? <h3 className="vs2-text-image__title">{String(props.title)}</h3> : null}
          {props.text ? <p className="vs2-text-image__text">{String(props.text)}</p> : null}
        </div>
        <div className="vs2-text-image__media">
          {renderHeroMedia(props as Record<string, unknown>, 'Ajouter une image')}
        </div>
      </div>
    ),
  },
  CardBlock: {
    label: 'Carte',
    fields: {
      title: { type: 'text', label: 'Titre de la carte' },
      text: { type: 'textarea', label: 'Contenu' },
      cardRadius: {
        type: 'select',
        label: 'Coins',
        options: [
          { label: 'Aucun', value: 'none' },
          { label: 'Doux', value: 'soft' },
          { label: 'Arrondi', value: 'round' },
        ],
      },
      cardShadow: {
        type: 'select',
        label: 'Ombre',
        options: [
          { label: 'Aucune', value: 'none' },
          { label: 'Douce', value: 'soft' },
          { label: 'Forte', value: 'strong' },
        ],
      },
      alignment: CONTENT_STYLE_FIELDS.alignment,
    },
    defaultProps: {
      title: 'Titre carte',
      text: '',
      cardRadius: 'soft',
      cardShadow: 'soft',
      alignment: 'left',
    },
    render: (props) => (
      <article className={`${cardStyleClasses(props as Record<string, unknown>)} ${alignClass(props.alignment as ContentAlignment)}`}>
        {props.title ? <h3 className="vs2-card-block__title">{String(props.title)}</h3> : null}
        {props.text ? <p className="vs2-card-block__text">{String(props.text)}</p> : null}
      </article>
    ),
  },
  QuoteBlock: {
    label: 'Citation',
    fields: {
      quote: { type: 'textarea', label: 'Citation' },
      author: { type: 'text', label: 'Auteur' },
      role: { type: 'text', label: 'Fonction / source' },
      alignment: CONTENT_STYLE_FIELDS.alignment,
    },
    defaultProps: {
      quote: 'Une expérience exceptionnelle chez Auto Hall.',
      author: 'Client Auto Hall',
      role: '',
      alignment: 'center',
    },
    render: (props) => (
      <blockquote className={`vs2-quote ${alignClass(props.alignment as ContentAlignment)}`}>
        <p className="vs2-quote__text">« {String(props.quote ?? '')} »</p>
        {props.author ? (
          <footer className="vs2-quote__author">
            {String(props.author)}
            {props.role ? <span className="vs2-quote__role"> — {String(props.role)}</span> : null}
          </footer>
        ) : null}
      </blockquote>
    ),
  },
  StatsBlock: {
    label: 'Chiffres clés',
    fields: {
      items: {
        type: 'array',
        label: 'Statistiques',
        arrayFields: {
          value: { type: 'text', label: 'Valeur' },
          label: { type: 'text', label: 'Libellé' },
        },
        defaultItemProps: { value: '100+', label: 'Clients satisfaits' },
        getItemSummary: (item: { label?: string }) => item?.label || 'Stat',
      },
      tone: {
        type: 'select',
        label: 'Style de fond',
        options: [
          { label: 'Clair', value: 'light' },
          { label: 'Marque', value: 'brand' },
          { label: 'Sombre', value: 'dark' },
        ],
      },
    },
    defaultProps: {
      tone: 'brand',
      items: [
        { value: '24 h', label: 'Réponse conseiller' },
        { value: '50+', label: 'Modèles disponibles' },
        { value: '15', label: 'Villes couvertes' },
      ],
    },
    render: (props) => {
      const items = Array.isArray(props.items) ? props.items : [];
      return (
        <div className={`vs2-stats vs2-stats--${String(props.tone ?? 'brand')}`}>
          <div className="vs2-stats__grid">
            {items.map((item, i) => {
              const s = item as Record<string, unknown>;
              return (
                <div key={String(s.label ?? i)} className="vs2-stats__item">
                  <span className="vs2-stats__value">{String(s.value ?? '')}</span>
                  <span className="vs2-stats__label">{String(s.label ?? '')}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  },
  TestimonialsBlock: {
    label: 'Témoignages',
    fields: {
      title: { type: 'text', label: 'Titre de la section' },
      items: {
        type: 'array',
        label: 'Témoignages',
        arrayFields: {
          quote: { type: 'textarea', label: 'Citation' },
          author: { type: 'text', label: 'Auteur' },
          rating: {
            type: 'select',
            label: 'Note',
            options: [
              { label: '5 étoiles', value: '5' },
              { label: '4 étoiles', value: '4' },
            ],
          },
        },
        defaultItemProps: { quote: '', author: '', rating: '5' },
        getItemSummary: (item: { author?: string }) => item?.author || 'Témoignage',
      },
    },
    defaultProps: {
      title: 'Ils nous font confiance',
      items: [
        {
          quote: 'Service rapide et équipe à l\'écoute.',
          author: 'Karim B.',
          rating: '5',
        },
      ],
    },
    render: (props) => {
      const items = Array.isArray(props.items) ? props.items : [];
      return (
        <section className="vs2-testimonials">
          {props.title ? <h2 className="vs2-testimonials__title">{String(props.title)}</h2> : null}
          <div className="vs2-testimonials__grid">
            {items.map((item, i) => {
              const t = item as Record<string, unknown>;
              return (
                <article key={String(t.author ?? i)} className="vs2-testimonials__card">
                  <p className="vs2-testimonials__quote">{String(t.quote ?? '')}</p>
                  <footer className="vs2-testimonials__author">{String(t.author ?? '')}</footer>
                </article>
              );
            })}
          </div>
        </section>
      );
    },
  },
  EventScheduleBlock: {
    label: 'Programme événement',
    fields: {
      title: { type: 'text', label: 'Titre de la section' },
      subtitle: { type: 'textarea', label: 'Introduction' },
      events: {
        type: 'array',
        label: 'Créneaux',
        arrayFields: {
          time: { type: 'text', label: 'Horaire' },
          title: { type: 'text', label: 'Activité' },
          description: { type: 'textarea', label: 'Description' },
        },
        defaultItemProps: { time: '10:00', title: 'Accueil', description: '' },
        getItemSummary: (item: { title?: string }) => item?.title || 'Créneau',
      },
    },
    defaultProps: {
      title: 'Programme de la journée',
      subtitle: '',
      events: [
        { time: '10:00', title: 'Ouverture', description: 'Accueil des visiteurs.' },
        { time: '14:00', title: 'Essais', description: 'Essais sur piste.' },
      ],
    },
    render: (props) => {
      const events = Array.isArray(props.events) ? props.events : [];
      return (
        <section className="vs2-event-schedule">
          {props.title ? <h2 className="vs2-event-schedule__title">{String(props.title)}</h2> : null}
          {props.subtitle ? <p className="vs2-event-schedule__subtitle">{String(props.subtitle)}</p> : null}
          <ol className="vs2-event-schedule__list">
            {events.map((ev, i) => {
              const e = ev as Record<string, unknown>;
              return (
                <li key={String(e.title ?? i)} className="vs2-event-schedule__item">
                  <time className="vs2-event-schedule__time">{String(e.time ?? '')}</time>
                  <div>
                    <p className="vs2-event-schedule__event-title">{String(e.title ?? '')}</p>
                    {e.description ? (
                      <p className="vs2-event-schedule__desc">{String(e.description)}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      );
    },
  },
  FinancingHighlightBlock: {
    label: 'Offre financement',
    fields: {
      title: { type: 'text', label: 'Titre principal' },
      subtitle: { type: 'textarea', label: 'Texte d\'introduction' },
      rateText: { type: 'text', label: 'Taux / mensualité' },
      conditions: {
        type: 'array',
        label: 'Conditions',
        arrayFields: { text: { type: 'text', label: 'Condition' } },
        defaultItemProps: { text: 'Sous réserve d\'acceptation du dossier' },
        getItemSummary: (item: { text?: string }) => item?.text || 'Condition',
      },
      ctaLabel: { type: 'text', label: 'Libellé du bouton' },
      ctaHref: { type: 'text', label: 'Destination du bouton' },
    },
    defaultProps: {
      title: 'Financez votre véhicule',
      subtitle: 'LOA, crédit classique ou facilités — simulez votre mensualité.',
      rateText: 'À partir de 2 990 DH / mois',
      conditions: [{ text: 'Apport possible' }, { text: 'Assurance tous risques recommandée' }],
      ctaLabel: 'Demander une simulation',
      ctaHref: '#lead-form',
    },
    render: (props) => {
      const conditions = Array.isArray(props.conditions) ? props.conditions : [];
      return (
        <section className="vs2-financing">
          {props.title ? <h2 className="vs2-financing__title">{String(props.title)}</h2> : null}
          {props.subtitle ? <p className="vs2-financing__subtitle">{String(props.subtitle)}</p> : null}
          {props.rateText ? <p className="vs2-financing__rate">{String(props.rateText)}</p> : null}
          <ul className="vs2-financing__conditions">
            {conditions.map((c, i) => {
              const row = c as Record<string, unknown>;
              return <li key={i}>{String(row.text ?? '')}</li>;
            })}
          </ul>
          {props.ctaLabel ? (
            <a className="vs2-financing__cta" href={String(props.ctaHref ?? '#lead-form')}>
              {String(props.ctaLabel)}
            </a>
          ) : null}
        </section>
      );
    },
  },
  StackBlock: {
    label: 'Empilement',
    fields: {
      alignment: { type: 'select', label: 'Alignement', options: ALIGN_OPTIONS },
      maxWidth: {
        type: 'select',
        label: 'Largeur contenu',
        options: [
          { label: 'Étroit', value: 'narrow' },
          { label: 'Standard', value: 'standard' },
          { label: 'Large', value: 'wide' },
          { label: 'Pleine largeur', value: 'full' },
        ],
      },
      gap: {
        type: 'select',
        label: 'Espacement',
        options: [
          { label: 'Compact', value: 'compact' },
          { label: 'Normal', value: 'normal' },
          { label: 'Large', value: 'large' },
        ],
      },
      items: {
        type: 'slot',
        label: 'Blocs',
        allow: [...STUDIO_V2_CREATIVE_SLOT_ALLOW],
      },
    },
    defaultProps: {
      alignment: 'left',
      maxWidth: 'standard',
      gap: 'normal',
    },
    render: ({ alignment, maxWidth, gap, items: Items }) => (
      <div
        className={`vs2-stack vs2-stack--gap-${String(gap ?? 'normal')} ${alignClass(alignment as ContentAlignment)}`}
        style={blockWrapperStyle(String(maxWidth ?? 'standard'))}
      >
        {wrapSlotZone(Items, STUDIO_V2_CREATIVE_SLOT_ALLOW, '64px')}
      </div>
    ),
  },
};

export const CREATIVE_BLOCK_TYPES = Object.keys(creativeBlockComponents);
