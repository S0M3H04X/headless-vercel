'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const AuthWidget: React.FC = () => {
  const { isAuthenticated, isLoading, user, checkAuth, login, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 基礎定位樣式 (可依據實際設計規範調整)
  const containerClass = "absolute top-4 right-4 z-50 flex flex-col items-end gap-2";

  if (isLoading) {
    return null; // 或回傳簡單的 Loading Placeholder
  }

  return (
    <div className={containerClass}>
      {isAuthenticated ? (
        // 已登入狀態 (Member State)
        <div className="flex flex-col items-end">
          <div className="text-sm font-medium">
            {/* 這裡顯示 User 資訊 */}
            {user?.name || 'Authorized'}
          </div>
          <button 
            onClick={logout}
            className="text-xs underline cursor-pointer mt-1"
          >
            Sign Out
          </button>
        </div>
      ) : (
        // 訪客狀態 (Guest State)
        <div className="flex flex-col items-end">
          <div className="text-sm mb-2">Guest Mode</div>
          <button
            onClick={login}
            // [修正] 移除特定黑色背景，改為基礎按鈕樣式，請自行套用專案 Button Class
            className="px-2 py-2 border rounded bg-white text-black hover:bg-gray-50 transition-colors"
          >
            Login with Email
          </button>
        </div>
      )}
    </div>
  );
};