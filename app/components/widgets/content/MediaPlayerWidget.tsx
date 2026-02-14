// app/components/widgets/content/MediaPlayerWidget.tsx
'use client';
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { BaseWidgetProps } from '@/lib/types/workspace';
import { useAuthStore } from '@/store/authStore';

// Lazy load dependencies
const loadWebamp = async () => {
  const [WebampModule, ButterchurnPresets] = await Promise.all([
    import('webamp/butterchurn'),
    import('butterchurn-presets')
  ]);
  return { Webamp: WebampModule.default, presets: ButterchurnPresets.default };
};

// Define available skins
const AVAILABLE_SKINS = [
  { url: '/assets/skins/0.wmz', name: 'Skin 0' },
  { url: '/assets/skins/1.wmz', name: 'Skin 1' },
  { url: '/assets/skins/2.wmz', name: 'Skin 2' },
  { url: '/assets/skins/3.wmz', name: 'Skin 3' },
  { url: '/assets/skins/4.wmz', name: 'Skin 4' },
  { url: '/assets/skins/5.wmz', name: 'Skin 5' },
  { url: '/assets/skins/6.wmz', name: 'Skin 6' },
  { url: '/assets/skins/7.wmz', name: 'Skin 7' },
  { url: '/assets/skins/8.wmz', name: 'Skin 8' },
  { url: '/assets/skins/9.wmz', name: 'Skin 9' },
  { url: '/assets/skins/10.wmz', name: 'Skin 10' },
  { url: '/assets/skins/11.wmz', name: 'Skin 11' },
  { url: '/assets/skins/12.wmz', name: 'Skin 12' }
];

export default function MediaPlayerWidget({ id, content }: BaseWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const webampRef = useRef<any>(null);
  const { avatarSeed, user } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Calculate Skin from Avatar Seed
  const selectedSkin = useMemo(() => {
    const seed = avatarSeed || user?.email || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % AVAILABLE_SKINS.length);
    return AVAILABLE_SKINS[index];
  }, [avatarSeed, user]);

  useEffect(() => {
    if (!containerRef.current || webampRef.current) return;
    if (typeof window === 'undefined') return;

    let activeWebamp: any = null;

    const init = async () => {
      try {
        const { Webamp, presets } = await loadWebamp();

        // 2. Initialize Webamp with Milkdrop & Custom Skin
        const webamp = new Webamp({
          zIndex: 99999,
          windowLayout: {
            main: {
              position: { top: 0, left: 0 },
              shadeMode: true,
              closed: false,
            },
            equalizer: {
              position: { top: 50, left: 50 },
              shadeMode: true,
              closed: true,
            },
            playlist: {
              position: { top: 50, left: 50 },
              shadeMode: true,
              size: { extraHeight: 1, extraWidth: 10 },
              closed: false,
            },
          },
          enableDoubleSizeMode: true,
          initialSkin: {
            url: selectedSkin.url
          },
          availableSkins: AVAILABLE_SKINS,
          __butterchurnOptions: {
            importButterchurn: () => Promise.resolve((window as any).butterchurn),
            getPresets: () => presets,
            butterchurnOpen: true, // Auto-open Milkdrop
          },
          initialTracks: content.sourceId ? [{
            metaData: {
              artist: 'Unknown Artist',
              title: 'Track 1'
            },
            url: content.sourceId,
            duration: 0
          }] : []
        });

        // 3. Render
        await webamp.renderWhenReady(containerRef.current);
        webampRef.current = webamp;
        activeWebamp = webamp;
        setIsLoaded(true);

        // Auto-play
        webamp.play();

      } catch (err) {
        console.error('[MediaPlayer] Failed to load Webamp:', err);
      }
    };

    init();

    return () => {
      if (activeWebamp) {
        activeWebamp.dispose();
        webampRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // Frameless container: Fixed overlay, let clicks pass through (pointer-events-none), 
    // but Webamp itself will be drawn here. Webamp elements usually have pointer-events-auto.
    // We use z-index to ensure it sits on top of everything.
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading State */}
      {!isLoaded && (
        <div className="text-center text-xs text-green-500 font-mono animate-pulse">
          INITIALIZING WINAMP...
          <br />
          LOADING SKIN: {selectedSkin.name}
        </div>
      )}
    </div>
  );
}