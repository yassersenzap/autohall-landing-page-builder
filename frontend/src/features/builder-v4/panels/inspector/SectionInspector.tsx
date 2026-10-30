import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { useBuilderV4Store } from '../../store/document.store';
import { getSectionBlockLabel } from '../../lib/studio-compat.js';
import { InspectorField, InspectorSection } from './InspectorPrimitives';
import {
  FillSection,
  BorderSection,
  ShadowSection,
  OpacitySection,
  LayoutSection,
} from './InspectorSections';
import type { SectionNodeProps } from '../../types/nodes.types';

const TABS = [
  { value: 'content', label: 'Contenu' },
  { value: 'style',   label: 'Style' },
] as const;

export function SectionInspector({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store((s) => s.document.nodes[nodeId]);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const updateNodeVisibility = useBuilderV4Store((s) => s.updateNodeVisibility);
  const updateNodeResponsive = useBuilderV4Store((s) => s.updateNodeResponsive);

  const [activeTab, setActiveTab] = useState<string>('content');

  if (!node || node.kind !== 'section') return null;

  const props = node.props as SectionNodeProps;
  const label = getSectionBlockLabel(node);
  const desktopVisible = !node.visibility?.hidden;
  const tabletVisible = !(node.responsive?.tablet?.hidden ?? node.visibility?.hidden);
  const mobileVisible = !(node.responsive?.mobile?.hidden ?? node.visibility?.hidden);

  return (
    <div className="v4-prop-inspector" data-testid="section-inspector">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="v4-prop-inspector__tabs-bar">
          <TabsList className="v4-prop-inspector__tablist">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="v4-prop-inspector__tab">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="v4-prop-inspector__scroll">

          {/* ── Contenu ──────────────────────────────────────── */}
          <TabsContent value="content" className="v4-prop-inspector__panel">
            <InspectorSection title="Section" value="id">
              <InspectorField label="Nom">
                <input
                  className="v4-prop-input"
                  value={props.label ?? label}
                  onChange={(e) => updateNodeProps(nodeId, { label: e.target.value })}
                  data-testid="section-label-input"
                />
              </InspectorField>
            </InspectorSection>

            <InspectorSection title="Visibilité" value="visibility">
              {[
                { label: 'Desktop', visible: desktopVisible, onChange: (v: boolean) => updateNodeVisibility(nodeId, { hidden: !v }) },
                { label: 'Tablet', visible: tabletVisible, onChange: (v: boolean) => updateNodeResponsive(nodeId, { tablet: { ...node.responsive?.tablet, hidden: !v } }) },
                { label: 'Mobile', visible: mobileVisible, onChange: (v: boolean) => updateNodeResponsive(nodeId, { mobile: { ...node.responsive?.mobile, hidden: !v } }) },
              ].map(({ label: lbl, visible, onChange }) => (
                <InspectorField key={lbl} label={lbl}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={visible} className="v4-prop-checkbox" onChange={(e) => onChange(e.target.checked)} />
                    <span className="text-xs text-zinc-500">{visible ? 'Visible' : 'Masqué'}</span>
                  </label>
                </InspectorField>
              ))}
            </InspectorSection>
          </TabsContent>

          {/* ── Style ────────────────────────────────────────── */}
          <TabsContent value="style" className="v4-prop-inspector__panel">
            <FillSection nodeId={nodeId} />
            <BorderSection nodeId={nodeId} />
            <ShadowSection nodeId={nodeId} />
            <OpacitySection nodeId={nodeId} />
            <LayoutSection nodeId={nodeId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
