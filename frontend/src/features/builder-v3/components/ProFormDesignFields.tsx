import { Label } from '@/components/ui/primitives';
import { FieldHint } from './BlockInspectorPanel.shared';

type ProFormDesignFieldsProps = {
  propsJson: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
  showFormCard?: boolean;
};

export function ProFormDesignFields({
  propsJson,
  onPatch,
  showFormCard = true,
}: ProFormDesignFieldsProps) {
  const formBorderRadius = Number.parseInt(String(propsJson.formBorderRadius ?? '16'), 10) || 16;
  const formGlassEffect = propsJson.formGlassEffect === true;
  const shapeDividerBottom = propsJson.shapeDividerBottom === true;

  return (
    <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Design Pro
      </p>

      {showFormCard && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="v3-form-radius" className="text-neutral-400">
                Rayon carte formulaire
              </Label>
              <span className="text-xs font-mono text-neutral-500">{formBorderRadius}px</span>
            </div>
            <input
              id="v3-form-radius"
              type="range"
              min={0}
              max={24}
              step={2}
              value={formBorderRadius}
              onChange={(e) => onPatch({ formBorderRadius: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <FieldHint>0px = angles droits · 24px = coins très arrondis (rounded-3xl).</FieldHint>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-2 text-xs text-neutral-300">
            <span>Effet Verre (glassmorphism)</span>
            <input
              type="checkbox"
              checked={formGlassEffect}
              onChange={(e) => onPatch({ formGlassEffect: e.target.checked })}
              className="rounded border-neutral-600"
            />
          </label>
          <FieldHint>Ajoute backdrop-blur-md et fond blanc semi-transparent.</FieldHint>
        </>
      )}

      <label className="flex cursor-pointer items-center justify-between gap-2 text-xs text-neutral-300">
        <span>Vague de transition (bas de section)</span>
        <input
          type="checkbox"
          checked={shapeDividerBottom}
          onChange={(e) => onPatch({ shapeDividerBottom: e.target.checked })}
          className="rounded border-neutral-600"
        />
      </label>
      <FieldHint>SVG fluide pour enchaîner visuellement vers le bloc suivant.</FieldHint>
    </div>
  );
}
