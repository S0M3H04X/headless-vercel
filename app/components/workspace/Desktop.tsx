'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WinboxProvider } from '@/components/ui/WinboxWrapper';
import { WidgetRenderer } from '@/components/widgets/Registry';

interface DesktopProps {
  children?: React.ReactNode;
}

export const Desktop: React.FC<DesktopProps> = ({ children }) => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const { windows, openWindow, bootSystem } = useWorkspaceStore();
  
  // UI 狀態
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // --- Boot Sequence (關鍵邏輯) ---
  useEffect(() => {
    const runBootSequence = async () => {
      try {
        console.log('[Boot] Starting OS boot sequence...');
        
        // 1. 呼叫 API 獲取設定 (Role, Dock, AutoStart)
        const res = await fetch('/api/os/boot');
        if (!res.ok) throw new Error('Boot API failed');
        
        const config = await res.json();
        console.log('[Boot] Config loaded:', config);

        // 2. 更新 Store (設定 Dock App 清單)
        bootSystem(config);

        // 3. 處理 AutoStart (僅在桌面無任何視窗時觸發，避免重整時重複開啟)
        // 注意：這裡使用 getState() 確保讀取到最新狀態
        const currentWindows = useWorkspaceStore.getState().windows;
        const hasWindows = Object.keys(currentWindows).length > 0;
        
        if (!hasWindows && config.autoStart && config.autoStart.length > 0) {
          console.log('[Boot] Executing auto-start...');
          config.autoStart.forEach((win: any) => {
            openWindow({
              title: win.title,
              content: win.content,
              initialGeometry: win.initialGeometry
            });
          });
        }

        // 4. UX: 顯示歡迎訊息並結束 Loading
        setIsLoading(false);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000);

      } catch (e) {
        console.error('[Boot] Critical Failure:', e);
        setIsLoading(false); // 即使失敗也要進入桌面，以免卡死
      }
    };

    runBootSequence();
  }, []); // 空依賴陣列，確保只執行一次

  // --- Render: Loading Screen ---
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white z-50">
        <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-white rounded-full mb-4"></div>
        <p className="font-mono text-sm tracking-widest animate-pulse">SYSTEM BOOTING...</p>
      </div>
    );
  }

  // --- Render: Desktop Environment ---
  return (
    <div ref={desktopRef} className="relative w-full h-full overflow-hidden bg-gray-100 pt-8">
      
      {/* 1. Wallpaper Layer */}
      <div className="absolute inset-0 z-0 bg-[#3a6ea5]" />

      {/* 2. Welcome Message Overlay */}
      {showWelcome && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[9999] bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-xl animate-bounce">
          <p className="text-sm font-medium text-black">✨ System Ready</p>
        </div>
      )}

      {/* 3. Window Manager Layer (關鍵：渲染視窗) */}
      {Object.values(windows).map((win) => (
        <WinboxProvider key={win.id} windowInstance={win}>
          <WidgetRenderer 
            id={win.id} // 傳遞 ID
            content={win.content} 
            internalState={win.internalState} 
          />
        </WinboxProvider>
      ))}

      {/* 4. Composition Layer (Menu, Launcher, etc.) */}
      {children}

    </div>
  );
};