'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SystemService } from '@/lib/services/systemService';
import { Z_INDEX } from '@/lib/constants/ui';

export const SystemMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Auth Store 整合
  // [修正] 加入 checkAuth 以便在元件載入時確認狀態
  const { isAuthenticated, user, login, logout, checkAuth } = useAuthStore();
  

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
    isAuthenticated ? logout() : login();
    setIsOpen(false);
  };

  // [重構] 改用 Service 呼叫，UI 不再關心視窗細節
  const handleSystemCommand = (type: 'ABOUT' | 'SETTINGS' | 'SOCIAL') => {
    SystemService.openSystemWindow(type);
    setIsOpen(false);
  };

  return (
    <div className="relative h-full" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center px-3 h-full font-bold select-none transition-colors text-sm
          ${isOpen ? 'bg-blue-900 text-white' : 'hover:bg-gray-700 hover:text-white text-black'}
        `}
      >
         System
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-[1px] w-56 bg-[#e0e0e0] border border-gray-500 shadow-xl py-1 text-sm font-medium text-black"
          style={{ zIndex: Z_INDEX.MENU_BAR + 1 }} // 確保選單在 MenuBar 之上
        >
          <div className="px-4 py-1 hover:bg-blue-700 hover:text-white cursor-pointer" onClick={() => handleSystemCommand('ABOUT')}>
            About This OS
          </div>
          
          <div className="h-[1px] bg-gray-400 my-1 mx-1" />

          <div className="px-4 py-1 hover:bg-blue-700 hover:text-white cursor-pointer" onClick={() => handleSystemCommand('SOCIAL')}>
            Social
          </div>
          <div className="px-4 py-1 hover:bg-blue-700 hover:text-white cursor-pointer" onClick={() => handleSystemCommand('SETTINGS')}>
            Control Panels
          </div>

          <div className="h-[1px] bg-gray-400 my-1 mx-1" />

          <div className="px-4 py-1 hover:bg-blue-700 hover:text-white cursor-pointer flex justify-between items-center" onClick={handleAuthAction}>
            <span>{isAuthenticated ? 'Logout' : 'Login...'}</span>
            {isAuthenticated && <span className="text-xs opacity-70 ml-2">({user?.name || 'User'})</span>}
          </div>
        </div>
      )}
    </div>
  );
};