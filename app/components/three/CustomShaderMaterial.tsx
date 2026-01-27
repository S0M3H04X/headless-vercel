// app/components/three/CustomShaderMaterial.tsx
// Example component demonstrating custom shader material usage with glslify
'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Import shaders (processed by glslify-loader)
import vertexShader from '@/shaders/example.vert';
import fragmentShader from '@/shaders/example.frag';

interface CustomShaderMeshProps {
  position?: [number, number, number];
  scale?: number;
}

/**
 * Example mesh with custom shader material.
 * Demonstrates:
 * - Importing GLSL shaders with glslify
 * - Uniform updates via useFrame
 * - ShaderMaterial integration with R3F
 */
export const CustomShaderMesh: React.FC<CustomShaderMeshProps> = ({
  position = [0, 0, 0],
  scale = 0.01,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create uniforms with useMemo to prevent recreation on render
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  // Update time uniform on each frame
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[2, 2, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default CustomShaderMesh;
