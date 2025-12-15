// app/components/workspace/Desktop.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WinboxWrapper } from '../ui/WinboxWrapper';
import { WidgetRenderer } from '@/components/widgets/Registry';
import { WorkspaceRepository } from '@/lib/persistence/storage';
import { ScenarioService } from '@/lib/services/scenarioService';
import { Launcher } from '../system/Launcher';
import { AuthWidget } from '@/components/desktop/AuthWidget';


export default function Desktop() {
  
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
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden">
      {/* 測試控制台 */}
      <AuthWidget />
      {/* 系統層：Launcher (未來可在這裡加入 Taskbar, StartMenu) */}
      <Launcher />

      {/* 視窗渲染層 */}
      {Object.values(windows).map((win) => (
        <WinboxWrapper key={win.id} windowInstance={win}>
          <WidgetRenderer id={win.id} content={win.content} internalState={win.internalState} />
        </WinboxWrapper>
      ))}
    </div>
  );
}