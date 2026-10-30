import { useBuilderV4Store } from '../../store/document.store';

export function SelectionLayer() {
  const selectedNodeIds = useBuilderV4Store((s) => s.selectedNodeIds);
  const count = selectedNodeIds.length;

  if (count <= 1) return null;

  return (
    <div className="v4-selection-layer" data-testid="canvas-selection-count" data-count={count}>
      <span className="v4-selection-layer__badge">{count} sélectionnés</span>
    </div>
  );
}
