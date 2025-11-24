import React, { useState } from 'react';
import { TreeNodeData } from '../types';
import { ChevronDown, ChevronLeft, Circle, Disc } from 'lucide-react';

interface TreeVisualizationProps {
  data: TreeNodeData;
  onNodeClick: (node: TreeNodeData) => void;
  selectedNodeId?: string;
  depth?: number;
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ 
  data, 
  onNodeClick, 
  selectedNodeId, 
  depth = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = data.children && data.children.length > 0;
  const isSelected = selectedNodeId === data.id;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Dynamic classes for styling
  const nodeBaseClasses = `
    relative flex items-center p-3 rounded-xl border transition-all duration-300 cursor-pointer
    ${isSelected 
      ? 'bg-teal-900/40 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
      : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
    }
  `;

  // Colors based on depth to visually separate hierarchy levels
  const depthColors = [
    'border-l-4 border-l-teal-500', // Root
    'border-l-4 border-l-emerald-500',
    'border-l-4 border-l-cyan-500',
    'border-l-4 border-l-sky-500',
    'border-l-4 border-l-blue-500',
  ];
  const accentClass = depthColors[Math.min(depth, depthColors.length - 1)];

  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center">
        {/* Node Card */}
        <div 
          className={`${nodeBaseClasses} ${accentClass} min-w-[200px] max-w-[320px]`}
          onClick={() => onNodeClick(data)}
        >
          {/* Icon based on hasChildren */}
          <div className="ml-3 text-slate-400">
            {hasChildren ? (
                isExpanded ? <Disc size={18} className="text-teal-400" /> : <Circle size={18} />
            ) : (
                <div className="w-2 h-2 rounded-full bg-slate-500 ml-1"></div>
            )}
          </div>

          <div className="flex-grow">
            <h3 className={`text-sm font-medium ${isSelected ? 'text-teal-50' : 'text-slate-200'}`}>
              {data.label}
            </h3>
          </div>

          {/* Expand/Collapse Toggle */}
          {hasChildren && (
            <button 
              onClick={toggleExpand}
              className="mr-2 p-1 rounded-full hover:bg-slate-700 text-slate-500 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>
        
        {/* Horizontal Connector Line (Visual only, for tree look) */}
        {hasChildren && isExpanded && (
            <div className="w-8 h-[2px] bg-slate-700 hidden md:block"></div>
        )}
      </div>

      {/* Children Container */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col pr-8 md:pr-0 md:flex-row md:items-start relative">
            {/* Vertical Line for mobile/desktop hierarchy */}
            <div className="absolute top-0 right-6 bottom-0 w-[2px] bg-slate-800 md:hidden"></div>
            
            <div className="md:ml-12 md:pl-4 md:border-l-2 md:border-slate-800 md:pt-4 space-y-4 md:space-y-4">
                {data.children!.map((child) => (
                    <div key={child.id} className="relative">
                        {/* Horizontal connector for desktop children */}
                        <div className="absolute top-6 -left-4 w-4 h-[2px] bg-slate-800 hidden md:block"></div>
                        <TreeVisualization 
                            data={child} 
                            onNodeClick={onNodeClick} 
                            selectedNodeId={selectedNodeId}
                            depth={depth + 1}
                        />
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default TreeVisualization;
