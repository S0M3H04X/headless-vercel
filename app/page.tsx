// app/components/workspace/Desktop.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WinboxProvider } from '@/components/ui/WinboxWrapper';
import { WidgetRenderer } from '@/components/widgets/Registry';
import { WorkspaceRepository } from '@/lib/persistence/storage';
import { Desktop } from '@/components/workspace/Desktop';
import { Launcher } from '@/components/system/Launcher';
import { AuthWidget } from '@/components/desktop/AuthWidget';



export default function Home() {

  // 防止水合不匹配 (Hydration Mismatch)
  const [isHydrated, setIsHydrated] = useState(false);
  const windows = useWorkspaceStore((state) => state.windows);

  // [新增] 初始化邏輯
  useEffect(() => {
    WorkspaceRepository.load();
    setIsHydrated(true);
  }, []);


  // [關鍵保護] 如果還沒水合，不要渲染 Winbox (避免與 SSR 衝突)
  // 可以渲染一個 Loading Spinner 或空的 div
  if (!isHydrated) {
    return <div className="h-screen w-screen bg-slate-100" />;
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Desktop>
        {/* 測試控制台 */}
        <AuthWidget />
        {/* 系統層：Launcher (未來可在這裡加入 Taskbar, StartMenu) */}
        <Launcher />

        {/* 視窗渲染層 */}
        {Object.values(windows).map((win) => (
          <WinboxProvider key={win.id} windowInstance={win}>
            <WidgetRenderer id={win.id} content={win.content} internalState={win.internalState} />
          </WinboxProvider>
        ))}
      </Desktop>
    </main>
  );
}