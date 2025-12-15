'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const AuthWidget: React.FC = () => {
  const { isAuthenticated, isLoading, user, checkAuth, login, logout } = useAuthStore();

  // 組件掛載時自動檢查狀態
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 定位樣式：右上角，Z-index 設為 10 (高於桌布，低於視窗的 100+)
  const containerClass = "absolute top-4 right-4 z-10 w-64 p-4 rounded-xl backdrop-blur-md bg-white/30 border border-white/20 shadow-lg transition-all duration-300";

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-white/50 animate-pulse" />
          <div className="h-4 w-24 bg-white/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar / Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm
            ${isAuthenticated ? 'bg-green-400 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {isAuthenticated ? (user?.name?.[0] || 'M') : '?'}
          </div>
          
          {/* Text Info */}
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {isAuthenticated ? 'Member Access' : 'Guest Mode'}
            </p>
            <p className="text-xs text-gray-600">
              {isAuthenticated ? 'Connected to Shopify' : 'Read-only access'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3">
        {isAuthenticated ? (
           // 為了測試方便，我們先保留一個登出按鈕 (雖然功能還不完整)
           <button 
             onClick={logout}
             className="w-full py-1.5 px-3 bg-white/40 hover:bg-red-500 hover:text-white text-xs font-medium text-gray-700 rounded-lg transition-colors border border-white/20 backdrop-blur-sm"
           >
             Sign Out (UI Only)
           </button>
        ) : (
          <button
            onClick={login}
            className="w-full py-2 px-4 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Login with Shopify</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};