import { useBuilderV4Store } from '../../store/document.store';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  FolderMinus,
  FolderPlus,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SectionControlsHeader({ nodeId }: { nodeId: string }) {
  const node = useBuilderV4Store((s) => s.document.nodes[nodeId]);
  const document = useBuilderV4Store((s) => s.document);
  const deleteNode = useBuilderV4Store((s) => s.deleteNode);
  const duplicateNode = useBuilderV4Store((s) => s.duplicateNode);
  const moveSection = useBuilderV4Store((s) => s.moveSection);
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const updateNodeVisibility = useBuilderV4Store((s) => s.updateNodeVisibility);
  const updateNodeResponsive = useBuilderV4Store((s) => s.updateNodeResponsive);
  const toggleLayerCollapsed = useBuilderV4Store((s) => s.toggleLayerCollapsed);
  const layersCollapsed = useBuilderV4Store((s) => s.layersCollapsed);

  if (!node) return null;

  const parentId = node.parentId;
  const parent = parentId ? document.nodes[parentId] : null;
  const index = parent ? parent.children.indexOf(nodeId) : -1;
  const isFirst = index === 0;
  const isLast = parent ? index === parent.children.length - 1 : true;

  const label = (node.props as { label?: string }).label ?? node.name ?? 'Section';
  const isHidden = node.visibility?.hidden ?? false;
  const isCollapsed = layersCollapsed[nodeId] ?? false;

  const desktopVisible = !node.visibility?.hidden;
  const tabletVisible = !(node.responsive?.tablet?.hidden ?? node.visibility?.hidden);
  const mobileVisible = !(node.responsive?.mobile?.hidden ?? node.visibility?.hidden);

  return (
    <div className="v4-section-controls-header border-b border-gray-100 bg-zinc-50/50 p-4 space-y-4" data-testid="section-controls-header">
      {/* Title & Rename */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Section Name</label>
        <input
          type="text"
          className="w-full bg-white border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded px-2.5 py-1.5 text-sm font-medium text-zinc-800 transition-all outline-none"
          value={label}
          onChange={(e) => updateNodeProps(nodeId, { label: e.target.value })}
          placeholder="Rename section..."
        />
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {/* Move Up */}
        <button
          type="button"
          onClick={() => moveSection(nodeId, 'up')}
          disabled={isFirst}
          className="flex flex-col items-center justify-center p-2 rounded bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white border border-zinc-200 transition-colors text-zinc-700"
          title="Move Up"
        >
          <ArrowUp size={16} />
          <span className="text-[9px] mt-1 font-medium">Up</span>
        </button>

        {/* Move Down */}
        <button
          type="button"
          onClick={() => moveSection(nodeId, 'down')}
          disabled={isLast}
          className="flex flex-col items-center justify-center p-2 rounded bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white border border-zinc-200 transition-colors text-zinc-700"
          title="Move Down"
        >
          <ArrowDown size={16} />
          <span className="text-[9px] mt-1 font-medium">Down</span>
        </button>

        {/* Duplicate */}
        <button
          type="button"
          onClick={() => duplicateNode(nodeId)}
          className="flex flex-col items-center justify-center p-2 rounded bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors text-zinc-700"
          title="Duplicate"
        >
          <Copy size={16} />
          <span className="text-[9px] mt-1 font-medium">Clone</span>
        </button>

        {/* Hide / Show */}
        <button
          type="button"
          onClick={() => updateNodeVisibility(nodeId, { hidden: !isHidden })}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded border transition-colors",
            isHidden 
              ? "bg-zinc-100 border-zinc-300 text-zinc-500" 
              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100"
          )}
          title={isHidden ? "Show Section" : "Hide Section"}
        >
          {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
          <span className="text-[9px] mt-1 font-medium">{isHidden ? "Hidden" : "Hide"}</span>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => deleteNode(nodeId)}
          className="flex flex-col items-center justify-center p-2 rounded bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-zinc-200 transition-colors text-zinc-700"
          title="Delete"
        >
          <Trash2 size={16} />
          <span className="text-[9px] mt-1 font-medium">Delete</span>
        </button>
      </div>

      {/* Breakpoint Visibility & Collapse */}
      <div className="flex items-center justify-between pt-1">
        {/* Device Visibility icons */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Viewport:</span>
          
          {/* Desktop */}
          <button
            type="button"
            onClick={() => updateNodeVisibility(nodeId, { hidden: !desktopVisible })}
            className={cn(
              "p-1.5 rounded border transition-colors",
              desktopVisible 
                ? "bg-orange-50 border-orange-200 text-orange-600" 
                : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"
            )}
            title="Desktop Visibility"
          >
            <Monitor size={14} />
          </button>

          {/* Tablet */}
          <button
            type="button"
            onClick={() => updateNodeResponsive(nodeId, { tablet: { ...node.responsive?.tablet, hidden: !tabletVisible } })}
            className={cn(
              "p-1.5 rounded border transition-colors",
              tabletVisible 
                ? "bg-orange-50 border-orange-200 text-orange-600" 
                : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"
            )}
            title="Tablet Visibility"
          >
            <Tablet size={14} />
          </button>

          {/* Mobile */}
          <button
            type="button"
            onClick={() => updateNodeResponsive(nodeId, { mobile: { ...node.responsive?.mobile, hidden: !mobileVisible } })}
            className={cn(
              "p-1.5 rounded border transition-colors",
              mobileVisible 
                ? "bg-orange-50 border-orange-200 text-orange-600" 
                : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"
            )}
            title="Mobile Visibility"
          >
            <Smartphone size={14} />
          </button>
        </div>

        {/* Collapse Layer */}
        <button
          type="button"
          onClick={() => toggleLayerCollapsed(nodeId)}
          className={cn(
            "flex items-center space-x-1 px-2.5 py-1 rounded border text-[10px] font-medium transition-colors",
            isCollapsed 
              ? "bg-zinc-100 border-zinc-300 text-zinc-600" 
              : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          )}
        >
          {isCollapsed ? <FolderPlus size={12} /> : <FolderMinus size={12} />}
          <span>{isCollapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>
    </div>
  );
}
