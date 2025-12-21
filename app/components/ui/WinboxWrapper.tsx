'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// 雖然 bundle 可能包含 CSS，但顯式引入樣式通常更保險且不會衝突

import { WindowInstance } from '@/lib/types/workspace';
import { useWorkspaceStore } from '@/store/workspaceStore';

import '@/styles/winbox-controls.css';
import '@/styles/winbox-retro.css';

interface WinboxProviderProps {
  windowInstance: WindowInstance;
  children: React.ReactNode;
}

export const WinboxProvider: React.FC<WinboxProviderProps> = ({ windowInstance, children }) => {
  const { id, title, geometry, zIndex, internalState } = windowInstance;
  const updateGeometry = useWorkspaceStore((s) => s.updateWindowGeometry);
  const closeWindow = useWorkspaceStore((s) => s.closeWindow);
  const focusWindow = useWorkspaceStore((s) => s.focusWindow);

  const winboxRef = useRef<any>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log(`[WinboxProvider] Initializing: ${title}`);

    // --- 最終修正策略：Bundle + Window Access ---
    // 1. 引入 "bundle" 版本，確保所有依賴(template/helper)都已打包，不會有路徑解析錯誤。
    // 2. 使用 .js 副檔名明確指定文件。
    import('winbox/dist/winbox.bundle.min.js')
      .then(() => {
        if (!isMounted) return;

        // Winbox 的 bundle 版本通常會將自己掛載到 window.WinBox
        // 我們直接從 window 獲取，這是最穩健的方法，避開了 ESM/CJS 的互操作性地雷
        const WinBoxConstructor = (window as any).WinBox;

        if (typeof WinBoxConstructor !== 'function') {
          console.error('[WinboxProvider] Critical: WinBox not found on window object after import.');
          return;
        }

        console.log('[WinboxProvider] Constructor found via window.WinBox');

        const wb = new WinBoxConstructor({
          title: title,
          id: id,
          x: window.innerWidth < 640 ? 'center' : geometry.x,
          y: geometry.y,
          width: window.innerWidth < 640 ? '90%' : geometry.width,
          height: geometry.height,
          class: ['modern', 'no-min', 'no-max', 'no-full'],
          index: zIndex,
          top: 32,
          right: 0,
          bottom: 0, // 預留底部 Dock 空間
          left: 0,
          background: '#fff', // 確保背景不是透明

          // 必須在此定義事件，確保 this 上下文正確
          onmove: function (x: number, y: number) {
            updateGeometry(id, { x, y });
          },
          onresize: function (width: number, height: number) {
            updateGeometry(id, { width, height });
          },
          onclose: function (force: boolean) {
            // 這裡返回 true 會允許關閉，但我們希望由 React 卸載
            // 所以我們先觸發 Store 的關閉，這會導致 WinboxProvider 被 Unmount
            // 然後在 cleanup function 裡執行真正的 winbox.close()
            closeWindow(id);
            return false;
          },
          onfocus: function () {
            focusWindow(id);
          },
        });

        // --- [新增] Dev 環境專屬 Header 面板 ---
        if (process.env.NODE_ENV === 'development') {

          // 1. Debug 按鈕 (印出狀態)
          wb.addControl({
            index: 0,
            class: "wb-debug", // 對應 CSS icon
            image: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2'%3E%3Cpath d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' /%3E%3C/svg%3E",
            click: function (event: any, winbox: any) {
              console.log(`[🔍 Debug ${id}]`, {
                geometry: { x: winbox.x, y: winbox.y, w: winbox.width, h: winbox.height },
                internalState: internalState,
                zIndex: winbox.index
              });
              alert(`Debug Info Logged for ${title}`);
            }
          });

          // 2. Refresh 按鈕 (模擬重載 Widget)
          wb.addControl({
            index: 0,
            class: "wb-refresh",
            image: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2'%3E%3Cpath d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' /%3E%3C/svg%3E",
            click: function (event: any, winbox: any) {
              // 這裡可以實作更複雜的邏輯，例如強制卸載再掛載 Portal
              winbox.setTitle(title + " (Reloading...)");
              setTimeout(() => winbox.setTitle(title), 500);
            }
          });
        }
        // -------------------------------------

        // 確保引用
        winboxRef.current = wb;

        // 將 Winbox 的 body 設為 Portal 的目標
        setMountNode(wb.body);
      })
      .catch((e) => console.error('[WinboxProvider] Bundle Import Failed:', e));

    return () => {
      isMounted = false;
      if (winboxRef.current) {
        try {
          // 強制關閉 DOM 元素
          winboxRef.current.close(true);
        } catch (e) {
          console.warn('[WinboxProvider] Cleanup error:', e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 同步屬性變更到 Winbox 實例 (React -> Non-React Sync)
  useEffect(() => {
    const wb = winboxRef.current;
    if (!wb) return;

    // 同步標題
    if (title) wb.setTitle(title);

    // 同步 Z-Index (操作 DOM)
    const el = document.getElementById(id);
    if (el) {
      el.style.zIndex = zIndex.toString();
    }
  }, [title, zIndex, id]);

  if (!mountNode) return null;

  return createPortal(
    <div className="h-full w-full overflow-auto">
      {children}
    </div>,
    mountNode
  );
};