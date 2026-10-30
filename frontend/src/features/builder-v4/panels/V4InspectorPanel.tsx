import { V4InspectorContent } from './inspector/V4InspectorContent';

export function V4InspectorPanel() {
  return (
    <div className="v4-panel v4-inspector-panel v4-inspector-panel--v2" data-testid="inspector-panel">
      <V4InspectorContent />
    </div>
  );
}
