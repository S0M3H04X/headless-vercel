// app/components/three/WebGPUCanvas.tsx
// Client-side R3F Canvas with WebGPU support (with WebGL fallback for R3F v8)
'use client';

import React, { Suspense } from 'react';
import { Canvas, CanvasProps } from '@react-three/fiber';

interface WebGPUCanvasProps extends Omit<CanvasProps, 'children'> {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * React Three Fiber Canvas wrapper optimized for WebGPU-ready Three.js usage.
 * 
 * Note: R3F v8 uses WebGLRenderer by default. For full WebGPU support,
 * upgrade to R3F v9+ with React 19, or use Three.js WebGPURenderer directly.
 * 
 * This wrapper provides:
 * - Client-side rendering ('use client')
 * - Suspense boundary for async loading
 * - Consistent configuration for the project
 */
export const WebGPUCanvas: React.FC<WebGPUCanvasProps> = ({
  children,
  fallback = null,
  ...props
}) => {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      {...props}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </Canvas>
  );
};

export default WebGPUCanvas;
