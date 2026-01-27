// app/hooks/useBootSequence.ts
import { useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';

export const useBootSequence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { bootSystem, openWindow, windows } = useWorkspaceStore();
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const init = async () => {
      try {
        console.log('[Boot] Fetching config...');
        const res = await fetch('/api/os/boot');
        if (!res.ok) throw new Error('Failed to boot');
        
        const config = await res.json();
        
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