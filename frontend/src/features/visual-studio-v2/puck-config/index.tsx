import type { ReactNode } from 'react';
import type { Config } from '@puckeditor/core';
import { THEME_PRESET_OPTIONS } from '../design-tokens/presets';
import { buildTokenStyleVars, resolveDesignTokens } from '../design-tokens/presets';
import {
  STUDIO_V2_COLUMN_SLOT_ALLOW,
  STUDIO_V2_CONTAINER_SLOT_ALLOW,
  STUDIO_V2_CONVERSION_COMPONENTS,
  STUDIO_V2_CREATIVE_ATOMIC,
  STUDIO_V2_CREATIVE_COMPOUND,
  STUDIO_V2_LAYOUT_COMPONENTS,
  STUDIO_V2_MARKETING_COMPONENTS,
  STUDIO_V2_MEDIA_COMPONENTS,
  STUDIO_V2_SECTION_SLOT_ALLOW,
} from '../puck-constants';
import { creativeBlockComponents } from './creative-blocks';
import { SectionEditorChrome } from '../components/SectionEditorChrome';
import { ctaClassName, ctaInlineStyle, heroSubtitleStyle, heroTitleStyle } from '../lib/typography-classes';
import type {
  BackgroundTone,
  ColumnGap,
  ContainerMaxWidth,
  ContentAlignment,
  HeroLayout,
  HeroTone,
  SpacingPreset,
} from '../types';
import {
  ALIGN_OPTIONS,
  BENEFIT_ICON_OPTIONS,
  COLUMN_RATIO_OPTIONS,
  HERO_LAYOUT_OPTIONS,
  MAX_WIDTH_OPTIONS,
  SPACING_OPTIONS,
  TONE_OPTIONS,
  alignClass,
  columnGapClass,
  maxWidthClass,
  padClass,
  renderBenefitIcon,
  renderHeroMedia,
  renderLeadFormFields,
  renderMediaField,
  renderOfferMedia,
  toneClass,
  wrapSlotZone,
} from './shared';
import { HIDDEN_IMAGE_PROPS, IMAGE_STYLE_DEFAULTS } from '../fields/field-definitions';

const DESIGN_TOKEN_FIELDS = {
  primaryColor: { type: 'text' as const, label: 'Couleur primaire' },
  secondaryColor: { type: 'text' as const, label: 'Couleur secondaire' },
  accentColor: { type: 'text' as const, label: 'Couleur accent' },
  backgroundColor: { type: 'text' as const, label: 'Fond page' },
  textColor: { type: 'text' as const, label: 'Texte' },
  headingColor: { type: 'text' as const, label: 'Titres' },
  fontFamily: { type: 'text' as const, label: 'Police' },
  headingScale: {
    type: 'select' as const,
    label: 'Échelle titres',
    options: [
      { label: 'Compact', value: 'compact' },
      { label: 'Normal', value: 'normal' },
      { label: 'Large', value: 'large' },
    ],
  },
  sectionSpacing: {
    type: 'select' as const,
    label: 'Espacement sections',
    options: SPACING_OPTIONS,
  },
  buttonRadius: {
    type: 'select' as const,
    label: 'Rayon boutons',
    options: [
      { label: 'Carré', value: 'square' },
      { label: 'Arrondi', value: 'rounded' },
      { label: 'Pilule', value: 'pill' },
    ],
  },
  buttonStyle: {
    type: 'select' as const,
    label: 'Style boutons',
    options: [
      { label: 'Plein', value: 'solid' },
      { label: 'Contour', value: 'outline' },
    ],
  },
  pageMaxWidth: {
    type: 'select' as const,
    label: 'Largeur page',
    options: [
      { label: 'Étroit', value: 'narrow' },
      { label: 'Standard', value: 'standard' },
      { label: 'Large', value: 'wide' },
      { label: 'Pleine largeur', value: 'full' },
    ],
  },
  cardRadius: {
    type: 'select' as const,
    label: 'Rayon cartes',
    options: [
      { label: 'Aucun', value: 'none' },
      { label: 'Doux', value: 'soft' },
      { label: 'Arrondi', value: 'round' },
    ],
  },
  shadowStyle: {
    type: 'select' as const,
    label: 'Ombres',
    options: [
      { label: 'Aucune', value: 'none' },
      { label: 'Douce', value: 'soft' },
      { label: 'Élevée', value: 'elevated' },
    ],
  },
};

export const studioV2PuckConfig: Config = {
  root: {
    fields: {
      title: { type: 'text', label: 'Titre page' },
      themePreset: {
        type: 'select',
        label: 'Thème',
        options: THEME_PRESET_OPTIONS,
      },
      designTokens: {
        type: 'object',
        label: 'Tokens design (surcharge)',
        objectFields: DESIGN_TOKEN_FIELDS,
      },
      seo: {
        type: 'object',
        label: 'SEO',
        objectFields: {
          title: { type: 'text', label: 'Meta title' },
          description: { type: 'textarea', label: 'Meta description' },
        },
      },
    },
    defaultProps: {
      title: 'Auto Hall — Offre printemps',
      themePreset: 'autohall-blue',
      designTokens: {},
      seo: { title: '', description: '' },
    },
    render: ({
      title: _title,
      themePreset,
      designTokens,
      children,
    }: {
      title?: string;
      themePreset?: string;
      designTokens?: Record<string, unknown>;
      children: ReactNode;
    }) => {
      const tokens = resolveDesignTokens({ themePreset, designTokens });
      const style = buildTokenStyleVars(tokens);
      return (
        <div className="vs2-page-canvas" style={style}>
          {children}
        </div>
      );
    },
  },
  categories: {
    layout: {
      title: 'Mise en page',
      components: [...STUDIO_V2_LAYOUT_COMPONENTS],
    },
    marketing: {
      title: 'Sections marketing',
      components: [...STUDIO_V2_MARKETING_COMPONENTS],
    },
    conversion: {
      title: 'Conversion',
      components: [...STUDIO_V2_CONVERSION_COMPONENTS],
    },
    media: {
      title: 'Média',
      components: [...STUDIO_V2_MEDIA_COMPONENTS],
    },
    creative: {
      title: 'Blocs créatifs',
      components: [...STUDIO_V2_CREATIVE_ATOMIC, ...STUDIO_V2_CREATIVE_COMPOUND],
    },
  },
  components: {
    Section: {
      label: 'Section',
      fields: {
        backgroundTone: {
          type: 'select',
          label: 'Couleur de fond',
          options: TONE_OPTIONS,
        },
        spacingPreset: {
          type: 'select',
          label: 'Espacement vertical',
          options: SPACING_OPTIONS,
        },
        fullHeight: {
          type: 'radio',
          label: 'Hauteur pleine',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        anchorId: { type: 'text', label: 'Ancre (id)' },
        items: {
          type: 'slot',
          label: 'Contenu',
          allow: [...STUDIO_V2_SECTION_SLOT_ALLOW],
        },
      },
      defaultProps: {
        backgroundTone: 'light',
        spacingPreset: 'normal',
        fullHeight: false,
        anchorId: '',
      },
      render: ({ backgroundTone, spacingPreset, fullHeight, anchorId, items: Items, id }) => (
        <SectionEditorChrome sectionId={typeof id === 'string' ? id : undefined}>
          <section
            id={anchorId || undefined}
            className={`vs2-section ${toneClass(backgroundTone as BackgroundTone)} ${padClass(spacingPreset as SpacingPreset)}${fullHeight ? ' vs2-section--full' : ''}`}
          >
            <div className="vs2-section__inner">
              {wrapSlotZone(Items, STUDIO_V2_SECTION_SLOT_ALLOW, '128px')}
            </div>
          </section>
        </SectionEditorChrome>
      ),
    },
    Container: {
      label: 'Conteneur',
      fields: {
        maxWidth: {
          type: 'select',
          label: 'Largeur du contenu',
          options: MAX_WIDTH_OPTIONS,
        },
        alignment: {
          type: 'select',
          label: 'Alignement',
          options: ALIGN_OPTIONS,
        },
        items: {
          type: 'slot',
          label: 'Contenu',
          allow: [...STUDIO_V2_CONTAINER_SLOT_ALLOW],
        },
      },
      defaultProps: {
        maxWidth: 'default',
        alignment: 'left',
      },
      render: ({ maxWidth, alignment, items: Items }) => (
        <div
          className={`vs2-container ${maxWidthClass(maxWidth as ContainerMaxWidth)} ${alignClass(alignment as ContentAlignment)}`}
        >
          {wrapSlotZone(Items, STUDIO_V2_CONTAINER_SLOT_ALLOW, '96px')}
        </div>
      ),
    },
    Columns: {
      label: 'Colonnes',
      fields: {
        columnRatio: {
          type: 'select',
          label: 'Ratio colonnes',
          options: COLUMN_RATIO_OPTIONS,
        },
        columnGap: {
          type: 'select',
          label: 'Espacement',
          options: SPACING_OPTIONS.filter((o) => o.value !== 'hero'),
        },
        stackOnMobile: {
          type: 'radio',
          label: 'Empiler sur mobile',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        verticalAlign: {
          type: 'select',
          label: 'Alignement vertical',
          options: [
            { label: 'Haut', value: 'top' },
            { label: 'Centre', value: 'center' },
            { label: 'Bas', value: 'bottom' },
          ],
        },
        alignment: {
          type: 'select',
          label: 'Alignement',
          options: ALIGN_OPTIONS,
        },
        left: {
          type: 'slot',
          label: 'Colonne gauche',
          allow: [...STUDIO_V2_COLUMN_SLOT_ALLOW],
        },
        right: {
          type: 'slot',
          label: 'Colonne droite',
          allow: [...STUDIO_V2_COLUMN_SLOT_ALLOW],
        },
      },
      defaultProps: {
        columnRatio: '50-50',
        columnGap: 'normal',
        stackOnMobile: true,
        verticalAlign: 'top',
        alignment: 'left',
      },
      render: ({
        columnRatio,
        columnGap,
        stackOnMobile,
        verticalAlign,
        alignment,
        left: Left,
        right: Right,
      }) => (
        <div
          className={`vs2-columns vs2-ratio-${String(columnRatio).replace('-', '_')} ${columnGapClass(columnGap as ColumnGap)} vs2-valign-${verticalAlign} ${alignClass(alignment as ContentAlignment)} ${stackOnMobile ? 'vs2-columns--stack-mobile vs2-columns--left-first' : 'vs2-columns--no-stack-mobile'}`}
        >
          <div className="vs2-columns__col">
            {wrapSlotZone(Left, STUDIO_V2_COLUMN_SLOT_ALLOW, '96px')}
          </div>
          <div className="vs2-columns__col">
            {wrapSlotZone(Right, STUDIO_V2_COLUMN_SLOT_ALLOW, '96px')}
          </div>
        </div>
      ),
    },
    HeroAutoHall: {
      label: 'Hero campagne',
      fields: {
        eyebrow: { type: 'text', label: 'Accroche (petit texte)' },
        promoBadge: { type: 'text', label: 'Badge promotionnel' },
        title: { type: 'text', label: 'Titre principal' },
        subtitle: { type: 'textarea', label: 'Texte d\'introduction' },
        ctaPrimaryLabel: { type: 'text', label: 'Bouton principal — libellé' },
        ctaPrimaryHref: { type: 'text', label: 'Bouton principal — destination' },
        ctaSecondaryLabel: { type: 'text', label: 'Bouton secondaire — libellé' },
        ctaSecondaryHref: { type: 'text', label: 'Bouton secondaire — destination' },
        showBadges: {
          type: 'radio',
          label: 'Afficher les arguments clés',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        badges: {
          type: 'array',
          label: 'Arguments clés',
          arrayFields: {
            value: { type: 'text', label: 'Argument' },
          },
          getItemSummary: (item: { value?: string }) => item?.value || 'Argument',
        },
        imageAssetId: {
          type: 'custom',
          label: 'Image',
          render: ({ value, onChange }) => renderMediaField({ value, onChange }),
        },
        ...HIDDEN_IMAGE_PROPS,
        layout: {
          type: 'select',
          label: 'Disposition visuelle',
          options: HERO_LAYOUT_OPTIONS,
        },
        tone: {
          type: 'select',
          label: 'Ambiance couleur',
          options: TONE_OPTIONS,
        },
        alignment: {
          type: 'select',
          label: 'Alignement du texte',
          options: ALIGN_OPTIONS,
        },
        titleSize: {
          type: 'select',
          label: 'Taille du titre',
          options: [
            { label: 'S', value: 's' },
            { label: 'M', value: 'm' },
            { label: 'L', value: 'l' },
            { label: 'XL', value: 'xl' },
          ],
        },
        titleWeight: {
          type: 'select',
          label: 'Graisse du titre',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Medium', value: 'medium' },
            { label: 'Gras', value: 'bold' },
            { label: 'Extra-gras', value: 'extrabold' },
          ],
        },
        titleColor: { type: 'text', label: 'Couleur du titre (optionnel)' },
        bodyColor: { type: 'text', label: 'Couleur du texte (optionnel)' },
        ctaPrimaryVariant: {
          type: 'select',
          label: 'Style bouton principal',
          options: [
            { label: 'Primaire', value: 'primary' },
            { label: 'Secondaire', value: 'secondary' },
            { label: 'Contour', value: 'outline' },
            { label: 'Lien', value: 'link' },
          ],
        },
        ctaPrimarySize: {
          type: 'select',
          label: 'Taille bouton principal',
          options: [
            { label: 'S', value: 's' },
            { label: 'M', value: 'm' },
            { label: 'L', value: 'l' },
          ],
        },
        ctaSecondaryVariant: {
          type: 'select',
          label: 'Style bouton secondaire',
          options: [
            { label: 'Secondaire', value: 'secondary' },
            { label: 'Contour', value: 'outline' },
            { label: 'Lien', value: 'link' },
          ],
        },
      },
      defaultProps: {
        eyebrow: '',
        promoBadge: '',
        title: 'Titre campagne',
        subtitle: '',
        ctaPrimaryLabel: 'Découvrir',
        ctaPrimaryHref: '#lead-form',
        ctaSecondaryLabel: '',
        ctaSecondaryHref: '#',
        layout: 'split_right',
        tone: 'brand',
        alignment: 'left',
        showBadges: false,
        badges: [],
        imageUrl: '',
        imageAssetId: '',
        imageAlt: '',
        ...IMAGE_STYLE_DEFAULTS,
        titleSize: 'l',
        titleWeight: 'bold',
        ctaPrimaryVariant: 'primary',
        ctaPrimarySize: 'm',
        ctaSecondaryVariant: 'outline',
      },
      render: (props) => {
        const {
          eyebrow,
          promoBadge,
          title,
          subtitle,
          ctaPrimaryLabel,
          ctaPrimaryHref,
          ctaSecondaryLabel,
          ctaSecondaryHref,
          ctaLabel,
          ctaHref,
          layout,
          tone,
          backgroundTone,
          alignment,
          showBadges,
          badges,
          ctaPrimaryVariant,
          ctaPrimarySize,
          ctaSecondaryVariant,
        } = props;
        const heroProps = props as Record<string, unknown>;
        const primaryLabel = ctaPrimaryLabel || ctaLabel;
        const primaryHref = ctaPrimaryHref || ctaHref || '#lead-form';
        const heroTone = (tone || backgroundTone || 'brand') as HeroTone;
        const heroLayout = (layout || 'split_right') as HeroLayout;
        const badgeItems = Array.isArray(badges)
          ? badges
              .map((b) => (typeof b === 'string' ? b : (b as { value?: string })?.value))
              .filter((b): b is string => Boolean(b?.trim()))
          : [];

        return (
          <div
            className={`vs2-hero vs2-hero--${heroLayout} ${toneClass(heroTone)} ${alignClass(alignment as ContentAlignment)}`}
          >
            <div className="vs2-hero__content">
              {promoBadge ? <span className="vs2-hero__badge">{promoBadge}</span> : null}
              {eyebrow ? <p className="vs2-hero__eyebrow">{eyebrow}</p> : null}
              {title ? (
                <h1 className="vs2-hero__title" style={heroTitleStyle(heroProps)}>
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="vs2-hero__subtitle" style={heroSubtitleStyle(heroProps)}>
                  {subtitle}
                </p>
              ) : null}
              <div className="vs2-hero__ctas">
                {primaryLabel ? (
                  <a
                    className={ctaClassName(String(ctaPrimaryVariant ?? 'primary'), String(ctaPrimarySize ?? 'm'))}
                    style={ctaInlineStyle(String(ctaPrimarySize ?? 'm'))}
                    href={primaryHref}
                  >
                    {primaryLabel}
                  </a>
                ) : null}
                {ctaSecondaryLabel ? (
                  <a
                    className={ctaClassName(String(ctaSecondaryVariant ?? 'outline'), 'm')}
                    href={ctaSecondaryHref || '#'}
                  >
                    {ctaSecondaryLabel}
                  </a>
                ) : null}
              </div>
              {showBadges && badgeItems.length > 0 ? (
                <div className="vs2-hero__badges">
                  {badgeItems.map((badge) => (
                    <span key={badge} className="vs2-hero__badge-item">
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            {renderHeroMedia(props as Record<string, unknown>)}
          </div>
        );
      },
    },
    LeadFormAutoHall: {
      label: 'Formulaire lead',
      fields: {
        formPurpose: {
          type: 'select',
          label: 'Type de formulaire',
          options: [
            { label: 'Demande / lead', value: 'lead' },
            { label: 'Prise de rendez-vous', value: 'appointment' },
          ],
        },
        title: { type: 'text', label: 'Titre du formulaire' },
        subtitle: { type: 'textarea', label: 'Texte d\'introduction' },
        submitText: { type: 'text', label: 'Libellé du bouton' },
        consentText: { type: 'textarea', label: 'Texte consentement' },
        privacyNote: { type: 'text', label: 'Note champs obligatoires' },
        showCivility: {
          type: 'radio',
          label: 'Civilité',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        splitFullName: {
          type: 'radio',
          label: 'Nom / prénom séparés',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        showEmail: {
          type: 'radio',
          label: 'Afficher email',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        showCity: {
          type: 'radio',
          label: 'Afficher ville',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        showVehicleModel: {
          type: 'radio',
          label: 'Afficher modèle',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        showMessage: {
          type: 'radio',
          label: 'Afficher message',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        layout: {
          type: 'select',
          label: 'Disposition',
          options: [
            { label: 'Carte', value: 'card' },
            { label: 'Inline', value: 'inline' },
          ],
        },
        alignment: {
          type: 'select',
          label: 'Alignement',
          options: ALIGN_OPTIONS,
        },
        spacingPreset: {
          type: 'select',
          label: 'Espacement',
          options: SPACING_OPTIONS.filter((o) => o.value !== 'hero'),
        },
      },
      defaultProps: {
        formPurpose: 'lead',
        title: 'Contactez-nous',
        subtitle: '',
        submitText: 'Envoyer votre demande',
        consentText: '',
        privacyNote: '* Champs obligatoires.',
        showCivility: true,
        splitFullName: true,
        showEmail: true,
        showCity: true,
        showVehicleModel: true,
        showMessage: false,
        layout: 'card',
        alignment: 'left',
        spacingPreset: 'normal',
      },
      render: (props) => {
        const {
          title,
          subtitle,
          submitText,
          consentText,
          privacyNote,
          alignment,
          spacingPreset,
          layout,
        } = props;

        return (
          <div
            id="lead-form"
            className={`vs2-form vs2-form--${layout} ${alignClass(alignment as ContentAlignment)} ${padClass(spacingPreset as SpacingPreset)}`}
          >
            <div className="vs2-form__card">
              <form className="lp-lead-form" noValidate>
                {title ? <h2 className="vs2-form__title">{title}</h2> : null}
                {subtitle ? <p className="vs2-form__subtitle">{subtitle}</p> : null}
                <div className="vs2-form__fields lp-lead-form__grid">
                  {renderLeadFormFields(props)}
                </div>
                {consentText ? (
                  <label className="lp-lead-form__field lp-lead-form__field--consent lp-lead-form__field--full vs2-form__consent">
                    <input
                      className="lp-lead-form__checkbox"
                      type="checkbox"
                      name="consent"
                      value="1"
                      disabled
                      readOnly
                    />
                    <span className="lp-lead-form__consent-text">{consentText}</span>
                  </label>
                ) : null}
                {privacyNote ? (
                  <p className="lp-lead-form__required-note vs2-form__note">{privacyNote}</p>
                ) : null}
                <button type="button" className="lp-btn lp-btn--primary vs2-form__submit" disabled>
                  {submitText}
                </button>
              </form>
            </div>
          </div>
        );
      },
    },
    VehicleOffer: {
      label: 'Offre véhicule',
      fields: {
        offerLabel: { type: 'text', label: 'Étiquette offre' },
        title: { type: 'text', label: 'Titre de l\'offre' },
        subtitle: { type: 'textarea', label: 'Description courte' },
        modelName: { type: 'text', label: 'Nom du modèle' },
        priceText: { type: 'text', label: 'Prix ou mensualité' },
        highlights: {
          type: 'array',
          label: 'Points forts',
          arrayFields: {
            value: { type: 'text', label: 'Point' },
          },
          getItemSummary: (item: { value?: string }) => item?.value || 'Point',
        },
        ctaLabel: { type: 'text', label: 'Bouton — libellé' },
        ctaHref: { type: 'text', label: 'Bouton — destination' },
        imageAssetId: {
          type: 'custom',
          label: 'Image véhicule',
          render: ({ value, onChange }) => renderMediaField({ value, onChange }),
        },
        ...HIDDEN_IMAGE_PROPS,
        layout: {
          type: 'select',
          label: 'Disposition',
          options: [
            { label: 'Carte', value: 'card' },
            { label: 'Image + texte', value: 'split' },
          ],
        },
      },
      defaultProps: {
        layout: 'split',
        offerLabel: '',
        title: '',
        subtitle: '',
        modelName: '',
        priceText: '',
        highlights: [],
        ctaLabel: 'Demander un essai',
        ctaHref: '#lead-form',
        imageAssetId: '',
        imageUrl: '',
        imageAlt: '',
        ...IMAGE_STYLE_DEFAULTS,
      },
      render: (props) => {
        const {
          layout,
          offerLabel,
          title,
          subtitle,
          modelName,
          priceText,
          highlights,
          ctaLabel,
          ctaHref,
        } = props;
        const highlightItems = Array.isArray(highlights)
          ? highlights
              .map((h) => (typeof h === 'string' ? h : (h as { value?: string })?.value))
              .filter((h): h is string => Boolean(h?.trim()))
          : [];

        return (
          <section className={`vs2-offer vs2-offer--${layout}`}>
            <div className="vs2-offer__content">
              {offerLabel ? <span className="vs2-offer__label">{offerLabel}</span> : null}
              {title ? <h2 className="vs2-offer__title">{title}</h2> : null}
              {subtitle ? <p className="vs2-offer__subtitle">{subtitle}</p> : null}
              {modelName ? <p className="vs2-offer__model">{modelName}</p> : null}
              {priceText ? <p className="vs2-offer__price">{priceText}</p> : null}
              {highlightItems.length > 0 ? (
                <ul className="vs2-offer__highlights">
                  {highlightItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {ctaLabel ? (
                <a className="vs2-offer__cta" href={ctaHref || '#lead-form'}>
                  {ctaLabel}
                </a>
              ) : null}
            </div>
            {renderOfferMedia(props as Record<string, unknown>)}
          </section>
        );
      },
    },
    VehicleRange: {
      label: 'Gamme véhicules',
      fields: {
        title: { type: 'text', label: 'Titre' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        columns: {
          type: 'select',
          label: 'Colonnes',
          options: [
            { label: '2', value: 2 },
            { label: '3', value: 3 },
            { label: '4', value: 4 },
          ],
        },
        cardStyle: {
          type: 'select',
          label: 'Style cartes',
          options: [
            { label: 'Clean', value: 'clean' },
            { label: 'Bordure', value: 'bordered' },
            { label: 'Élevé', value: 'elevated' },
          ],
        },
        vehicles: {
          type: 'array',
          label: 'Véhicules',
          arrayFields: {
            name: { type: 'text', label: 'Nom' },
            category: { type: 'text', label: 'Catégorie' },
            energy: { type: 'text', label: 'Énergie' },
            priceText: { type: 'text', label: 'Prix' },
            ctaLabel: { type: 'text', label: 'CTA' },
            ctaHref: { type: 'text', label: 'Lien CTA' },
            imageUrl: { type: 'text', label: 'URL image' },
          },
          defaultItemProps: {
            name: 'Nouveau modèle',
            category: 'SUV',
            energy: 'Essence',
            priceText: 'À partir de …',
            ctaLabel: 'Configurer',
            ctaHref: '#lead-form',
            imageUrl: '',
          },
          getItemSummary: (item: { name?: string }) => item?.name || 'Véhicule',
        },
      },
      defaultProps: {
        title: 'Notre gamme',
        subtitle: '',
        columns: 3,
        cardStyle: 'clean',
        vehicles: [],
      },
      render: ({ title, subtitle, columns, cardStyle, vehicles }) => {
        const cols = columns === 2 || columns === 4 ? columns : 3;
        const cards = Array.isArray(vehicles) ? vehicles : [];

        return (
          <section className={`vs2-range vs2-range--cols-${cols} vs2-range--${cardStyle}`}>
            {title ? <h2 className="vs2-range__title">{title}</h2> : null}
            {subtitle ? <p className="vs2-range__subtitle">{subtitle}</p> : null}
            <div className="vs2-range__grid">
              {cards.map((vehicle, index) => {
                const v = vehicle as Record<string, unknown>;
                return (
                  <article key={String(v.name ?? index)} className="vs2-range-card">
                    {v.imageUrl ? (
                      <img
                        src={String(v.imageUrl)}
                        alt={String(v.name ?? '')}
                        className="vs2-range-card__img"
                      />
                    ) : (
                      <div className="vs2-range-card__placeholder">Visuel</div>
                    )}
                    {v.category ? (
                      <span className="vs2-range-card__category">{String(v.category)}</span>
                    ) : null}
                    {v.energy ? (
                      <span className="vs2-range-card__energy">{String(v.energy)}</span>
                    ) : null}
                    {v.name ? <h3 className="vs2-range-card__name">{String(v.name)}</h3> : null}
                    {v.priceText ? (
                      <p className="vs2-range-card__price">{String(v.priceText)}</p>
                    ) : null}
                    {v.ctaLabel ? (
                      <a
                        className="vs2-range-card__cta"
                        href={String(v.ctaHref ?? '#lead-form')}
                      >
                        {String(v.ctaLabel)}
                      </a>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      },
    },
    Benefits: {
      label: 'Avantages',
      fields: {
        title: { type: 'text', label: 'Titre' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        layout: {
          type: 'select',
          label: 'Disposition',
          options: [
            { label: 'Cartes', value: 'cards' },
            { label: 'Liste', value: 'list' },
            { label: 'Icônes', value: 'icons' },
            { label: 'Confiance / garanties', value: 'trust' },
          ],
        },
        items: {
          type: 'array',
          label: 'Éléments',
          arrayFields: {
            icon: {
              type: 'select',
              label: 'Icône',
              options: BENEFIT_ICON_OPTIONS,
            },
            title: { type: 'text', label: 'Titre' },
            description: { type: 'textarea', label: 'Description' },
          },
          defaultItemProps: {
            icon: 'check',
            title: 'Avantage',
            description: 'Description de l’avantage.',
          },
          getItemSummary: (item: { title?: string }) => item?.title || 'Avantage',
        },
      },
      defaultProps: {
        title: 'Nos avantages',
        subtitle: '',
        layout: 'cards',
        items: [],
      },
      render: ({ title, subtitle, layout, items }) => {
        const benefitItems = Array.isArray(items) ? items : [];

        return (
          <section className={`vs2-benefits vs2-benefits--${layout}`}>
            {title ? <h2 className="vs2-benefits__title">{title}</h2> : null}
            {subtitle ? <p className="vs2-benefits__subtitle">{subtitle}</p> : null}
            <div className="vs2-benefits__grid">
              {benefitItems.map((item, index) => {
                const b = item as Record<string, unknown>;
                return (
                  <article
                    key={String(b.title ?? index)}
                    className={`vs2-benefit vs2-benefit--${String(b.icon ?? 'check')}`}
                  >
                    {renderBenefitIcon(String(b.icon ?? 'check'))}
                    {b.title ? <h3 className="vs2-benefit__title">{String(b.title)}</h3> : null}
                    {b.description ? (
                      <p className="vs2-benefit__desc">{String(b.description)}</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      },
    },
    FAQ: {
      label: 'FAQ',
      fields: {
        title: { type: 'text', label: 'Titre' },
        defaultOpenFirst: {
          type: 'radio',
          label: 'Ouvrir le 1er élément',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        items: {
          type: 'array',
          label: 'Questions',
          arrayFields: {
            question: { type: 'text', label: 'Question' },
            answer: { type: 'textarea', label: 'Réponse' },
          },
          defaultItemProps: {
            question: 'Question fréquente ?',
            answer: 'Réponse détaillée.',
          },
          getItemSummary: (item: { question?: string }) => item?.question || 'Question',
        },
      },
      defaultProps: {
        title: 'Questions fréquentes',
        defaultOpenFirst: false,
        items: [],
      },
      render: ({ title, defaultOpenFirst, items }) => {
        const faqItems = Array.isArray(items) ? items : [];

        return (
          <section className="vs2-faq">
            {title ? <h2 className="vs2-faq__title">{title}</h2> : null}
            <div className="vs2-faq__list">
              {faqItems.map((item, index) => {
                const f = item as Record<string, unknown>;
                if (!f.question || !f.answer) return null;
                return (
                  <details
                    key={String(f.question)}
                    className="vs2-faq__item"
                    open={defaultOpenFirst && index === 0}
                  >
                    <summary className="vs2-faq__question">{String(f.question)}</summary>
                    <p className="vs2-faq__answer">{String(f.answer)}</p>
                  </details>
                );
              })}
            </div>
          </section>
        );
      },
    },
    CTASection: {
      label: 'CTA Section',
      fields: {
        layout: {
          type: 'select',
          label: 'Disposition',
          options: [
            { label: 'Bandeau', value: 'band' },
            { label: 'Carte', value: 'card' },
            { label: 'Minimal', value: 'minimal' },
          ],
        },
        tone: {
          type: 'select',
          label: 'Ton',
          options: TONE_OPTIONS,
        },
        title: { type: 'text', label: 'Titre' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        buttonLabel: { type: 'text', label: 'Bouton label' },
        buttonHref: { type: 'text', label: 'Bouton lien' },
      },
      defaultProps: {
        layout: 'band',
        tone: 'brand',
        title: '',
        subtitle: '',
        buttonLabel: 'Contactez-nous',
        buttonHref: '#lead-form',
      },
      render: ({ layout, tone, title, subtitle, buttonLabel, buttonHref }) => (
        <section
          className={`vs2-cta vs2-cta--${layout} ${toneClass(tone as BackgroundTone)}`}
        >
          {title ? <h2 className="vs2-cta__title">{title}</h2> : null}
          {subtitle ? <p className="vs2-cta__subtitle">{subtitle}</p> : null}
          {buttonLabel ? (
            <a className="vs2-cta__button" href={buttonHref || '#lead-form'}>
              {buttonLabel}
            </a>
          ) : null}
        </section>
      ),
    },
    Spacer: {
      label: 'Espacement',
      fields: {
        size: {
          type: 'select',
          label: 'Hauteur',
          options: [
            { label: 'Petit', value: 'sm' },
            { label: 'Moyen', value: 'md' },
            { label: 'Grand', value: 'lg' },
            { label: 'Très grand', value: 'xl' },
          ],
        },
      },
      defaultProps: { size: 'md' },
      render: ({ size }) => <div className={`vs2-spacer vs2-spacer--${size ?? 'md'}`} aria-hidden />,
    },
    StepsBlock: {
      label: 'Étapes / parcours',
      fields: {
        title: { type: 'text', label: 'Titre de la section' },
        subtitle: { type: 'textarea', label: 'Introduction' },
        steps: {
          type: 'array',
          label: 'Étapes',
          arrayFields: {
            title: { type: 'text', label: 'Titre de l\'étape' },
            description: { type: 'textarea', label: 'Description' },
          },
          getItemSummary: (item: { title?: string }) => item?.title || 'Étape',
          defaultItemProps: { title: 'Nouvelle étape', description: '' },
        },
      },
      defaultProps: {
        title: '',
        subtitle: '',
        steps: [],
      },
      render: ({ title, subtitle, steps }) => {
        const stepItems = Array.isArray(steps) ? steps : [];
        return (
          <section className="vs2-steps">
            {title ? <h2 className="vs2-steps__title">{title}</h2> : null}
            {subtitle ? <p className="vs2-steps__subtitle">{subtitle}</p> : null}
            <ol className="vs2-steps__list">
              {stepItems.map((step, index) => {
                const s = step as Record<string, unknown>;
                return (
                  <li key={String(s.title ?? index)} className="vs2-steps__item">
                    <span className="vs2-steps__number">{index + 1}</span>
                    <div>
                      {s.title ? <p className="vs2-steps__item-title">{String(s.title)}</p> : null}
                      {s.description ? (
                        <p className="vs2-steps__item-desc">{String(s.description)}</p>
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
    MediaImage: {
      label: 'Image',
      fields: {
        imageAssetId: {
          type: 'custom',
          label: 'Visuel',
          render: ({ value, onChange }) => renderMediaField({ value, onChange }),
        },
        ...HIDDEN_IMAGE_PROPS,
        caption: { type: 'text', label: 'Légende (optionnel)' },
        alignment: {
          type: 'select',
          label: 'Alignement',
          options: ALIGN_OPTIONS,
        },
      },
      defaultProps: {
        imageAssetId: '',
        imageUrl: '',
        imageAlt: '',
        caption: '',
        alignment: 'center',
        ...IMAGE_STYLE_DEFAULTS,
      },
      render: (props) => {
        const { caption, alignment } = props;
        return (
          <figure className={`vs2-media-image ${alignClass(alignment as ContentAlignment)}`}>
            {renderHeroMedia(props as Record<string, unknown>, 'Ajoutez une image')}
            {caption ? <figcaption className="vs2-media-image__caption">{caption}</figcaption> : null}
          </figure>
        );
      },
    },
    ...creativeBlockComponents,
    FooterLegal: {
      label: 'Pied de page légal',
      fields: {
        brandName: { type: 'text', label: 'Marque' },
        legalText: { type: 'textarea', label: 'Mentions légales' },
        links: {
          type: 'array',
          label: 'Liens',
          arrayFields: {
            label: { type: 'text', label: 'Label' },
            href: { type: 'text', label: 'URL' },
          },
          defaultItemProps: { label: 'Lien', href: '#' },
          getItemSummary: (item: { label?: string }) => item?.label || 'Lien',
        },
      },
      defaultProps: {
        brandName: 'Auto Hall',
        legalText: '',
        links: [],
      },
      render: ({ brandName, legalText, links }) => {
        const footerLinks = Array.isArray(links) ? links : [];

        return (
          <footer className="vs2-footer">
            {brandName ? <span className="vs2-footer__brand">{brandName}</span> : null}
            {legalText ? <p className="vs2-footer__legal">{legalText}</p> : null}
            {footerLinks.length > 0 ? (
              <nav className="vs2-footer__links">
                {footerLinks.map((link) => {
                  const l = link as Record<string, unknown>;
                  if (!l.label) return null;
                  return (
                    <a key={String(l.label)} href={String(l.href ?? '#')}>
                      {String(l.label)}
                    </a>
                  );
                })}
              </nav>
            ) : null}
          </footer>
        );
      },
    },
  },
};
