'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';

export const SystemMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Auth Store 整合
  // [修正] 加入 checkAuth 以便在元件載入時確認狀態
  const { isAuthenticated, user, login, logout, checkAuth } = useAuthStore();
  
  // Workspace Store
  // [修正] 使用 openWindow 而非 createWindow (根據 workspaceStore 定義)
  const openWindow = useWorkspaceStore((state) => state.openWindow);

  // [新增] 初始化檢查登入狀態
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      login();
    }
    setIsOpen(false);
  };

  const handleOpenWidget = (widgetId: string) => {
    // [修正] 實作開啟視窗邏輯
    if (widgetId === 'about') {
        openWindow({
            title: 'About Headless OS',
            content: { 
                kind: 'text_viewer', // 假設有一個通用文字 Widget，若無則需在 Registry 註冊
                sourceId: 'system_about' 
            },
            initialGeometry: { x: 100, y: 100, width: 300, height: 200 }
        });
    }
    // 其他 Widget 可在此擴充
    console.log(`Open widget: ${widgetId}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* System Logo Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center px-3 h-full font-bold select-none transition-colors
          ${isOpen ? 'bg-blue-900 text-white' : 'hover:bg-gray-700 hover:text-white text-black'}
        `}
      >
         System
      </button>

      {/* Dropdown Menu (Mac OS 9 Style) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-[1px] w-56 bg-[#e0e0e0] border border-gray-500 shadow-xl z-[9999] py-1 text-sm font-medium text-black">
          
          <div className="px-4 py-1 hover:bg-blue-700 hover:text-white cursor-pointer" onClick={() => handleOpenWidget('about')}>
            About This OS
          </div>
          
          <div className="h-[1px] bg-gray-400 my-1 mx-1" /> {/* Divider */}

          <div className="px-4 py-1 hover:bg-blue-700 hover:text-white cursor-pointer" onClick={() => handleOpenWidget('social')}>
            Social
          </div>
          <div className="px-4 py-1 hover:bg-blue-700 hover:text-white cursor-pointer" onClick={() => handleOpenWidget('settings')}>
            Control Panels (Settings)
          </div>

          <div className="h-[1px] bg-gray-400 my-1 mx-1" /> {/* Divider */}

          {/* AC-02 / AC-04: 登入/登出狀態切換 */}
          <div className="px-4 py-1 hover:bg-blue-700 hover:text-white cursor-pointer flex justify-between items-center" onClick={handleAuthAction}>
            <span>{isAuthenticated ? 'Logout' : 'Login...'}</span>
            {isAuthenticated && <span className="text-xs opacity-70 ml-2">({user?.name || 'User'})</span>}
          </div>

        </div>
      )}
    </div>
  );
};