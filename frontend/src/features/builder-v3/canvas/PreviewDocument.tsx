import type { CSSProperties } from 'react';
import { useEffect, useMemo } from 'react';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { shouldOmitBlockFromPublishedOutput } from '@/features/builder-engine/lib/block-visibility';
import { resolveThemeFonts } from '../constants/google-fonts';
import { applyPageSeoToDocument } from '../lib/apply-page-seo';
import { injectGoogleFonts } from './inject-google-fonts';
import { IframeBlockRenderer } from './blocks/IframeBlockRenderer';

type PreviewDocumentProps = {
  viewport?: 'desktop' | 'tablet' | 'mobile';
};

/** Rendu lecture seule — même source que l'éditeur (store Zustand hydraté). */
export function PreviewDocument({ viewport = 'desktop' }: PreviewDocumentProps) {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const pageTheme = useBuilderDocumentStore((s) => s.pageTheme);
  const pageSettings = useBuilderDocumentStore((s) => s.pageSettings);
  const { headingFont, bodyFont } = resolveThemeFonts(pageTheme);

  const sorted = useMemo(
    () =>
      [...blocks]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .filter((block) => !shouldOmitBlockFromPublishedOutput(block.propsJson, viewport)),
    [blocks, viewport],
  );

  useEffect(() => {
    injectGoogleFonts(document, headingFont, bodyFont);
  }, [headingFont, bodyFont]);

  useEffect(() => {
    applyPageSeoToDocument(document, pageSettings, {
      fallbackTitle: 'Aperçu campagne Auto Hall',
    });
  }, [pageSettings]);

  const docStyle = useMemo(
    () =>
      ({
        ['--lp-primary' as string]: pageTheme.primaryColor,
        ['--lp-primary-hover' as string]: pageTheme.primaryColor,
        ['--lp-primary-soft' as string]: `${pageTheme.primaryColor}1f`,
        ['--primary' as string]: pageTheme.primaryColor,
        ['--primary-hover' as string]: pageTheme.primaryColor,
        ['--font-heading' as string]: `"${headingFont}", system-ui, sans-serif`,
        ['--font-body' as string]: `"${bodyFont}", system-ui, sans-serif`,
        ['--lp-font' as string]: `"${bodyFont}", system-ui, sans-serif`,
        ['--lp-display-font' as string]: `"${headingFont}", system-ui, sans-serif`,
        fontFamily: `var(--font-body)`,
      }) as CSSProperties,
    [bodyFont, headingFont, pageTheme.primaryColor],
  );

  return (
    <div data-builder-v3-preview-root className="min-h-full">
      <article
        className="lp-document min-h-full"
        data-theme={pageTheme.mode}
        data-section-spacing={pageTheme.sectionSpacing}
        data-heading-scale={pageTheme.headingScale}
        data-button-style={pageTheme.buttonStyle}
        style={docStyle}
      >
        <main className="lp-page min-h-full">
          {sorted.map((block) => (
            <div key={block.id} className="v3-preview-block">
              <IframeBlockRenderer block={block} />
            </div>
          ))}
        </main>
      </article>
    </div>
  );
}
