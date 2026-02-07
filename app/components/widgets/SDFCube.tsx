/**
 * SDFCube.tsx
 * Interactive wireframe cube wallpaper ported from play.core
 */

import React, { useEffect, useRef } from 'react';
import { vec3, vec2, copy, rotX, rotY, rotZ, mulN, Vec3, Vec2 } from '@/lib/math/vec';
import { map, sdSegment } from '@/lib/math/sdf';

interface SDFCubeProps {
  className?: string; // Allow custom styling/positioning
}

export const SDFCube: React.FC<SDFCubeProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Constants from cube.js
    const l = 0.6;
    const boxVertices: Vec3[] = [
      vec3(l, l, l),
      vec3(-l, l, l),
      vec3(-l, -l, l),
      vec3(l, -l, l),
      vec3(l, l, -l),
      vec3(-l, l, -l),
      vec3(-l, -l, -l),
      vec3(l, -l, -l)
    ];

    const boxEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    const density = ' -=+1313HEART';
    const bgMatrix = [
      '┼──────',
      '│      ',
      '│      ',
      '│      ',
      '│      ',
      '│      ',
    ];
    const bgMatrixDim = vec2(bgMatrix[0].length, bgMatrix.length);

    let animationFrameId: number;
    const interval = 1000 / 60; // 60 FPS
    let timeSample = 0;

    const state = {
      time: 0,
      frame: 0
    };

    // Handle mouse movement
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Normalize to grid coordinates (approximate, refined in render loop)
      // Store raw pixels for now, mapping happens in loop
      mouseRef.current = { x, y };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      mouseRef.current = { x, y };
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handleTouchMove);

    const render = (t: number) => {
      const delta = t - timeSample;
      if (delta < interval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      timeSample = t - delta % interval;
      state.time = t;
      state.frame++;

      // Dimensions
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Metrics
      const fontSize = 12; // Adjust as needed
      const cellWidth = fontSize * 0.6;
      const lineHeight = fontSize * 1.2;
      const cols = Math.floor(width / cellWidth);
      const rows = Math.floor(height / lineHeight);
      const aspect = cellWidth / lineHeight;

      // Clear
      ctx.fillStyle = 'black'; // Background color
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'royalblue'; // Default text color
      ctx.font = `${fontSize}px monospace`; // Use a standard monospace for performance
      ctx.textBaseline = 'top';

      // --- Pre (Transformation) ---
      // const t = context.time * 0.01
      // const rot = vec3(t * 0.11, t * 0.13, -t * 0.15)
      const simTime = state.time * 0.001; // Scale to match JS version roughly
      const rot = vec3(simTime * 0.81, simTime * 0.93, -simTime * 1.15); // Speed up a bit
      const d = 2;
      const zOffs = map(Math.sin(simTime * 0.82), -1, 1, -2.5, -6);

      const boxProj: Vec2[] = [];

      for (let i = 0; i < boxVertices.length; i++) {
        const v = copy(boxVertices[i]);
        let vt = rotX(v, rot.x);
        vt = rotY(vt, rot.y);
        vt = rotZ(vt, rot.z);

        // Perspective projection
        // boxProj[i] = v2.mulN(vec2(vt.x, vt.y), d / (vt.z - zOffs))
        const scale = d / (vt.z - zOffs);
        boxProj[i] = mulN(vec2(vt.x, vt.y), scale);
      }

      // --- Main (Raymarching/SDF) ---
      // Map mouse cursor to grid coordinates
      const cursor = {
        x: mouseRef.current.x / cellWidth,
        y: mouseRef.current.y / lineHeight
      };

      const m = Math.min(cols, rows);

      // We can't loop every pixel in JS on the CPU for a full screen without killing perf.
      // Optimizations:
      // 1. Reduce resolution (skip pixels) or usage of canvas transform? 
      //    play.core does char-by-char. Let's try it. Browsers are fast.
      // 2. Only check relevant area?

      const thickness = map(cursor.x, 0, cols, 0.001, 0.1);
      const expMul = map(cursor.y, 0, rows, -100, -5);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const st = {
            x: 2.0 * (x - cols / 2 + 0.5) / m * aspect,
            y: 2.0 * (y - rows / 2 + 0.5) / m
          };

          let minDist = 1e10;
          for (let i = 0; i < boxEdges.length; i++) {
            const e = boxEdges[i];
            const a = boxProj[e[0]];
            const b = boxProj[e[1]];
            minDist = Math.min(minDist, sdSegment(st, a, b, thickness));
          }

          const idx = Math.floor(Math.exp(expMul * Math.abs(minDist)) * density.length);

          let char = ' ';
          let color = 'royalblue';

          if (idx === 0) {
            // Background pattern
            const bgX = x % bgMatrixDim.x;
            const bgY = y % bgMatrixDim.y;
            char = minDist < 0 ? ' ' : bgMatrix[bgY][bgX]; // d < 0 check? original had it.
            color = '#a7a7a7'; // Dimmer for background
          } else {
            // Cube
            char = density[idx] || ' ';
            // char = idx >= density.length ? 'X' : density[idx];
          }

          // Optimization: Don't draw spaces
          if (char !== ' ') {
            ctx.fillStyle = color;
            ctx.fillText(char, x * cellWidth, y * lineHeight);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
