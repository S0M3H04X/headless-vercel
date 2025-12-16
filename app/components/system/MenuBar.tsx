'use client';

import React, { useState, useEffect } from 'react';
import { SystemMenu } from './SystemMenu';
import { useWorkspaceStore } from '@/store/workspaceStore';

export const MenuBar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  
  // [修正] 從 Workspace Store 獲取 windows 與 stackOrder
  const windows = useWorkspaceStore((state) => state.windows);
  const stackOrder = useWorkspaceStore((state) => state.stackOrder);

  // [修正] 推導 activeWindowId (Stack 的最後一個即為最上層/聚焦視窗)
  const activeWindowId = stackOrder.length > 0 ? stackOrder[stackOrder.length - 1] : null;

  // 時鐘邏輯
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // [修正] 獲取當前聚焦視窗的標題
  // 注意：title 是在 WindowInstance 第一層，不在 content 內
  const activeWindowTitle = activeWindowId && windows[activeWindowId] 
    ? (windows[activeWindowId].title || 'Application') 
    : 'Finder'; // 若無聚焦視窗，預設顯示 Finder

  return (
    <div className="fixed top-0 left-0 w-full h-[32px] bg-[#e0e0e0] border-b border-gray-400 shadow-sm z-[9999] flex items-center justify-between px-1 select-none font-sans">
      
      {/* Left: System Menu & App Title */}
      <div className="flex items-center h-full">
        <SystemMenu />
        
        {/* AC-03: App Title (Current Focused App) */}
        <div className="ml-4 font-bold text-black px-2 border-l border-gray-300">
          {activeWindowTitle}
        </div>
      </div>

      {/* Right: Clock / Tray */}
      <div className="flex items-center h-full px-3 text-sm font-semibold text-black">
        <span>{time}</span>
      </div>
      
    </div>
  );
};