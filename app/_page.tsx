// app/components/workspace/Desktop.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WinboxProvider } from '@/components/ui/WinboxWrapper';
import { WidgetRenderer } from '@/components/widgets/Registry';
import { WorkspaceRepository } from '@/lib/persistence/storage';
import { Desktop } from '@/components/workspace/Desktop';
import { Launcher } from '@/components/system/Launcher';
import { MenuBar } from '@/components/system/MenuBar'; // [新增]



export default function Home() {

  // 防止水合不匹配 (Hydration Mismatch)
  const [isHydrated, setIsHydrated] = useState(false);
  // const windows = useWorkspaceStore((state) => state.windows);
  const { windows, openWindow, bootSystem, isBooted } = useWorkspaceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // [新增] 初始化邏輯
  useEffect(() => {
    const runBootSequence = async () => {
      try {
        // 1. Fetch Config
        const res = await fetch('/api/os/boot');
        const config = await res.json();

        // 2. Update Store (Strategy C: Dock synced, Windows kept)
        bootSystem(config);

        // 3. Handle AutoStart (Guest: Login Window)
        // 只有當桌面上沒有視窗時，才執行 AutoStart (避免干擾回頭客)
        const hasWindows = Object.keys(useWorkspaceStore.getState().windows).length > 0;

        if (!hasWindows && config.autoStart) {
          config.autoStart.forEach((win: any) => {
            openWindow({
              title: win.title,
              content: win.content,
              initialGeometry: win.initialGeometry
            });
          });
        }

        // 4. UX: Show Welcome -> Desktop
        setIsLoading(false);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 2000); // 2秒後消失

      } catch (e) {
        console.error('Boot failed', e);
        setIsLoading(false); // Fallback to allow interaction
      }
    };

    runBootSequence();
  }, []);

  // useEffect(() => {
  //   WorkspaceRepository.load();
  //   setIsHydrated(true);
  // }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-white rounded-full mb-4"></div>
        <p className="font-mono text-sm tracking-widest">SYSTEM BOOTING...</p>
      </div>
    );
  }


  // [關鍵保護] 如果還沒水合，不要渲染 Winbox (避免與 SSR 衝突)
  // 可以渲染一個 Loading Spinner 或空的 div
  // if (!isHydrated) {
  //   return (
  //     <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
  //       <div className="flex flex-col items-center gap-4">
  //         <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
  //         <p className="font-mono text-sm">System Booting...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (

    <div className="relative w-full h-screen bg-slate-100 overflow-hidden bg-[url('/assets/wallpaper/macos.jpg')] bg-cover">

      {/* Welcome Message (Overlay) */}
      {showWelcome && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[9999] bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-xl animate-fade-in-down">
          <p className="text-sm font-medium">✨ System Ready. Welcome back.</p>
        </div>
      )}



      <main className="relative h-screen w-screen overflow-hidden">
        {/* 全域導航層 (Z-Index 最高) */}

        <MenuBar />
        <Desktop>


          {/* 視窗渲染層 */}
          {Object.values(windows).map((win) => (
            <WinboxProvider key={win.id} windowInstance={win}>
              <WidgetRenderer id={win.id} content={win.content} internalState={win.internalState} />
            </WinboxProvider>
          ))}

          {/* 系統層：Launcher (未來可在這裡加入 Taskbar, StartMenu) */}
          <Launcher />
        </Desktop>
      </main>
    </div>
  );
}