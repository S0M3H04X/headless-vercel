'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// 雖然 bundle 可能包含 CSS，但顯式引入樣式通常更保險且不會衝突
import 'winbox/dist/css/winbox.min.css'; 
import { WindowInstance } from '@/lib/types/workspace';
import { useWorkspaceStore } from '@/store/workspaceStore';

interface WinboxWrapperProps {
  windowInstance: WindowInstance;
  children: React.ReactNode;
}

export const WinboxWrapper: React.FC<WinboxWrapperProps> = ({ windowInstance, children }) => {
  const { id, title, geometry, zIndex } = windowInstance;
  const updateGeometry = useWorkspaceStore((s) => s.updateGeometry);
  const closeWindow = useWorkspaceStore((s) => s.closeWindow);
  const focusWindow = useWorkspaceStore((s) => s.focusWindow);

  const winboxRef = useRef<any>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log(`[WinboxWrapper] Initializing: ${title}`);

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
            console.error('[WinboxWrapper] Critical: WinBox not found on window object after import.');
            return;
        }

        console.log('[WinboxWrapper] Constructor found via window.WinBox');

        const wb = new WinBoxConstructor({
            title: title,
            id: id,
            x: geometry.x,
            y: geometry.y,
            width: geometry.width,
            height: geometry.height,
            class: ['modern', 'no-min', 'no-max', 'no-full'],
            index: zIndex,
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
                // 所以我們先觸發 Store 的關閉，這會導致 WinboxWrapper 被 Unmount
                // 然後在 cleanup function 裡執行真正的 winbox.close()
                closeWindow(id);
                return false; 
            },
            onfocus: function () {
                focusWindow(id);
            },
        });

        // 確保引用
        winboxRef.current = wb;
        
        // 將 Winbox 的 body 設為 Portal 的目標
        setMountNode(wb.body);
      })
      .catch((e) => console.error('[WinboxWrapper] Bundle Import Failed:', e));

    return () => {
      isMounted = false;
      if (winboxRef.current) {
        try {
          // 強制關閉 DOM 元素
          winboxRef.current.close(true); 
        } catch(e) { 
          console.warn('[WinboxWrapper] Cleanup error:', e); 
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
    <div className="h-full w-full overflow-auto bg-white text-black p-4">
      {children}
    </div>,
    mountNode
  );
};