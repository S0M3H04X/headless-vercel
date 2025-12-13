'use client';
import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
// import { WorkspaceRepository } from '@/lib/persistence/storage'; // [1] 移除這個引用
import { WinboxWrapper } from '../ui/WinboxWrapper';
import { WidgetRenderer } from '../widgets/Registry';
import { Launcher } from '../system/Launcher';

export default function Desktop() {
  // [2] 使用標準的 Hydration 檢查模式
  const [isMounted, setIsMounted] = useState(false);
  const windows = useWorkspaceStore((state) => state.windows);
  
  useEffect(() => {
    // WorkspaceRepository.load(); // [3] 刪除這行，Zustand 會自動載入
    setIsMounted(true);
  }, []);

  // [4] 在客戶端掛載完成前，只渲染背景，不渲染視窗 (避免 Hydration Error)
  if (!isMounted) return <div className="h-screen w-screen bg-slate-100" />;

  return (
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden">
      <Launcher />

      {/* 視窗層 */}
      {Object.values(windows).map((win) => (
        <WinboxWrapper key={win.id} windowInstance={win}>
          <WidgetRenderer id={win.id} content={win.content} internalState={win.internalState} />
        </WinboxWrapper>
      ))}
    </div>
  );
}