'use client';

import React, { useState, useEffect } from 'react';
import { SystemMenu } from './SystemMenu';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Z_INDEX, LAYOUT } from '@/lib/constants/ui';

export const MenuBar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  
  // [修正] 從 Workspace Store 獲取 windows 與 stackOrder
  const windows = useWorkspaceStore((state) => state.windows);
  const stackOrder = useWorkspaceStore((state) => state.stackOrder);

  // [修正] 推導 activeWindowId (Stack 的最後一個即為最上層/聚焦視窗)
  const activeWindowId = stackOrder.length > 0 ? stackOrder[stackOrder.length - 1] : null;
  const activeWindowTitle = activeWindowId && windows[activeWindowId] 
    ? (windows[activeWindowId].title || 'Application') 
    : 'Finder';

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      // 在客戶端產生時間字串
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 w-full bg-[#e0e0e0] border-b border-gray-400 shadow-sm flex items-center justify-between px-1 select-none font-sans"
      style={{ 
        height: LAYOUT.MENU_BAR_HEIGHT,
        zIndex: Z_INDEX.MENU_BAR 
      }}
    >
      <div className="flex items-center h-full">
        <SystemMenu />
        <div className="ml-4 font-bold text-black px-2 border-l border-gray-300 text-sm">
          {activeWindowTitle}
        </div>
      </div>

      <div className="flex items-center h-full px-3 text-sm font-semibold text-black">
        {/* 使用 suppressHydrationWarning 作為額外保險，雖然 mounted check 已經解決了大部分問題 */}
        <span suppressHydrationWarning>
            {mounted ? time : ''}
        </span>
      </div>
    </div>
  );
};