// app/components/system/window/PolygonFrame.tsx
'use client';
import React, { useMemo } from 'react';
import styles from './PolygonFrame.module.scss';
import { Point } from '@/hooks/usePolygon';

interface PolygonFrameProps {
  points: Point[];
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PolygonFrame: React.FC<PolygonFrameProps> = ({
  points,
  width,
  height,
  className,
  style,
}) => {
  // Convert points array to SVG path string "M x1,y1 L x2,y2 ... Z"
  const pathData = useMemo(() => {
    if (!points || points.length === 0) return '';

    // Scale points to current width/height if generic 0-1 coords were used, 
    // but assuming points are in local pixels for now based on useDraggable context
    return points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
    ).join(' ') + ' Z';
  }, [points]);

  // Create clip-path for content
  // Note: This needs to be applied to the content container, likely passed up or controlled here
  // For now, this component just renders the visual frame background

  return (
    <div className={`${styles.polygonContainer} ${className || ''}`} style={style}>
      <svg className={styles.svgFrame} viewBox={`0 0 ${width} ${height}`}>
        {/* Main background fill */}
        <path
          d={pathData}
          className={styles.framePath}
        />

        {/* Optional: Add bevel effect paths here if needed */}
        {/* For a simple 3D effect on arbitrary shapes, we often duplicate the path with small offsets */}
      </svg>
    </div>
  );
};

// Helper to generate CSS clip-path polygon string
export const getClipPath = (points: Point[]) => {
  if (!points || points.length === 0) return 'none';
  return `polygon(${points.map(p => `${p.x}px ${p.y}px`).join(', ')})`;
};
