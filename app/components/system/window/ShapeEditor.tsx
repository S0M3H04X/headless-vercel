// app/components/system/window/ShapeEditor.tsx
'use client';
import React, { useRef } from 'react';
import styles from './PolygonFrame.module.scss';
import { Point } from '@/hooks/usePolygon';

interface ShapeEditorProps {
  points: Point[];
  width: number;
  height: number;
  onMoveVertex: (index: number, pos: Point) => void;
  onAddVertex: (index: number, pos: Point) => void;
}

export const ShapeEditor: React.FC<ShapeEditorProps> = ({
  points,
  width,
  height,
  onMoveVertex,
  onAddVertex,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper to convert mouse event to local coordinates
  const getLocalCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleDrag = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent drag from bubbling to window drag

    const startPos = getLocalCoords(e);
    const startPoint = points[index];

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      // Simple drag logic - in real app might need more robust hook
      // Re-calculating bounds based on client coordinates
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;

      const x = Math.min(Math.max(0, clientX - rect.left), width);
      const y = Math.min(Math.max(0, clientY - rect.top), height);

      onMoveVertex(index, { x, y });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  // Calculate midpoints for "ghost" handles to add new vertices
  const midpoints = points.map((p1, i) => {
    const p2 = points[(i + 1) % points.length];
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
      index: i
    };
  });

  return (
    <div className={styles.editorLayer}>
      <svg ref={svgRef} className={styles.svgFrame} viewBox={`0 0 ${width} ${height}`}>
        {/* Render Lines for visual feedback */}
        <path
          d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z'}
          fill="none"
          stroke="#00ffff"
          strokeWidth="1"
          strokeDasharray="4 2"
        />

        {/* Existing Vertex Handles */}
        {points.map((p, i) => (
          <circle
            key={`vertex-${i}`}
            cx={p.x}
            cy={p.y}
            r={5}
            className={styles.resizeHandle}
            onMouseDown={(e) => handleDrag(i, e)}
            onTouchStart={(e) => handleDrag(i, e)}
          />
        ))}

        {/* Midpoint Handles (Add Vertex) */}
        {midpoints.map((p, i) => (
          <circle
            key={`mid-${i}`}
            cx={p.x}
            cy={p.y}
            r={4}
            className={styles.midpointHandle}
            onClick={() => onAddVertex(p.index, { x: p.x, y: p.y })}
          />
        ))}
      </svg>
    </div>
  );
};
