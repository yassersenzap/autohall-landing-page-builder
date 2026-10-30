import { useBuilderV4Store } from '../../store/document.store';
import type { BuilderNode } from '../../types/nodes.types';
import { getProBlockType, isProBlock } from '../../lib/pro-blocks';
import {
  BrandNavbarBlock,
  SpecsGridBlock,
  ModelShowcaseGalleryBlock,
  ConversionFormSplitBlock,
  HeroShowroomBlock,
  HeroMosaicBlock,
  HeroCinematicBlock,
  HeroImmersiveFormBlock,
  CarouselBlock,
  ModelIdentityShowroom,
  ContactSectionBlock,
  ModelsGridBlock,
  useActiveTheme,
  AlternatingShowcaseBlock,
} from './ProBlockRenderers';
import { CampaignGammeThermiqueBlock } from './CampaignGammeThermique';
import { FooterBlock } from './FooterRenderer';
import { TacticalFlashCampaignBlock } from './TacticalFlashCampaign';
import { MultiStepTestDriveBlock } from './MultiStepTestDrive';
import type {
  BrandNavbarBlockProps,
  SpecsGridBlockProps,
  ModelShowcaseGalleryBlockProps,
  ConversionFormSplitBlockProps,
  HeroShowroomProps,
  HeroMosaicProps,
  HeroCinematicProps,
  HeroImmersiveFormProps,
  CarouselBlockProps,
  SpecsShowroomBlockProps,
  ContactSectionBlockProps,
  ModelsGridBlockProps,
  CampaignGammeThermiqueBlockProps,
  FooterBlockProps,
  AlternatingShowcaseBlockProps,
  TacticalFlashCampaignBlockProps,
  MultiStepTestDriveBlockProps,
} from '../../lib/pro-blocks';

type ProBlockViewProps = {
  node: BuilderNode;
  editorMode?: boolean;
};

export function ProBlockView({ node, editorMode = false }: ProBlockViewProps) {
  const blockType = getProBlockType(node);
  const props = node.props as any;
  const theme = useActiveTheme();

  const selectNode = useBuilderV4Store(s => s.selectNode);
  const setRightPanelOpen = useBuilderV4Store(s => s.setRightPanelOpen);

  if (!blockType || !props) return null;

  const themeStyle = `
    :root {
      --brand-primary: ${theme.primaryColor};
      --brand-secondary: ${theme.secondaryColor};
      --brand-radius: ${theme.buttonRadius};
      --brand-font: ${theme.fontFamily};
    }
  `;

  let element: React.ReactNode = null;

  switch (blockType) {
    case 'brand-navbar':
      element = <BrandNavbarBlock props={props as BrandNavbarBlockProps} />;
      break;
    case 'hero-showroom':
      element = <HeroShowroomBlock props={props as HeroShowroomProps} editorMode={editorMode} />;
      break;
    case 'hero-mosaic':
      element = <HeroMosaicBlock props={props as HeroMosaicProps} editorMode={editorMode} />;
      break;
    case 'hero-cinematic':
      element = <HeroCinematicBlock props={props as HeroCinematicProps} editorMode={editorMode} />;
      break;
    case 'hero-immersive-form':
      element = <HeroImmersiveFormBlock props={props as HeroImmersiveFormProps} editorMode={editorMode} />;
      break;
    case 'specs-grid':
      element = <SpecsGridBlock props={props as SpecsGridBlockProps} />;
      break;
    case 'model-showcase-gallery':
      element = <ModelShowcaseGalleryBlock props={props as ModelShowcaseGalleryBlockProps} />;
      break;
    case 'conversion-form-split':
      element = <ConversionFormSplitBlock props={props as ConversionFormSplitBlockProps} editorMode={editorMode} />;
      break;
    case 'carousel':
      element = <CarouselBlock props={props as CarouselBlockProps} />;
      break;
    case 'specs-showroom':
      element = <ModelIdentityShowroom props={props as SpecsShowroomBlockProps} />;
      break;
    case 'contact-section':
      element = <ContactSectionBlock props={props as ContactSectionBlockProps} editorMode={editorMode} />;
      break;
    case 'models-grid':
      element = <ModelsGridBlock props={props as ModelsGridBlockProps} />;
      break;
    case 'campaign-gamme-thermique':
      element = <CampaignGammeThermiqueBlock props={props as CampaignGammeThermiqueBlockProps} editorMode={editorMode} />;
      break;
    case 'footer-block':
      element = <FooterBlock props={props as FooterBlockProps} />;
      break;
    case 'alternating-showcase':
      element = <AlternatingShowcaseBlock props={props as AlternatingShowcaseBlockProps} />;
      break;
    case 'tactical-flash-campaign':
      element = <TacticalFlashCampaignBlock props={props as TacticalFlashCampaignBlockProps} editorMode={editorMode} />;
      break;
    case 'multi-step-test-drive':
      element = <MultiStepTestDriveBlock props={props as MultiStepTestDriveBlockProps} />;
      break;
  }

  const handleBlockClick = (e: React.MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    selectNode(node.id);
    setRightPanelOpen(true);
  };

  return (
    <div
      onClick={handleBlockClick}
      style={{ width: '100%', height: 'auto', minHeight: 0, margin: 0, padding: 0 }}
      data-testid={`pro-block-wrapper-${blockType}`}
    >
      <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      {element}
    </div>
  );
}

/** Returns true if section node should use ProBlockView (not node-tree rendering). */
export function isProBlockSection(node: BuilderNode): boolean {
  return node.kind === 'section' && isProBlock(node);
}
