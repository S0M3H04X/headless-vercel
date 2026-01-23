// app/components/widgets/commerce/CollectionVisualizer.tsx
// Collection Visualizer with React Three Fiber and Dithering effect
'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import styles from './CollectionApp.module.scss';

// Import dithering shaders
import vertexShader from '@/shaders/dither.vert';
import fragmentShader from '@/shaders/dither.frag';

interface VisualizerProps {
    isLoading?: boolean;
    ditherScale?: number;
    colorLevels?: number;
}

// Dithered Image Plane Component
const DitheredImage: React.FC<{ ditherScale: number; colorLevels: number }> = ({
    ditherScale,
    colorLevels
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport, size } = useThree();

    // Load the texture
    const texture = useTexture('/assets/img/style.jpeg');

    // Configure texture
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Create uniforms with useMemo
    const uniforms = useMemo(() => ({
        uTexture: { value: texture },
        uDitherScale: { value: ditherScale },
        uColorLevels: { value: colorLevels },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }), [texture, size.width, size.height, ditherScale, colorLevels]);

    // Update uniforms on each frame
    useFrame(() => {
        uniforms.uDitherScale.value = ditherScale;
        uniforms.uColorLevels.value = colorLevels;
    });

    // Calculate scaling: always use 100% of canvas width
    const image = texture.image as { width: number; height: number } | null;
    const imageAspect = image ? image.width / image.height : 1;

    // Scale to full viewport width, adjust height proportionally
    const scaleX = viewport.width;
    const scaleY = viewport.width / imageAspect;

    return (
        <mesh ref={meshRef} scale={[scaleX, scaleY, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};

// Loading fallback
const LoadingFallback = () => (
    <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#bbced9" />
    </mesh>
);

export const CollectionVisualizer: React.FC<VisualizerProps> = ({
    isLoading = false,
    ditherScale = 1,      // Size of dither pattern (higher = larger pattern)
    colorLevels = 8,      // Number of color levels (lower = more posterized)
}) => {
    return (
        <div className={styles.visualizerContainer}>
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-xs font-mono">Loading...</span>
                </div>
            ) : (
                <Canvas
                    gl={{
                        antialias: false,
                        alpha: true,
                        powerPreference: 'high-performance',
                    }}
                    dpr={1}
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    className={styles.visualizerCanvas}
                    style={{ width: '100%', height: '542px' }}
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <DitheredImage ditherScale={ditherScale} colorLevels={colorLevels} />
                    </Suspense>
                </Canvas>
            )}
        </div>
    );
};

export default CollectionVisualizer;