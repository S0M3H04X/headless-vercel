'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore'; // [新增]
import { SystemMenu } from './SystemMenu';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useCartStore } from '@/store/cartStore';
import { Z_INDEX, LAYOUT } from '@/lib/constants/ui';
import { WidgetKind } from '@/lib/types/workspace';

import styles from './MenuBar.module.scss';

export const MenuBar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // [修正] 從 Workspace Store 獲取 windows 與 stackOrder
  const windows = useWorkspaceStore((state) => state.windows);
  const stackOrder = useWorkspaceStore((state) => state.stackOrder);
  const openWindow = useWorkspaceStore((state) => state.openWindow);

  // [新增] 訂閱購物車與 Auth 狀態
  const cart = useCartStore((state) => state.cart);
  const totalQuantity = cart?.totalQuantity || 0;
  const tier = useAuthStore((state) => state.tier); // [新增] 獲取當前層級

  // [修正] 推導 activeWindowId (Stack 的最後一個即為最上層/聚焦視窗)
  const activeWindowId = stackOrder.length > 0 ? stackOrder[stackOrder.length - 1] : null;
  const activeWindowTitle = activeWindowId && windows[activeWindowId]
    ? (windows[activeWindowId].title || 'Application')
    : 'Finder';

  const focusOrOpenWindow = useWorkspaceStore((state) => state.focusOrOpenWindow);

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

  // [新增] 開啟購物車視窗邏輯
  const handleOpenCart = () => {
    focusOrOpenWindow({
      title: 'Shopping Cart',
      content: { kind: WidgetKind.Cart, sourceId: 'cart' },
      initialGeometry: { width: 400, height: 600, x: window.innerWidth - 420, y: 50 }
    });
  };

  // [新增] 層級顯示設定
  const tierLabel = {
    guest: 'GUEST',
    member: 'MEMBER',
    pro: 'PRO',
    admin: 'ADMIN', // [修正] Admin 應該是大寫
  }[tier] || 'UNKNOWN';

  const tierStyle = {
    guest: 'bg-gray-200 text-gray-600',
    member: 'bg-blue-100 text-blue-700 border-blue-200',
    pro: 'bg-amber-100 text-amber-700 border-amber-200',
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
  }[tier] || 'bg-gray-200 text-gray-600';

  return (
    <div
      className={styles.menubarContainer}
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

      <div className="flex items-center h-full px-3 text-sm font-semibold text-black gap-3">

        {/* [新增] 用戶模式顯示 */}
        <div className={`px-2 py-0.5 text-[10px] rounded border ${tierStyle} uppercase tracking-wider`}>
          {tierLabel}
        </div>

        {/* [新增] 購物車按鈕 */}
        <button
          onClick={handleOpenCart}
          className="flex items-center gap-1 hover:bg-gray-300 px-2 py-0.5 rounded transition-colors"
        >
          <span>🛒</span>
          {totalQuantity > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full min-w-[1.2em] text-center">
              {totalQuantity}
            </span>
          )}
        </button>

        {/* 使用 suppressHydrationWarning 作為額外保險，雖然 mounted check 已經解決了大部分問題 */}
        <span suppressHydrationWarning>
          {mounted ? time : ''}
        </span>
      </div>
    </div>
  );
};