import { Check, MapPin, Minus, Plus, Save } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { TreeNodeData } from "../types";

interface GraphNode extends TreeNodeData {
  uid: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  level: number;
  color: string;
  radius: number;
  parentId?: string;
}

interface GraphLink {
  source: string; // uid
  target: string; // uid
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
}

interface ConstellationGraphProps {
  data: TreeNodeData;
  onNodeClick: (node: TreeNodeData) => void;
  selectedNodeId?: string;
  isDarkMode: boolean;
}

// Colors for branches
const COLORS = [
  "#2dd4bf", // Teal-400
  "#c084fc", // Purple-400
  "#fb7185", // Rose-400
  "#fbbf24", // Amber-400
  "#38bdf8", // Sky-400
  "#34d399", // Emerald-400
];

const ConstellationGraph: React.FC<ConstellationGraphProps> = ({
  data,
  onNodeClick,
  selectedNodeId,
  isDarkMode,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);

  // Viewport State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);

  // Hover State
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Save/Restore State
  const [hasSavedState, setHasSavedState] = useState(false);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  // Animation Frame Ref for Pan/Zoom
  const panZoomFrameRef = useRef<number | undefined>(undefined);

  // Touch Gesture Refs
  const initialPinchDist = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);

  const stopAnimation = () => {
    if (panZoomFrameRef.current) {
      cancelAnimationFrame(panZoomFrameRef.current);
      panZoomFrameRef.current = undefined;
    }
  };

  // Check for saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem("sadra_map_view");
    if (saved) {
      setHasSavedState(true);
    }
  }, []);

  const handleSaveView = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem("sadra_map_view", JSON.stringify(transform));
    setHasSavedState(true);
    setShowSaveFeedback(true);
    setTimeout(() => setShowSaveFeedback(false), 2000);
  };

  const handleRestoreView = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopAnimation();
    const saved = localStorage.getItem("sadra_map_view");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.x === "number" &&
          typeof parsed.y === "number" &&
          typeof parsed.k === "number"
        ) {
          setTransform(parsed);
        }
      } catch (err) {
        console.error("Failed to restore view", err);
      }
    }
  };

  // Zoom Handlers
  const handleZoomIn = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    stopAnimation();
    setTransform((prev) => ({ ...prev, k: Math.min(4, prev.k * 1.2) }));
  };

  const handleZoomOut = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    stopAnimation();
    setTransform((prev) => ({ ...prev, k: Math.max(0.1, prev.k / 1.2) }));
  };

  // Auto-center and animate to selected node
  useEffect(() => {
    if (selectedNodeId && nodes.length > 0) {
      const node = nodes.find((n) => n.uid === selectedNodeId);
      if (node) {
        stopAnimation();

        // Calculate target state
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Target Zoom: Zoom in a bit more for focus, but clamp it reasonable
        const targetK = Math.max(transform.k, 1.5);

        // Target Translation: Center the node
        const targetX = width / 2 - node.x * targetK;
        const targetY = height / 2 - node.y * targetK;

        // Animation Parameters
        const startX = transform.x;
        const startY = transform.y;
        const startK = transform.k;
        const startTime = performance.now();
        const duration = 1000; // 1s smooth glide

        const animate = (time: number) => {
          const elapsed = time - startTime;
          const t = Math.min(1, elapsed / duration);

          // Easing: Cubic Ease Out
          const ease = 1 - Math.pow(1 - t, 3);

          const currentX = startX + (targetX - startX) * ease;
          const currentY = startY + (targetY - startY) * ease;
          const currentK = startK + (targetK - startK) * ease;

          setTransform({ x: currentX, y: currentY, k: currentK });

          if (t < 1) {
            panZoomFrameRef.current = requestAnimationFrame(animate);
          } else {
            panZoomFrameRef.current = undefined;
          }
        };

        panZoomFrameRef.current = requestAnimationFrame(animate);
      }
    }
    return stopAnimation;
  }, [selectedNodeId, nodes]); // Using nodes as dep ensures we have positions, though physics modifies them mutably.

  // Flatten data into nodes and links with assigned colors
  useEffect(() => {
    const flatNodes: GraphNode[] = [];
    const flatLinks: GraphLink[] = [];

    // Recursive flattener
    const processNode = (
      node: TreeNodeData,
      level: number,
      parentId: string | null,
      colorIndex: number,
      angleRange: { start: number; end: number }
    ) => {
      const uid = node.id;

      // Determine color
      let assignedColor = "#94a3b8"; // default slate-400
      if (level === 1) {
        assignedColor = COLORS[colorIndex % COLORS.length];
      } else if (level > 1 && parentId) {
        // Inherit from parent
        const parent = flatNodes.find((n) => n.uid === parentId);
        assignedColor = parent ? parent.color : "#94a3b8";
      }

      // Initial Position Calculation
      const angle = angleRange.start + (angleRange.end - angleRange.start) / 2;

      // Radius based on hierarchy level for visual distinction
      // Level 0 (Root) > Level 1 > Level 2 > Level 3+
      let nodeRadius = 6;
      if (level === 0) nodeRadius = 35;
      else if (level === 1) nodeRadius = 22;
      else if (level === 2) nodeRadius = 12;
      else nodeRadius = 6;

      const spreadRadius = level * 160; // Distance between levels
      const startX = Math.cos(angle) * spreadRadius;
      const startY = Math.sin(angle) * spreadRadius;

      const graphNode: GraphNode = {
        ...node,
        uid,
        x: level === 0 ? 0 : startX + (Math.random() - 0.5) * 60,
        y: level === 0 ? 0 : startY + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        level,
        color: assignedColor,
        radius: nodeRadius,
        parentId: parentId || undefined,
      };

      flatNodes.push(graphNode);

      if (parentId) {
        flatLinks.push({ source: parentId, target: uid });
      }

      if (node.children) {
        const step = (angleRange.end - angleRange.start) / node.children.length;
        node.children.forEach((child, idx) => {
          processNode(
            child,
            level + 1,
            uid,
            level === 0 ? idx : colorIndex, // Assign new index only at level 1
            {
              start: angleRange.start + idx * step,
              end: angleRange.start + (idx + 1) * step,
            }
          );
        });
      }
    };

    processNode(data, 0, null, 0, { start: 0, end: Math.PI * 2 });

    // Link object references
    const linkObjects = flatLinks
      .map((l) => ({
        source: l.source,
        target: l.target,
        sourceNode: flatNodes.find((n) => n.uid === l.source),
        targetNode: flatNodes.find((n) => n.uid === l.target),
      }))
      .filter((l) => l.sourceNode && l.targetNode);

    setNodes(flatNodes);
    setLinks(linkObjects);

    // Center viewport initially
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    setTransform({
      x: width / 2,
      y: height / 2,
      k: isMobile ? 0.45 : 0.7,
    });
  }, [data]);

  // Identify related nodes (Parent + Children + Self) for highlighting
  const relatedIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ids = new Set<string>();
    ids.add(hoveredNodeId);

    // Find parent
    const hoveredNode = nodes.find((n) => n.uid === hoveredNodeId);
    if (hoveredNode?.parentId) {
      ids.add(hoveredNode.parentId);
    }

    // Find children
    nodes.forEach((n) => {
      if (n.parentId === hoveredNodeId) {
        ids.add(n.uid);
      }
    });

    return ids;
  }, [hoveredNodeId, nodes]);

  // Retrieve the full object of the hovered node for the tooltip
  const hoveredNode = useMemo(() => {
    if (!hoveredNodeId) return null;
    return nodes.find((n) => n.uid === hoveredNodeId);
  }, [nodes, hoveredNodeId]);

  // Physics Engine Loop
  useEffect(() => {
    if (nodes.length === 0) return;

    let animationFrameId: number;

    const tick = () => {
      // 1. Forces
      const REPULSION = 8000;
      const SPRING_LENGTH = 130;
      const SPRING_STRENGTH = 0.06;
      const CENTER_GRAVITY = 0.005;
      const DAMPING = 0.85;

      // Reset forces or apply gravity
      nodes.forEach((node) => {
        if (node === activeNode) return;

        node.vx += (0 - node.x) * CENTER_GRAVITY;
        node.vy += (0 - node.y) * CENTER_GRAVITY;
      });

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          let distSq = dx * dx + dy * dy;
          if (distSq === 0) distSq = 1;

          const dist = Math.sqrt(distSq);
          const force = REPULSION / distSq;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (a !== activeNode) {
            a.vx += fx;
            a.vy += fy;
          }
          if (b !== activeNode) {
            b.vx -= fx;
            b.vy -= fy;
          }
        }
      }

      // Spring
      links.forEach((link) => {
        const source = link.sourceNode!;
        const target = link.targetNode!;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = (dist - SPRING_LENGTH) * SPRING_STRENGTH;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (source !== activeNode) {
          source.vx += fx;
          source.vy += fy;
        }
        if (target !== activeNode) {
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // Update Positions
      nodes.forEach((node) => {
        if (node === activeNode) return;

        node.x += node.vx;
        node.y += node.vy;

        node.vx *= DAMPING;
        node.vy *= DAMPING;
      });

      // Direct DOM manipulation
      nodes.forEach((node) => {
        const el = document.getElementById(`node-${node.uid}`);
        const labelEl = document.getElementById(`label-${node.uid}`);
        const glowEl = document.getElementById(`glow-${node.uid}`);
        if (el) {
          el.setAttribute("cx", node.x.toString());
          el.setAttribute("cy", node.y.toString());
        }
        if (glowEl) {
          glowEl.setAttribute("cx", node.x.toString());
          glowEl.setAttribute("cy", node.y.toString());
        }
        if (labelEl) {
          labelEl.setAttribute("x", node.x.toString());
          labelEl.setAttribute("y", (node.y + node.radius + 15).toString());
        }
      });

      links.forEach((link, i) => {
        const el = document.getElementById(`link-${i}`);
        if (el && link.sourceNode && link.targetNode) {
          el.setAttribute("x1", link.sourceNode.x.toString());
          el.setAttribute("y1", link.sourceNode.y.toString());
          el.setAttribute("x2", link.targetNode.x.toString());
          el.setAttribute("y2", link.targetNode.y.toString());
        }
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, links, activeNode]);

  // Mouse Event Handlers
  const handleWheel = (e: React.WheelEvent) => {
    stopAnimation();
    const scaleSensitivity = 0.001;
    const newK = Math.max(
      0.1,
      Math.min(4, transform.k - e.deltaY * scaleSensitivity)
    );
    setTransform((prev) => ({ ...prev, k: newK }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).tagName !== "circle") {
      stopAnimation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeNode) {
      const dx = e.movementX / transform.k;
      const dy = e.movementY / transform.k;
      activeNode.x += dx;
      activeNode.y += dy;
      activeNode.vx = 0;
      activeNode.vy = 0;
    } else if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveNode(null);
    initialPinchDist.current = null;
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    setActiveNode(node);
    onNodeClick(node);
  };

  // Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    // Double tap detection
    if (e.touches.length === 1 && now - lastTapTime.current < 300) {
      stopAnimation();
      // Zoom in around the center (simple zoom for now)
      setTransform((prev) => ({ ...prev, k: Math.min(4, prev.k * 1.5) }));
      lastTapTime.current = 0;
      return;
    }
    lastTapTime.current = now;

    if (e.touches.length === 2) {
      // Pinch Start
      stopAnimation();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDist.current = dist;
    } else if ((e.target as Element).tagName !== "circle") {
      // Single Finger Pan Start
      stopAnimation();
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDist.current) {
      // Pinch Zoom
      e.preventDefault(); // Stop default browser zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      const scaleFactor = dist / initialPinchDist.current;
      // Damping for smoother feel
      const dampedFactor = 1 + (scaleFactor - 1) * 0.8;

      setTransform((prev) => ({
        ...prev,
        k: Math.max(0.1, Math.min(4, prev.k * dampedFactor)),
      }));

      initialPinchDist.current = dist;
    } else if (e.touches.length === 1) {
      // Single Finger Pan/Drag
      const touch = e.touches[0];

      if (activeNode) {
        // This logic is duplicated in handleNodeTouchMove, but needed here if event bubbles or target is lost
        // Typically handled by specialized node handler
      } else if (isDragging) {
        const dx = touch.clientX - dragStart.x;
        const dy = touch.clientY - dragStart.y;
        setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setDragStart({ x: touch.clientX, y: touch.clientY });
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Specialized touch handler for nodes to enable dragging them on mobile
  const handleNodeTouchStart = (e: React.TouchEvent, node: GraphNode) => {
    e.stopPropagation();
    setActiveNode(node);
    onNodeClick(node);
    // Initialize last position for touch dragging calculations
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleNodeTouchMove = (e: React.TouchEvent, node: GraphNode) => {
    e.stopPropagation();
    if (activeNode === node) {
      const touch = e.touches[0];
      const dx = (touch.clientX - dragStart.x) / transform.k;
      const dy = (touch.clientY - dragStart.y) / transform.k;

      node.x += dx;
      node.y += dy;
      node.vx = 0;
      node.vy = 0;

      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  return (
    <div
      className="w-full h-full cursor-move relative overflow-hidden"
      style={{ touchAction: "none" }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full block"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <g
          transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
        >
          {/* Links */}
          {links.map((link, i) => {
            const isConnected = hoveredNodeId
              ? link.source === hoveredNodeId || link.target === hoveredNodeId
              : false;

            // Dynamic styling
            const strokeOpacity = hoveredNodeId
              ? isConnected
                ? 0.6
                : 0.05
              : isDarkMode
              ? 0.2
              : 0.3;

            const strokeWidth =
              hoveredNodeId && isConnected ? 3 : isDarkMode ? 1.5 : 2;

            return (
              <line
                key={`link-${i}`}
                id={`link-${i}`}
                stroke={
                  isDarkMode ? link.sourceNode?.color || "#334155" : "#94a3b8"
                }
                strokeOpacity={strokeOpacity}
                strokeWidth={strokeWidth}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.uid;
            const isHovered = hoveredNodeId === node.uid;
            const isRelated = relatedIds.has(node.uid);
            const isDimmed = hoveredNodeId ? !isRelated : false;

            // --- HIERARCHY LEVEL STYLING SCHEMES ---

            let fill = isDarkMode ? "#0f172a" : "#ffffff";
            let fillOpacity = 1;
            let stroke = node.color;
            let strokeWidth = 2;

            // Level 0: ROOT
            if (node.level === 0) {
              fill = isDarkMode ? "#f8fafc" : "#1e293b";
              stroke = "#fbbf24"; // Amber/Gold border
              strokeWidth = isSelected ? 8 : 4; // Thicker if selected
            }
            // Level 1: MAJOR PILLARS
            else if (node.level === 1) {
              fill = node.color;
              fillOpacity = isDarkMode ? 0.15 : 0.1;
              strokeWidth = isSelected ? 5 : 2.5; // Thicker if selected
            }
            // Level 2: CONCEPTS
            else if (node.level === 2) {
              fill = isDarkMode ? "#0f172a" : "#ffffff";
              strokeWidth = isSelected ? 4 : 1.5; // Thicker if selected
            }
            // Level 3+: DETAILS
            else {
              fill = node.color;
              strokeWidth = isSelected ? 3 : 0; // Show stroke if selected
            }

            return (
              <g
                key={node.uid}
                className="transition-all duration-300"
                style={{ opacity: isDimmed ? 0.1 : 1 }}
                onMouseEnter={() => setHoveredNodeId(node.uid)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Glow Effect & Extended Touch Target */}
                <circle
                  id={`glow-${node.uid}`}
                  r={node.radius * (isSelected ? 3.0 : isHovered ? 2.5 : 1.8)} // Extra large glow for selected
                  fill={node.color}
                  opacity={
                    isSelected ? 0.5 : isHovered ? 0.3 : isDarkMode ? 0.05 : 0
                  } // Higher opacity for selected
                  className="transition-all duration-300 cursor-pointer"
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onTouchStart={(e) => handleNodeTouchStart(e, node)}
                  onTouchMove={(e) => handleNodeTouchMove(e, node)}
                />

                {/* Main Node Body */}
                <circle
                  id={`node-${node.uid}`}
                  r={node.radius * (isHovered ? 1.15 : 1)}
                  fill={fill}
                  fillOpacity={fillOpacity}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onTouchStart={(e) => handleNodeTouchStart(e, node)}
                  onTouchMove={(e) => handleNodeTouchMove(e, node)}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    filter: isSelected
                      ? `drop-shadow(0 0 20px ${node.color})` // Strong glow for selected
                      : isHovered
                      ? `drop-shadow(0 0 10px ${node.color})`
                      : node.level === 0
                      ? `drop-shadow(0 0 15px ${node.color})`
                      : "none",
                  }}
                />

                {/* Text Label */}
                <text
                  id={`label-${node.uid}`}
                  textAnchor="middle"
                  fill={
                    isSelected || isHovered
                      ? isDarkMode
                        ? "#fff"
                        : "#0f172a"
                      : isDarkMode
                      ? node.color
                      : "#334155"
                  }
                  fontSize={node.level === 0 ? 18 : node.level === 1 ? 15 : 12}
                  fontWeight={
                    node.level <= 1 || isHovered || isSelected
                      ? "bold"
                      : "normal"
                  }
                  opacity={
                    node.level > 2 && !isSelected && !isHovered ? 0.7 : 1
                  }
                  className="pointer-events-none select-none font-sans transition-all duration-300"
                  style={{
                    textShadow: isDarkMode
                      ? "0 2px 4px rgba(0,0,0,0.8)"
                      : "0 1px 2px rgba(255,255,255,0.8)",
                  }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip Overlay */}
      {hoveredNode && hoveredNode.description && (
        <div
          className="absolute z-20 pointer-events-none px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-200 animate-in fade-in zoom-in-95 max-w-[280px] text-center"
          style={{
            left: hoveredNode.x * transform.k + transform.x,
            top:
              hoveredNode.y * transform.k +
              transform.y +
              (hoveredNode.radius + 35) * transform.k,
            transform: "translateX(-50%)",
            backgroundColor: isDarkMode
              ? "rgba(15, 23, 42, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
            borderColor: isDarkMode
              ? "rgba(51, 65, 85, 0.5)"
              : "rgba(226, 232, 240, 0.8)",
            color: isDarkMode ? "#f1f5f9" : "#1e293b",
          }}
        >
          <p className="text-sm font-medium leading-relaxed">
            {hoveredNode.description}
          </p>
        </div>
      )}

      {/* Save / Restore & Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 pointer-events-auto items-end">
        {/* Zoom Controls */}
        <div className="flex flex-col bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-1">
          <button
            onClick={handleZoomIn}
            className="p-3 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors active:bg-slate-100 dark:active:bg-slate-600"
            aria-label="تكبير"
            title="تكبير"
          >
            <Plus size={20} />
          </button>
          <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700"></div>
          <button
            onClick={handleZoomOut}
            className="p-3 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors active:bg-slate-100 dark:active:bg-slate-600"
            aria-label="تصغير"
            title="تصغير"
          >
            <Minus size={20} />
          </button>
        </div>

        <button
          onClick={handleSaveView}
          className="group relative bg-white/90 dark:bg-slate-800/90 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95"
          aria-label="حفظ المشهد الحالي"
          title="حفظ المشهد الحالي"
        >
          {showSaveFeedback ? (
            <Check size={20} className="text-emerald-500" />
          ) : (
            <Save size={20} />
          )}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            حفظ المشهد
          </span>
        </button>

        {hasSavedState && (
          <button
            onClick={handleRestoreView}
            className="group relative bg-white/90 dark:bg-slate-800/90 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95"
            aria-label="استعادة المشهد المحفوظ"
            title="استعادة المشهد المحفوظ"
          >
            <MapPin size={20} />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              استعادة المشهد
            </span>
          </button>
        )}
      </div>

      {/* Legend / Overlay Info */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-slate-600 dark:text-slate-400 text-xs shadow-sm transition-colors duration-300 max-w-[200px] md:max-w-none">
          <p className="mb-1 text-slate-900 dark:text-slate-200 font-bold hidden md:block">
            الملاحة
          </p>
          <ul className="space-y-1">
            <li className="hidden md:block">• سحب الخلفية للتحريك</li>
            <li className="hidden md:block">• عجلة الفأرة للتكبير/التصغير</li>
            <li className="md:hidden">• اسحب الشاشة للتجول</li>
            <li className="md:hidden">• اضغط على الدوائر للتفاصيل</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConstellationGraph;
