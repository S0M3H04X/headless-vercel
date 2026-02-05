import React, { useEffect, useRef } from 'react';

interface NameGameProps {
  backgroundColor?: string;
  color?: string;
  fontSize?: number; // integer px
  className?: string;
  opacity?: number;
}

export const NameGame: React.FC<NameGameProps> = ({
  backgroundColor = 'black',
  color = 'green',
  fontSize = 14,
  className = '',
  opacity = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    // Base 30 FPS timing
    const interval = 1000 / 30;
    let timeSample = 0;

    // State
    const state = {
      frame: 0
    };

    const TAU = Math.PI * 2;

    const render = (t: number) => {
      const delta = t - timeSample;
      if (delta < interval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      timeSample = t - delta % interval;
      state.frame++;

      // Dimensions
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Update canvas size if needed
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Font metrics
      // Using a manually set font size for performance/simplicity
      // Assuming monospace for 'cell width' approximation (~0.6 * fontSize)
      const cellWidth = fontSize * 0.6;
      const lineHeight = fontSize * 1.2;
      const cols = Math.floor(width / cellWidth);
      const rows = Math.floor(height / lineHeight);

      // Clear
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = 'top';

      // Logic from name_game.js
      // const a = context.frame * 0.05
      // const f = Math.floor((1 - Math.cos(a)) * 10) + 1
      // const g = Math.floor(a / TAU) % 10 + 1
      // const i = coord.index % (coord.y * g + 1) % (f % context.cols)

      const a = state.frame * 0.05;
      const f = Math.floor((1 - Math.cos(a)) * 10) + 1;
      const g = Math.floor(a / TAU) % 10 + 1;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const index = x + y * cols;
          // Logic:
          // i = index % (y * g + 1) % (f % cols)
          const divisor1 = y * g + 1;
          const divisor2 = f % cols;

          let i = 0;
          // Safety check for modulo 0
          if (divisor1 !== 0 && divisor2 !== 0) {
            i = (index % divisor1) % divisor2;
          }

          const char = '1313Heart'[i] || ' ';

          ctx.fillText(char, x * cellWidth, y * lineHeight);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [backgroundColor, color, fontSize]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      // style={{ opacity }}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
