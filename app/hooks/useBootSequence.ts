// app/hooks/useBootSequence.ts
import { useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';

export const useBootSequence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { bootSystem, openWindow, windows } = useWorkspaceStore();
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const init = async () => {
      try {
        console.log('[Boot] Starting boot sequence...');

        // [Optimized] Parallelize config fetch and auth check
        // This ensures the "Desktop" doesn't render until we know the user's state
        // [Feature] Ensure minimum boot time of 3 seconds for aesthetic purposes
        const prefetchCriticalAssets = async () => {
          const assets = [
            '/assets/classicy/img/icons/applications/internet-explorer/app.png',
            '/assets/classicy/img/icons/system/folders/favorites.png',
            '/assets/classicy/img/ui/window/stripes.png'
          ];
          assets.forEach(url => {
            const img = new Image();
            img.src = url;
          });
        };

        const [configRes] = await Promise.all([
          fetch('/api/os/boot'),
          useAuthStore.getState().checkAuth(),
          prefetchCriticalAssets(), // Lightweight prefetch
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (!configRes.ok) throw new Error('Failed to boot');

        const config = await configRes.json();

        // 1. 初始化系統 (Dock, Permissions)
        bootSystem(config);

        // 2. 處理自動啟動 (僅在無視窗時)
        const hasWindows = Object.keys(useWorkspaceStore.getState().windows).length > 0;
        if (!hasWindows && config.autoStart) {
          config.autoStart.forEach((win: any) => {
            // 這裡將 geometry 傳入，稍後由 WindowManager 處理 "center"
            openWindow(win);
          });
        }
      } catch (e) {
        console.error('[Boot] Error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []); // 確保只執行一次

  return { isLoading };
};