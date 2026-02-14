'use client';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudioStudioStore } from '@/store/audioStudioStore';

// Simple vertex shader
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Audio reactive fragment shader (Dither/Pixel style)
const fragmentShader = `
uniform float uTime;
uniform float uAudioHigh;
uniform float uAudioMid;
uniform float uAudioLow;
varying vec2 vUv;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

void main() {
  vec2 uv = vUv;
  
  // Distortion based on bass
  float dist = uAudioLow * 0.1;
  uv.x += sin(uv.y * 10.0 + uTime) * dist;
  
  // Grid effect
  float grid = step(0.98, fract(uv.x * 20.0)) + step(0.98, fract(uv.y * 20.0));
  
  // Color generation
  vec3 colorA = vec3(0.1, 0.1, 0.2); // Dark Blue
  vec3 colorB = vec3(0.0, 1.0, 0.5); // Teal/Green
  vec3 colorC = vec3(1.0, 0.2, 0.5); // Pink
  
  vec3 color = mix(colorA, colorB, uv.y + sin(uTime * 0.5) * 0.5);
  
  // Add audio reactivity
  color += colorC * uAudioHigh * step(0.5, random(uv * vec2(uTime, 1.0)));
  
  // Scanlines
  color *= 0.8 + 0.2 * sin(uv.y * 100.0 + uTime * 5.0);
  
  gl_FragColor = vec4(color + grid * 0.2, 1.0);
}
`;

const AudioReactiveShader = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { analyser } = useAudioStudioStore();
  const dataArray = useMemo(() => new Uint8Array(analyser ? analyser.frequencyBinCount : 128), [analyser]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAudioLow: { value: 0 },
    uAudioMid: { value: 0 },
    uAudioHigh: { value: 0 },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    uniforms.uTime.value = state.clock.elapsedTime;

    if (analyser) {
      analyser.getByteFrequencyData(dataArray);

      // Calculate simplistic frequency bands
      // Low: 0-10%
      // Mid: 10-50%
      // High: 50-100%
      const lowerBound = Math.floor(dataArray.length * 0.1);
      const midBound = Math.floor(dataArray.length * 0.5);

      let lowSum = 0, midSum = 0, highSum = 0;

      for (let i = 0; i < lowerBound; i++) lowSum += dataArray[i];
      for (let i = lowerBound; i < midBound; i++) midSum += dataArray[i];
      for (let i = midBound; i < dataArray.length; i++) highSum += dataArray[i];

      uniforms.uAudioLow.value = (lowSum / lowerBound) / 255;
      uniforms.uAudioMid.value = (midSum / (midBound - lowerBound)) / 255;
      uniforms.uAudioHigh.value = (highSum / (dataArray.length - midBound)) / 255;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default AudioReactiveShader;
