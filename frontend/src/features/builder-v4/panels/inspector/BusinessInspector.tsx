import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { useBuilderV4Store } from '../../store/document.store';
import { resolveBusinessInspectorContext, type BusinessInspectorTab } from '../../lib/business-inspector-context';
import {
  HeroImageEffectsSection,
  HeroImageMobileSection,
  HeroImageOverlaySection,
  HeroRootGeometrySection,
  ImageCropSection,
  ImageMediaSection,
} from './InspectorSections';
import { DeleteBlockSection } from './DeleteBlockSection';
import { PageInspector } from './PageInspector';
import { SectionInspector } from './SectionInspector';
import { FormInspectorPanel } from './FormInspectorPanel';
import { HeroContentInspector } from './HeroContentInspector';
import { ContentBlocksSection } from './ContentBlocksSection';
import { useAssetsStore } from '../../store/assets.store';
import { isUserHeroMediaAssigned } from '../../media/hero-media-state';
import type { ImageNodeProps } from '../../types/nodes.types';

const TAB_LABELS: Record<BusinessInspectorTab, string> = {
  page: 'Page',
  hero: 'Mise en page',
  image: 'Image',
  content: 'Contenu',
  form: 'Formulaire',
  section: 'Section',
};

function ImageTabBody({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store((s) => s.getNode(nodeId));
  const getAsset = useAssetsStore((s) => s.getAsset);
  if (!node || node.kind !== 'image') return null;
  const assigned = isUserHeroMediaAssigned(node.props as ImageNodeProps, getAsset);

  return (
    <>
      <ImageMediaSection nodeId={nodeId} />
      <ImageCropSection nodeId={nodeId} />
      {assigned ? (
        <>
          <HeroImageOverlaySection nodeId={nodeId} />
          <HeroImageEffectsSection nodeId={nodeId} />
        </>
      ) : null}
      <HeroImageMobileSection nodeId={nodeId} />
    </>
  );
}

export function BusinessInspector({ nodeId }: { nodeId: string }) {
  const inspectorFocusTab = useBuilderV4Store((s) => s.inspectorFocusTab);
  const inspectorActiveTab = useBuilderV4Store((s) => s.inspectorActiveTab);
  const clearInspectorFocusTab = useBuilderV4Store((s) => s.clearInspectorFocusTab);
  const focusBusinessInspectorTab = useBuilderV4Store((s) => s.focusBusinessInspectorTab);
  const document = useBuilderV4Store((s) => s.document);
  const ctx = resolveBusinessInspectorContext(nodeId, document);

  useEffect(() => {
    if (!ctx || !inspectorFocusTab) return;
    if (ctx.tabs.includes(inspectorFocusTab)) {
      focusBusinessInspectorTab(inspectorFocusTab);
      clearInspectorFocusTab();
    }
  }, [inspectorFocusTab, ctx?.tabs, focusBusinessInspectorTab, clearInspectorFocusTab]);

  if (!ctx) return <PageInspector />;

  if (ctx.sectionBlockId && nodeId === ctx.sectionBlockId) {
    return <SectionInspector nodeId={ctx.sectionBlockId} />;
  }

  const deleteTargetId = ctx.heroBlockId ?? nodeId;
  const heroTabs = ctx.tabs.filter((t) => t !== 'page' && t !== 'section');
  const showHeroTabs = heroTabs.length > 0;
  const tab = ctx.tabs.includes(inspectorActiveTab) ? inspectorActiveTab : ctx.defaultTab;

  return (
    <div className="v4-business-inspector" data-testid="business-inspector">
      {ctx.tabs.includes('page') && !showHeroTabs ? (
        <div className="v4-business-inspector__scroll">
          <PageInspector />
        </div>
      ) : null}

      {showHeroTabs ? (
        <>
          <Tabs
            value={tab}
            onValueChange={(value) => focusBusinessInspectorTab(value as BusinessInspectorTab)}
            className="v4-business-inspector__tabs-root"
          >
          <div className="v4-business-inspector__tabs-sticky">
            <TabsList className="v4-business-inspector__tabs">
              {ctx.tabs.includes('page') ? (
                <TabsTrigger value="page" className="v4-business-inspector__tab" data-testid="inspector-tab-page">
                  {TAB_LABELS.page}
                </TabsTrigger>
              ) : null}
              {heroTabs.map((key) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="v4-business-inspector__tab"
                  data-testid={`inspector-tab-${key}`}
                >
                  {TAB_LABELS[key]}
                </TabsTrigger>
              ))}
            </TabsList>
            {ctx.heroBlockId ? <DeleteBlockSection nodeId={deleteTargetId} compact /> : null}
          </div>

          <div className="v4-business-inspector__scroll">
            {ctx.tabs.includes('page') ? (
              <TabsContent value="page" className="v4-business-inspector__panel">
                <PageInspector />
              </TabsContent>
            ) : null}

            {ctx.tabs.includes('hero') ? (
              <TabsContent value="hero" className="v4-business-inspector__panel">
                <HeroRootGeometrySection nodeId={ctx.frameId} businessMode />
                {ctx.heroBlockId ? <DeleteBlockSection nodeId={deleteTargetId} /> : null}
              </TabsContent>
            ) : null}

            {ctx.tabs.includes('image') && ctx.heroImageId ? (
              <TabsContent value="image" className="v4-business-inspector__panel">
                <ImageTabBody nodeId={ctx.heroImageId} />
              </TabsContent>
            ) : null}

            {ctx.tabs.includes('content') ? (
              <TabsContent value="content" className="v4-business-inspector__panel">
                <ContentBlocksSection />
                <HeroContentInspector frameId={ctx.frameId} />
              </TabsContent>
            ) : null}

            {ctx.tabs.includes('form') && ctx.leadFormId ? (
              <TabsContent value="form" className="v4-business-inspector__panel">
                <FormInspectorPanel nodeId={ctx.leadFormId} />
              </TabsContent>
            ) : null}
          </div>
        </Tabs>
      </>
      ) : null}
    </div>
  );
}
