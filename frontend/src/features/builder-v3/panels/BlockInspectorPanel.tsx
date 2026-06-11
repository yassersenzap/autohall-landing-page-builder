import { useState } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { getRegistryEntry } from '@/features/builder-engine/registry/block-registry';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  ShadButton,
  ShadInput,
  ShadTextarea,
  Tabs,
} from '@/components/ui/primitives';
import { BackgroundInspectorFields } from '../components/BackgroundInspectorFields';
import { ProFormDesignFields } from '../components/ProFormDesignFields';
import { FieldHint } from '../components/BlockInspectorPanel.shared';
import { MediaFieldControl } from '../components/MediaFieldControl';
import { mediaValueFromProps, patchMediaProps } from '../components/media-field-utils';
import { TextAlignmentField } from '../components/TextAlignmentField';
import {
  isMarketingInspectorBlock,
  MarketingBlockInspectorFields,
} from './MarketingBlockInspectorFields';
import {
  CampaignLeadHeroInspectorFields,
  isCampaignLeadHeroBlock,
} from './CampaignLeadHeroInspectorFields';
import {
  HeroVehicleOfferInspectorFields,
  isHeroVehicleOfferBlock,
} from './HeroVehicleOfferInspectorFields';
import { BlockDesignInspectorFields } from './BlockDesignInspectorFields';
import { INSPECTOR_DESIGN_BLOCKS } from '@/features/builder-engine/lib/block-design-system';
import { SECTION_PADDING_OPTIONS } from '../constants/block-layout';
import {
  MEDIA_ASPECT_RATIO_OPTIONS,
  SPACER_TYPE_OPTIONS,
} from '../constants/utility-blocks';

type BlockPropertyTab = 'content' | 'design' | 'layout' | 'media' | 'advanced';

function BlockOrderActions({
  block,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: {
  block: BuilderDocumentBlock;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className="flex items-center gap-1 px-4 pt-4">
      <ShadButton
        type="button"
        size="sm"
        variant="secondary"
        className="h-8 flex-1 border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
        disabled={!canMoveUp}
        onClick={onMoveUp}
        aria-label="Monter le bloc"
      >
        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
      </ShadButton>
      <ShadButton
        type="button"
        size="sm"
        variant="secondary"
        className="h-8 flex-1 border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
        disabled={!canMoveDown}
        onClick={onMoveDown}
        aria-label="Descendre le bloc"
      >
        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
      </ShadButton>
      <ShadButton
        type="button"
        size="sm"
        variant="secondary"
        className="h-8 border-red-900/50 bg-red-950/30 text-red-300 hover:bg-red-950/50"
        onClick={onDelete}
        aria-label={`Supprimer ${block.label}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </ShadButton>
    </div>
  );
}

type BlockInspectorPanelProps = {
  block: BuilderDocumentBlock;
  updateBlockProps: (blockId: string, patch: Record<string, unknown>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function BlockInspectorPanel({
  block,
  updateBlockProps,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: BlockInspectorPanelProps) {
  const [tab, setTab] = useState<BlockPropertyTab>('content');
  const entry = getRegistryEntry(block.type);

  const isPromo = block.type === 'promo_autohall';
  const isHero = block.type === 'hero_campaign' || block.type === 'hero_form_campaign';
  const isForm = block.type === 'lead_form';
  const isVehicleFeatures = block.type === 'vehicle_features';
  const isGallery = block.type === 'gallery';
  const isFooter = block.type === 'footer_legal';
  const isRichText = block.type === 'rich_text';
  const isMediaOnly = block.type === 'media_only';
  const isSpacerDivider = block.type === 'spacer_divider';
  const isVideoEmbed = block.type === 'video_embed';
  const isCTABand = block.type === 'cta_band';
  const isPricingTrim = block.type === 'pricing_trim';
  const isFAQ = block.type === 'faq';
  const isTestimonials = block.type === 'testimonials';
  const isHeroVehicleOffer = isHeroVehicleOfferBlock(block.type);
  const isCampaignLeadHero = isCampaignLeadHeroBlock(block.type);
  const isMarketingBlock = isMarketingInspectorBlock(block.type);
  const isPremiumDesignBlock = INSPECTOR_DESIGN_BLOCKS.has(block.type);
  const heroBgActive =
    isHero &&
    (asPropString(block.propsJson.backgroundType) === 'color' ||
      asPropString(block.propsJson.backgroundType) === 'image');

  const textAlignment = asPropString(block.propsJson.textAlignment) || 'left';
  const richTextAlignement = asPropString(block.propsJson.alignement) || 'center';
  const aspectRatio = asPropString(block.propsJson.aspectRatio) || '16:9';
  const spacerType = asPropString(block.propsJson.type) || 'solid';
  const spacerHauteur = asPropString(block.propsJson.hauteur) || 'M';
  const sectionPadding = asPropString(block.propsJson.sectionPadding) || 'M';
  const anchorId = asPropString(block.propsJson.anchorId);

  const patch = (p: Record<string, unknown>) => updateBlockProps(block.id, p);

  return (
    <div className="space-y-3 pb-4">
      <BlockOrderActions
        block={block}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />

      <div className="space-y-3 px-4">
        <Card className="border-neutral-800 bg-neutral-900/50 text-neutral-100">
          <CardHeader className="gap-2 p-4 pb-0">
            <CardTitle className="text-sm text-neutral-200">{block.label}</CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              {entry?.label ?? block.type}
            </CardDescription>
            <div data-testid="block-inspector-tabs">
              <Tabs
                items={[
                  { id: 'content', label: 'Contenu' },
                  { id: 'design', label: 'Design' },
                  { id: 'layout', label: 'Layout' },
                  { id: 'media', label: 'Media' },
                  { id: 'advanced', label: 'Avancé' },
                ]}
                value={tab}
                onChange={setTab}
                ariaLabel="Propriétés du bloc"
                className="border-neutral-800 bg-neutral-950/80"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4 pt-3">
            {tab === 'content' && (
              <div className="space-y-4">
                {(isPromo || isHero || isForm || isVehicleFeatures) && (
                  <div className="space-y-1.5">
                    <Label htmlFor="v3-inspector-title" className="text-neutral-400">
                      {isForm ? 'Titre formulaire' : isVehicleFeatures ? 'Titre section' : 'Titre'}
                    </Label>
                    <ShadInput
                      id="v3-inspector-title"
                      value={asPropString(
                        isVehicleFeatures ? block.propsJson.heading : block.propsJson.title,
                      )}
                      onChange={(e) =>
                        patch(
                          isVehicleFeatures
                            ? { heading: e.target.value }
                            : { title: e.target.value },
                        )
                      }
                      className="border-neutral-700 bg-neutral-900 text-neutral-200"
                    />
                    <FieldHint>
                      {isForm
                        ? 'Intitulé affiché au-dessus du formulaire de capture.'
                        : 'Phrase d’accroche principale de votre campagne. Max 60 caractères recommandés.'}
                    </FieldHint>
                  </div>
                )}

                {(isPromo || isHero || isForm || isVehicleFeatures) && (
                  <div className="space-y-1.5">
                    <Label htmlFor="v3-inspector-subtitle" className="text-neutral-400">
                      Sous-titre
                    </Label>
                    <ShadTextarea
                      id="v3-inspector-subtitle"
                      rows={isHero ? 3 : 2}
                      value={asPropString(block.propsJson.subtitle)}
                      onChange={(e) => patch({ subtitle: e.target.value })}
                      className="border-neutral-700 bg-neutral-900 text-neutral-200"
                    />
                    <FieldHint>
                      Complément d’information — offre, délai de réponse ou bénéfice client.
                    </FieldHint>
                  </div>
                )}

                {isPromo && (
                  <div className="space-y-1.5">
                    <Label htmlFor="v3-inspector-legal" className="text-neutral-400">
                      Mentions légales (hero)
                    </Label>
                    <ShadTextarea
                      id="v3-inspector-legal"
                      rows={2}
                      value={asPropString(block.propsJson.legalNote)}
                      onChange={(e) => patch({ legalNote: e.target.value })}
                      className="border-neutral-700 bg-neutral-900 text-neutral-200"
                    />
                    <FieldHint>Asterisque, conditions d’offre, photos non contractuelles.</FieldHint>
                  </div>
                )}

                {isHero && !isPromo && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-cta" className="text-neutral-400">
                        Texte bouton CTA
                      </Label>
                      <ShadInput
                        id="v3-inspector-cta"
                        value={asPropString(block.propsJson.buttonText)}
                        onChange={(e) => patch({ buttonText: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-cta-url" className="text-neutral-400">
                        URL de redirection
                      </Label>
                      <ShadInput
                        id="v3-inspector-cta-url"
                        value={asPropString(block.propsJson.buttonTarget) || '#lead-form'}
                        onChange={(e) => patch({ buttonTarget: e.target.value })}
                        placeholder="#lead-form ou https://…"
                        className="border-neutral-700 bg-neutral-900 font-mono text-neutral-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-cta-secondary" className="text-neutral-400">
                        Texte bouton secondaire
                      </Label>
                      <ShadInput
                        id="v3-inspector-cta-secondary"
                        value={asPropString(block.propsJson.secondaryButtonText)}
                        onChange={(e) => patch({ secondaryButtonText: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-cta-secondary-url" className="text-neutral-400">
                        URL bouton secondaire
                      </Label>
                      <ShadInput
                        id="v3-inspector-cta-secondary-url"
                        value={asPropString(block.propsJson.secondaryButtonTarget) || '#offer'}
                        onChange={(e) => patch({ secondaryButtonTarget: e.target.value })}
                        placeholder="#offer ou https://…"
                        className="border-neutral-700 bg-neutral-900 font-mono text-neutral-200"
                      />
                    </div>
                  </>
                )}

                {isHeroVehicleOffer && (
                  <HeroVehicleOfferInspectorFields block={block} patch={patch} />
                )}

                {isCampaignLeadHero && (
                  <CampaignLeadHeroInspectorFields block={block} patch={patch} />
                )}

                {isMarketingBlock && (
                  <MarketingBlockInspectorFields block={block} patch={patch} />
                )}

                {isPromo && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-form-title" className="text-neutral-400">
                        Titre carte formulaire
                      </Label>
                      <ShadInput
                        id="v3-inspector-form-title"
                        value={asPropString(block.propsJson.formTitle)}
                        onChange={(e) => patch({ formTitle: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-form-sub" className="text-neutral-400">
                        Sous-titre formulaire
                      </Label>
                      <ShadInput
                        id="v3-inspector-form-sub"
                        value={asPropString(block.propsJson.formSubtitle)}
                        onChange={(e) => patch({ formSubtitle: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-submit" className="text-neutral-400">
                        Bouton envoi
                      </Label>
                      <ShadInput
                        id="v3-inspector-submit"
                        value={asPropString(block.propsJson.submitText)}
                        onChange={(e) => patch({ submitText: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                      <FieldHint>Texte du bouton de conversion — ex. « Envoyer ma demande ».</FieldHint>
                    </div>
                  </>
                )}

                {isForm && (
                  <div className="space-y-1.5">
                    <Label htmlFor="v3-inspector-submit-form" className="text-neutral-400">
                      Bouton envoi
                    </Label>
                    <ShadInput
                      id="v3-inspector-submit-form"
                      value={asPropString(block.propsJson.submitText)}
                      onChange={(e) => patch({ submitText: e.target.value })}
                      className="border-neutral-700 bg-neutral-900 text-neutral-200"
                    />
                  </div>
                )}

                {isGallery && (
                  <div className="space-y-1.5">
                    <Label htmlFor="v3-inspector-gallery-title" className="text-neutral-400">
                      Titre galerie
                    </Label>
                    <ShadInput
                      id="v3-inspector-gallery-title"
                      value={asPropString(block.propsJson.heading)}
                      onChange={(e) => patch({ heading: e.target.value })}
                      className="border-neutral-700 bg-neutral-900 text-neutral-200"
                    />
                  </div>
                )}

                {isFooter && (
                  <div className="space-y-1.5">
                    <Label htmlFor="v3-inspector-legal-text" className="text-neutral-400">
                      Mentions légales
                    </Label>
                    <ShadTextarea
                      id="v3-inspector-legal-text"
                      rows={5}
                      value={asPropString(block.propsJson.legalText)}
                      onChange={(e) => patch({ legalText: e.target.value })}
                      className="border-neutral-700 bg-neutral-900 text-neutral-200"
                    />
                    <FieldHint>Copyright, RGPD, conditions générales — texte réglementaire.</FieldHint>
                  </div>
                )}

                {isRichText && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-rich-titre" className="text-neutral-400">
                        Titre
                      </Label>
                      <ShadInput
                        id="v3-inspector-rich-titre"
                        value={asPropString(block.propsJson.titre)}
                        onChange={(e) => patch({ titre: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                      <FieldHint>Titre de section — police titrage globale appliquée.</FieldHint>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-rich-contenu" className="text-neutral-400">
                        Contenu
                      </Label>
                      <ShadTextarea
                        id="v3-inspector-rich-contenu"
                        rows={4}
                        value={asPropString(block.propsJson.contenu)}
                        onChange={(e) => patch({ contenu: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                      <FieldHint>Paragraphe descriptif — texte gris, corps de texte global.</FieldHint>
                    </div>
                  </>
                )}

                {isVideoEmbed && (
                  <div className="space-y-1.5">
                    <Label htmlFor="v3-inspector-video-title" className="text-neutral-400">
                      Titre section
                    </Label>
                    <ShadInput
                      id="v3-inspector-video-title"
                      value={asPropString(block.propsJson.title)}
                      onChange={(e) => patch({ title: e.target.value })}
                      className="border-neutral-700 bg-neutral-900 text-neutral-200"
                    />
                  </div>
                )}

                {isCTABand && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-cta-title" className="text-neutral-400">
                        Titre bandeau
                      </Label>
                      <ShadInput
                        id="v3-inspector-cta-title"
                        value={asPropString(block.propsJson.title)}
                        onChange={(e) => patch({ title: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-cta-btn" className="text-neutral-400">
                        Texte bouton
                      </Label>
                      <ShadInput
                        id="v3-inspector-cta-btn"
                        value={asPropString(block.propsJson.buttonText)}
                        onChange={(e) => patch({ buttonText: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-cta-href" className="text-neutral-400">
                        URL de redirection
                      </Label>
                      <ShadInput
                        id="v3-inspector-cta-href"
                        value={asPropString(block.propsJson.buttonHref)}
                        onChange={(e) => patch({ buttonHref: e.target.value })}
                        placeholder="#lead-form"
                        className="border-neutral-700 bg-neutral-900 font-mono text-neutral-200"
                      />
                    </div>
                  </>
                )}

                {isPricingTrim && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-pricing-heading" className="text-neutral-400">
                        Titre section
                      </Label>
                      <ShadInput
                        id="v3-inspector-pricing-heading"
                        value={asPropString(block.propsJson.heading)}
                        onChange={(e) => patch({ heading: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-pricing-sub" className="text-neutral-400">
                        Sous-titre
                      </Label>
                      <ShadInput
                        id="v3-inspector-pricing-sub"
                        value={asPropString(block.propsJson.subtitle)}
                        onChange={(e) => patch({ subtitle: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    {[0, 1, 2].map((index) => {
                      const trims = Array.isArray(block.propsJson.trims)
                        ? [...(block.propsJson.trims as Array<Record<string, unknown>>)]
                        : [];
                      while (trims.length < 3) {
                        trims.push({ name: '', price: '', features: [], buttonText: '', buttonHref: '' });
                      }
                      const trim = trims[index] ?? {};
                      const features = Array.isArray(trim.features)
                        ? (trim.features as string[]).join('\n')
                        : '';
                      return (
                        <div
                          key={`trim-${index}`}
                          className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950/50 p-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Finition {index + 1}
                          </p>
                          <ShadInput
                            value={asPropString(trim.name)}
                            onChange={(e) => {
                              trims[index] = { ...trim, name: e.target.value };
                              patch({ trims });
                            }}
                            placeholder="Nom finition"
                            className="border-neutral-700 bg-neutral-900 text-neutral-200"
                          />
                          <ShadInput
                            value={asPropString(trim.price)}
                            onChange={(e) => {
                              trims[index] = { ...trim, price: e.target.value };
                              patch({ trims });
                            }}
                            placeholder="189 900 DH"
                            className="border-neutral-700 bg-neutral-900 text-neutral-200"
                          />
                          <ShadTextarea
                            rows={3}
                            value={features}
                            onChange={(e) => {
                              trims[index] = {
                                ...trim,
                                features: e.target.value
                                  .split('\n')
                                  .map((l) => l.trim())
                                  .filter(Boolean),
                              };
                              patch({ trims });
                            }}
                            placeholder="Un équipement par ligne"
                            className="border-neutral-700 bg-neutral-900 text-neutral-200"
                          />
                          <ShadInput
                            value={asPropString(trim.buttonText)}
                            onChange={(e) => {
                              trims[index] = { ...trim, buttonText: e.target.value };
                              patch({ trims });
                            }}
                            placeholder="Texte bouton"
                            className="border-neutral-700 bg-neutral-900 text-neutral-200"
                          />
                          <ShadInput
                            value={asPropString(trim.buttonHref) || '#lead-form'}
                            onChange={(e) => {
                              trims[index] = { ...trim, buttonHref: e.target.value };
                              patch({ trims });
                            }}
                            placeholder="URL de redirection"
                            className="border-neutral-700 bg-neutral-900 font-mono text-neutral-200"
                          />
                        </div>
                      );
                    })}
                  </>
                )}

                {isFAQ && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-faq-heading" className="text-neutral-400">
                        Titre section
                      </Label>
                      <ShadInput
                        id="v3-inspector-faq-heading"
                        value={asPropString(block.propsJson.heading)}
                        onChange={(e) => patch({ heading: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    {[0, 1, 2, 3].map((index) => {
                      const items = Array.isArray(block.propsJson.items)
                        ? [...(block.propsJson.items as Array<{ question?: string; answer?: string }>)]
                        : [];
                      while (items.length < 4) items.push({ question: '', answer: '' });
                      const item = items[index] ?? {};
                      return (
                        <div
                          key={`faq-${index}`}
                          className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950/50 p-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Question {index + 1}
                          </p>
                          <ShadInput
                            value={asPropString(item.question)}
                            onChange={(e) => {
                              items[index] = { ...item, question: e.target.value };
                              patch({ items });
                            }}
                            placeholder="Question"
                            className="border-neutral-700 bg-neutral-900 text-neutral-200"
                          />
                          <ShadTextarea
                            rows={2}
                            value={asPropString(item.answer)}
                            onChange={(e) => {
                              items[index] = { ...item, answer: e.target.value };
                              patch({ items });
                            }}
                            placeholder="Réponse"
                            className="border-neutral-700 bg-neutral-900 text-neutral-200"
                          />
                        </div>
                      );
                    })}
                  </>
                )}

                {isTestimonials && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-test-heading" className="text-neutral-400">
                        Titre section
                      </Label>
                      <ShadInput
                        id="v3-inspector-test-heading"
                        value={asPropString(block.propsJson.heading)}
                        onChange={(e) => patch({ heading: e.target.value })}
                        className="border-neutral-700 bg-neutral-900 text-neutral-200"
                      />
                    </div>
                    {[0, 1, 2].map((index) => {
                      const items = Array.isArray(block.propsJson.items)
                        ? [...(block.propsJson.items as Array<{ quote?: string; author?: string }>)]
                        : [];
                      while (items.length < 3) items.push({ quote: '', author: '' });
                      const item = items[index] ?? {};
                      return (
                        <div
                          key={`testimonial-${index}`}
                          className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950/50 p-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Témoignage {index + 1}
                          </p>
                          <ShadTextarea
                            rows={2}
                            value={asPropString(item.quote)}
                            onChange={(e) => {
                              items[index] = { ...item, quote: e.target.value };
                              patch({ items });
                            }}
                            placeholder="Citation client"
                            className="border-neutral-700 bg-neutral-900 text-neutral-200"
                          />
                          <ShadInput
                            value={asPropString(item.author)}
                            onChange={(e) => {
                              items[index] = { ...item, author: e.target.value };
                              patch({ items });
                            }}
                            placeholder="Prénom N."
                            className="border-neutral-700 bg-neutral-900 text-neutral-200"
                          />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {tab === 'design' && (
              <div className="space-y-4">
                {isPremiumDesignBlock && (
                  <BlockDesignInspectorFields
                    blockType={block.type}
                    propsJson={block.propsJson}
                    onPatch={(designPatch) => updateBlockProps(block.id, designPatch)}
                  />
                )}

                {!isPremiumDesignBlock &&
                  !isVehicleFeatures &&
                  !isGallery &&
                  !isPromo &&
                  !isHero &&
                  !isRichText &&
                  !isMediaOnly &&
                  !isSpacerDivider &&
                  !isVideoEmbed &&
                  !isCTABand &&
                  !isPricingTrim &&
                  !isFAQ &&
                  !isTestimonials &&
                  !isHeroVehicleOffer &&
                  !isCampaignLeadHero && (
                  <p className="text-xs text-neutral-500">
                    Options de design limitées pour ce type de bloc — voir Layout ou Media.
                  </p>
                )}
              </div>
            )}

            {tab === 'layout' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="v3-section-padding" className="text-neutral-400">
                    Espacement vertical
                  </Label>
                  <select
                    id="v3-section-padding"
                    value={sectionPadding}
                    onChange={(e) => patch({ sectionPadding: e.target.value })}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
                  >
                    {SECTION_PADDING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <FieldHint>Padding haut et bas appliqué à la section.</FieldHint>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="v3-anchor-id" className="text-neutral-400">
                    Ancre (ID HTML)
                  </Label>
                  <ShadInput
                    id="v3-anchor-id"
                    value={anchorId}
                    onChange={(e) => patch({ anchorId: e.target.value })}
                    placeholder="ex. offre-speciale"
                    className="border-neutral-700 bg-neutral-900 font-mono text-neutral-200"
                  />
                  <FieldHint>
                    Permet les liens internes — ex. bouton CTA vers #offre-speciale.
                  </FieldHint>
                </div>

                {(isPromo || isHero || isVehicleFeatures || isGallery) && (
                  <div className="space-y-2">
                    <Label className="text-neutral-400">Alignement du texte</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          className={`rounded-md border px-2 py-1.5 text-xs capitalize transition-colors ${
                            textAlignment === align
                              ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                              : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500'
                          }`}
                          onClick={() => patch({ textAlignment: align })}
                        >
                          {align === 'left' ? 'Gauche' : align === 'center' ? 'Centre' : 'Droite'}
                        </button>
                      ))}
                    </div>
                    <FieldHint>Position du contenu textuel dans la section.</FieldHint>
                  </div>
                )}

                {isRichText && (
                  <TextAlignmentField
                    label="Alignement du texte"
                    value={richTextAlignement}
                    onChange={(align) => patch({ alignement: align })}
                    hint="Position du titre et du paragraphe dans le conteneur max-w-3xl."
                  />
                )}

                {isSpacerDivider && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-spacer-type" className="text-neutral-400">
                        Type de séparateur
                      </Label>
                      <select
                        id="v3-inspector-spacer-type"
                        value={spacerType}
                        onChange={(e) => patch({ type: e.target.value })}
                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
                      >
                        {SPACER_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <FieldHint>Ligne pleine, pointillée ou espace vide pour aérer la page.</FieldHint>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-spacer-hauteur" className="text-neutral-400">
                        Hauteur
                      </Label>
                      <select
                        id="v3-inspector-spacer-hauteur"
                        value={spacerHauteur}
                        onChange={(e) => patch({ hauteur: e.target.value })}
                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
                      >
                        <option value="S">S — 32 px</option>
                        <option value="M">M — 64 px</option>
                        <option value="L">L — 128 px</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'media' && (
              <div className="space-y-4">
                {(isHero || isPromo) && (
                  <div className="space-y-1.5">
                    <MediaFieldControl
                      label="Visuel média (split / vignette)"
                      value={mediaValueFromProps(block.propsJson)}
                      onChange={(next) => patchMediaProps(patch, next)}
                    />
                    <FieldHint>
                      {isPromo
                        ? 'Utilisé comme fond si type « Image HD » dans Avancé, sinon visuel split.'
                        : 'Image véhicule ou lifestyle pour la zone média de la bannière.'}
                    </FieldHint>
                  </div>
                )}

                {isMediaOnly && (
                  <>
                    <MediaFieldControl
                      label="Importer une image"
                      value={mediaValueFromProps(block.propsJson)}
                      onChange={(next) => patchMediaProps(patch, next)}
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="v3-inspector-aspect-ratio" className="text-neutral-400">
                        Ratio d&apos;aspect
                      </Label>
                      <select
                        id="v3-inspector-aspect-ratio"
                        value={aspectRatio}
                        onChange={(e) => patch({ aspectRatio: e.target.value })}
                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
                      >
                        {MEDIA_ASPECT_RATIO_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <FieldHint>16:9, 4:3 ou 21:9 — cadre verrouillé avec coins arrondis.</FieldHint>
                    </div>
                  </>
                )}

                {isGallery &&
                  [0, 1, 2].map((index) => {
                    const images = Array.isArray(block.propsJson.images)
                      ? [
                          ...(block.propsJson.images as Array<{
                            url?: string;
                            alt?: string;
                            imageAssetId?: string;
                            objectFit?: 'cover' | 'contain';
                          }>),
                        ]
                      : [];
                    while (images.length < 3) images.push({ url: '', alt: '' });
                    const image = images[index] ?? { url: '', alt: '' };
                    return (
                      <MediaFieldControl
                        key={`gallery-${index}`}
                        label={`Image ${index + 1}`}
                        value={{
                          imageAssetId: image.imageAssetId,
                          imageUrl: image.url ?? '',
                          alt: image.alt,
                          objectFit: 'cover',
                        }}
                        onChange={(next) => {
                          images[index] = {
                            ...image,
                            url: next.imageAssetId ? '' : (next.imageUrl ?? ''),
                            imageAssetId: next.imageAssetId,
                            alt: next.alt,
                            objectFit: next.objectFit ?? 'cover',
                          };
                          patch({ images });
                        }}
                      />
                    );
                  })}

                {isVideoEmbed && (
                  <div className="space-y-1.5">
                    <Label htmlFor="v3-inspector-video-url" className="text-neutral-400">
                      URL vidéo (YouTube / Vimeo)
                    </Label>
                    <ShadInput
                      id="v3-inspector-video-url"
                      value={asPropString(block.propsJson.videoUrl)}
                      onChange={(e) => patch({ videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="border-neutral-700 bg-neutral-900 font-mono text-xs text-neutral-200"
                    />
                    <FieldHint>Lien watch YouTube ou page Vimeo — embed généré automatiquement.</FieldHint>
                  </div>
                )}

                {isHeroVehicleOffer && (
                  <p className="text-xs text-neutral-500">
                    Images hero et recadrage — onglet Contenu (inspecteur hero véhicule).
                  </p>
                )}

                {isCampaignLeadHero && (
                  <p className="text-xs text-neutral-500">
                    Images campagne — onglet Contenu (inspecteur hero campagne + lead).
                  </p>
                )}

                {!isHero &&
                  !isPromo &&
                  !isMediaOnly &&
                  !isGallery &&
                  !isVideoEmbed &&
                  !isHeroVehicleOffer &&
                  !isCampaignLeadHero && (
                  <p className="text-xs text-neutral-500">
                    Aucun champ média pour ce type de bloc.
                  </p>
                )}
              </div>
            )}

            {tab === 'advanced' && (
              <div className="space-y-4">
                {isPromo && (
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Arrière-plan plein écran
                    </p>
                    <BackgroundInspectorFields
                      blockId={block.id}
                      propsJson={block.propsJson}
                      onPatch={updateBlockProps}
                    />
                  </div>
                )}

                {isHero && !isPromo && (
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Arrière-plan avancé
                    </p>
                    {!heroBgActive ? (
                      <>
                        <ShadButton
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-full border-neutral-700 bg-neutral-800 text-neutral-200"
                          onClick={() => patch({ backgroundType: 'image' })}
                        >
                          Activer arrière-plan avancé
                        </ShadButton>
                        <FieldHint>Remplace le fond par une couleur ou une image HD.</FieldHint>
                      </>
                    ) : (
                      <>
                        <BackgroundInspectorFields
                          blockId={block.id}
                          propsJson={block.propsJson}
                          onPatch={updateBlockProps}
                        />
                        <ShadButton
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="mt-3 w-full border-neutral-700 text-neutral-400"
                          onClick={() =>
                            patch({ backgroundType: '', parallaxEnabled: false })
                          }
                        >
                          Désactiver arrière-plan avancé
                        </ShadButton>
                      </>
                    )}
                  </div>
                )}

                {(isPromo || isHero) && (
                  <ProFormDesignFields
                    propsJson={block.propsJson}
                    onPatch={(p) => patch(p)}
                    showFormCard={isPromo}
                  />
                )}

                {!isPromo && !isHero && (
                  <p className="text-xs text-neutral-500">
                    Paramètres avancés spécifiques — ancre et espacement dans Layout.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
