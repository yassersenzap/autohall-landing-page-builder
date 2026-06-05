import type { CSSProperties } from 'react';

import { useEffect, useMemo } from 'react';

import {

  DndContext,

  PointerSensor,

  closestCenter,

  useSensor,

  useSensors,

  type DragEndEvent,

} from '@dnd-kit/core';

import {

  SortableContext,

  verticalListSortingStrategy,

} from '@dnd-kit/sortable';

import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';

import { resolveThemeFonts } from '../constants/google-fonts';

import { injectGoogleFonts } from './inject-google-fonts';

import { SortableCanvasBlock } from './SortableCanvasBlock';

import { CanvasEmptyState } from './CanvasEmptyState';

import { IframeBlockRenderer } from './blocks/IframeBlockRenderer';



export function CanvasDocument() {

  const blocks = useBuilderDocumentStore((s) => s.blocks);

  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);

  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);

  const reorderBlocks = useBuilderDocumentStore((s) => s.reorderBlocks);

  const pageTheme = useBuilderDocumentStore((s) => s.pageTheme);



  const { headingFont, bodyFont } = resolveThemeFonts(pageTheme);



  const sorted = useMemo(

    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),

    [blocks],

  );



  const blockIds = useMemo(() => sorted.map((b) => b.id), [sorted]);



  const sensors = useSensors(

    useSensor(PointerSensor, {

      activationConstraint: { distance: 4 },

    }),

  );



  useEffect(() => {

    const doc = document;

    injectGoogleFonts(doc, headingFont, bodyFont);

  }, [headingFont, bodyFont]);



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



  function handleDragEnd(event: DragEndEvent) {

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    reorderBlocks(String(active.id), String(over.id));

  }



  return (

    <div data-builder-v3-root className="min-h-full">

      <article

        className="lp-document min-h-full"

        data-theme={pageTheme.mode}

        data-section-spacing={pageTheme.sectionSpacing}

        data-heading-scale={pageTheme.headingScale}

        data-button-style={pageTheme.buttonStyle}

        style={docStyle}

      >

        <main className="lp-page min-h-full">

          {sorted.length === 0 ? (

            <CanvasEmptyState />

          ) : (

            <DndContext

              sensors={sensors}

              collisionDetection={closestCenter}

              onDragEnd={handleDragEnd}

            >

              <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>

                {sorted.map((block) => (

                  <SortableCanvasBlock

                    key={block.id}

                    block={block}

                    selected={selectedBlockId === block.id}

                    onSelect={selectBlock}

                  >

                    <IframeBlockRenderer block={block} />

                  </SortableCanvasBlock>

                ))}

              </SortableContext>

            </DndContext>

          )}

        </main>

      </article>

    </div>

  );

}


