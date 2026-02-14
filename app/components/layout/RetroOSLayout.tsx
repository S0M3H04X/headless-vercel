import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthWidget } from '@/components/desktop/AuthWidget'; // [修正] 加上大括號

import styles from './RetroOSLayout.module.scss';

import { useAudioStudioStore } from '@/store/audioStudioStore';
import { WebGPUCanvas } from '@/components/three/WebGPUCanvas';
import { Suspense, lazy } from 'react';

// Lazy load the shader component to avoid SSR issues with Three.js/WebGPU
const AudioReactiveShader = lazy(() => import('./AudioReactiveShader')); // We need to create this!

const WallpaperLayer = ({ defaultWallpaper }: { defaultWallpaper?: string }) => {
  const isVisualiserActive = useAudioStudioStore(s => s.isVisualiserActive);

  if (isVisualiserActive) {
    return (
      <div className="absolute inset-0 z-0 bg-black pointer-events-none">
        <WebGPUCanvas>
          <Suspense fallback={null}>
            <AudioReactiveShader />
          </Suspense>
        </WebGPUCanvas>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-500"
      style={{ backgroundImage: `url(${defaultWallpaper || '/assets/img/2.jpg'})` }}
    />
  );
};

interface RetroOSLayoutProps {
  children: React.ReactNode;
  wallpaper?: string;
}

export const RetroOSLayout: React.FC<RetroOSLayoutProps> = ({ children, wallpaper }) => {
  const isAuthOpen = useAuthStore((state) => state.isAuthOpen);
  const closeAuth = useAuthStore((state) => state.closeAuth);

  return (
    // Layer 1: Viewport
    <div className="relative h-screen w-screen overflow-hidden text-black select-none">

      {/* Layer 2: Wallpaper */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${wallpaper || '/assets/img/2.jpg'})` }}
      />



      {/* Layer 3, 4, 5: Injected Content */}
      <div className="relative z-10 w-full h-full">
        {children}

        {/* Global Auth Modal */}
        {isAuthOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className={styles.authModal}>
              {/* Close Button applied to the wrapper to avoid conflict inside Widget */}
              <button
                onClick={closeAuth}
                className={styles.buttonClose}
              >
                x
              </button>
              <AuthWidget />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};