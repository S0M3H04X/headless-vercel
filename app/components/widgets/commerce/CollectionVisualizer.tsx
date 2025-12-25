// app/components/widgets/commerce/CollectionVisualizer.tsx
'use client';
import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  isLoading: boolean;
}

export const CollectionVisualizer: React.FC<VisualizerProps> = ({ isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
      if (canvasRef.current && !isLoading) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
              // 這裡未來會接上 Three.js 或其他視覺特效
              ctx.fillStyle = '#111';
              ctx.fillRect(0, 0, 200, 400);
              ctx.fillStyle = '#0f0';
              ctx.font = '12px monospace';
              ctx.fillText('VISUALIZER_MODULE_LOADED', 10, 20);
          }
      }
  }, [isLoading]);

  return (
      <div className="bg-black border-b border-gray-600 relative overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute bottom-2 right-2 text-white text-xs font-mono opacity-50">
              Interactive View (v0.1)
          </div>
      </div>
  );
};