import { useState } from 'react';
import {
  selectActiveBlock,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  ScrollArea,
  Separator,
  ShadInput,
  Tabs,
} from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { GOOGLE_FONT_OPTIONS, resolveThemeFonts } from '../constants/google-fonts';
import { THEME_PRESETS } from '../constants/theme-presets';
import { BlockInspectorPanel } from './BlockInspectorPanel';

type InspectorTab = 'block' | 'theme';

function ThemeFields() {
  const pageTheme = useBuilderDocumentStore((s) => s.pageTheme);
  const setPageTheme = useBuilderDocumentStore((s) => s.setPageTheme);
  const { headingFont, bodyFont } = resolveThemeFonts(pageTheme);

  return (
    <div className="space-y-4 p-4">
      <Card className="border-neutral-800 bg-neutral-900/50 text-neutral-100">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-neutral-200">Thème global</CardTitle>
          <CardDescription className="text-xs text-neutral-500">
            Couleur et typographie — variables CSS injectées dans le canvas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <div className="grid grid-cols-2 gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors',
                  pageTheme.primaryColor === preset.primaryColor
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-700 bg-neutral-900 hover:border-neutral-500',
                )}
                onClick={() =>
                  setPageTheme({
                    primaryColor: preset.primaryColor,
                    secondaryColor: preset.secondaryColor,
                  })
                }
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-white/20"
                  style={{ backgroundColor: preset.primaryColor }}
                  aria-hidden
                />
                <span className="text-neutral-300">{preset.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="v3-theme-color" className="text-neutral-400">
              Couleur primaire
            </Label>
            <div className="flex gap-2">
              <input
                id="v3-theme-color-picker"
                type="color"
                value={pageTheme.primaryColor}
                onChange={(e) => setPageTheme({ primaryColor: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-neutral-700 bg-transparent"
                aria-label="Sélecteur couleur"
              />
              <ShadInput
                id="v3-theme-color"
                value={pageTheme.primaryColor}
                onChange={(e) => setPageTheme({ primaryColor: e.target.value })}
                className="border-neutral-700 bg-neutral-900 font-mono text-neutral-200"
              />
            </div>
            <p className="text-xs text-neutral-500">Boutons CTA, badges et accents de marque.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="v3-theme-heading-font" className="text-neutral-400">
              Police titres
            </Label>
            <select
              id="v3-theme-heading-font"
              value={headingFont}
              onChange={(e) =>
                setPageTheme({ headingFont: e.target.value, fontFamily: e.target.value })
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
            >
              {GOOGLE_FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="v3-theme-body-font" className="text-neutral-400">
              Police corps de texte
            </Label>
            <select
              id="v3-theme-body-font"
              value={bodyFont}
              onChange={(e) => setPageTheme({ bodyFont: e.target.value })}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
            >
              {GOOGLE_FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4"
            style={{ fontFamily: `"${bodyFont}", sans-serif` }}
          >
            <p
              className="text-lg font-bold text-neutral-100"
              style={{ fontFamily: `"${headingFont}", sans-serif` }}
            >
              Aperçu titre
            </p>
            <p className="text-xs text-neutral-400">Corps de texte — concession Auto Hall.</p>
            <div
              className="rounded-lg px-4 py-2 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: pageTheme.primaryColor }}
            >
              Bouton CTA
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RightInspector() {
  const [tab, setTab] = useState<InspectorTab>('block');
  const block = useBuilderDocumentStore(selectActiveBlock);
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const updateBlockProps = useBuilderDocumentStore((s) => s.updateBlockProps);
  const moveBlockUp = useBuilderDocumentStore((s) => s.moveBlockUp);
  const moveBlockDown = useBuilderDocumentStore((s) => s.moveBlockDown);
  const deleteBlock = useBuilderDocumentStore((s) => s.deleteBlock);

  const blockIndex = block ? blocks.findIndex((b) => b.id === block.id) : -1;

  return (
    <aside
      className="flex h-full w-[320px] shrink-0 flex-col border-l border-neutral-800 bg-neutral-950"
      data-builder-v3-right-inspector
    >
      <div className="space-y-3 border-b border-neutral-800 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Inspecteur
          </p>
          <p className="mt-0.5 truncate text-sm text-neutral-400">
            {tab === 'block'
              ? block
                ? block.label
                : 'Aucun bloc sélectionné'
              : 'Paramètres globaux'}
          </p>
        </div>
        <Tabs
          items={[
            { id: 'block', label: 'Bloc' },
            { id: 'theme', label: 'Thème global' },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Inspecteur studio"
          className="border-neutral-800 bg-neutral-900/80"
        />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {tab === 'block' ? (
          block ? (
            <BlockInspectorPanel
              block={block}
              updateBlockProps={updateBlockProps}
              onMoveUp={() => moveBlockUp(block.id)}
              onMoveDown={() => moveBlockDown(block.id)}
              onDelete={() => deleteBlock(block.id)}
              canMoveUp={blockIndex > 0}
              canMoveDown={blockIndex >= 0 && blockIndex < blocks.length - 1}
            />
          ) : (
            <p className="p-4 text-xs text-neutral-500">
              Cliquez un bloc dans le canvas pour éditer contenu, design et paramètres avancés.
            </p>
          )
        ) : (
          <ThemeFields />
        )}
      </ScrollArea>

      <Separator className="bg-neutral-800" />
      <p className="px-4 py-2 text-[0.625rem] text-neutral-600">
        Contenu · Design · Layout · Media · Avancé
      </p>
    </aside>
  );
}
