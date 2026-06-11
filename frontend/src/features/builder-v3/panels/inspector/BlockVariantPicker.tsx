import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import {
  getBlockVariantsForType,
  hasBlockVariants,
} from '@/features/builder/block-variants';

type BlockVariantPickerProps = {
  block: BuilderDocumentBlock;
};

export function BlockVariantPicker({ block }: BlockVariantPickerProps) {
  const applyBlockVariant = useBuilderDocumentStore((s) => s.applyBlockVariant);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [focusPulse, setFocusPulse] = useState(false);

  const variants = getBlockVariantsForType(block.type);

  useEffect(() => {
    function handleFocusVariants(event: Event) {
      const detail = (event as CustomEvent<{ blockId?: string }>).detail;
      if (detail?.blockId && detail.blockId !== block.id) return;
      setFocusPulse(true);
      const el = document.getElementById(`block-variant-picker-${block.id}`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      window.setTimeout(() => setFocusPulse(false), 1200);
    }

    window.addEventListener('studio:focus-variants', handleFocusVariants);
    return () => window.removeEventListener('studio:focus-variants', handleFocusVariants);
  }, [block.id]);

  if (!hasBlockVariants(block.type) || variants.length === 0) {
    return null;
  }

  function handleApply(variantId: string) {
    const ok = applyBlockVariant(block.id, variantId);
    if (!ok) return;
    setAppliedId(variantId);
    window.setTimeout(() => setAppliedId(null), 1800);
  }

  return (
    <section
      id={`block-variant-picker-${block.id}`}
      className={`rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 transition-shadow ${
        focusPulse ? 'ring-1 ring-sky-500/60' : ''
      }`}
      data-testid="block-variant-picker"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-sky-400" aria-hidden />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
            Styles rapides
          </p>
          <p className="text-[11px] text-neutral-500">
            Variantes visuelles — votre contenu est conservé.
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2">
        {variants.map((variant) => {
          const isApplied = appliedId === variant.id;
          return (
            <li key={variant.id}>
              <button
                type="button"
                className={`group flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                  isApplied
                    ? 'border-emerald-700/60 bg-emerald-950/30'
                    : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
                onClick={() => handleApply(variant.id)}
                data-testid={`variant-card-${variant.id}`}
                aria-label={`Appliquer ${variant.name}`}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 text-sm text-sky-300"
                  aria-hidden
                >
                  {variant.previewLabel}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-medium text-neutral-100">
                      {variant.name}
                    </span>
                    {isApplied ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">
                    {variant.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
