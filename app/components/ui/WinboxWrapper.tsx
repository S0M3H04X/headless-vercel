// app/components/ui/WinboxWrapper.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import 'winbox/dist/css/winbox.min.css'; // 確保這行有保留
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
    // [DEBUG] 確認組件有被渲染
    console.log(`[WinboxWrapper] Mounting window: ${title}`);

    // --- 修正導入方式 ---
    // 嘗試動態導入整個模組，這比 require 更安全
    import('winbox').then((mod) => {
        // WinBox 可能是 default export，也可能是 named export，視版本而定
        // 這裡做一個兼容處理
        const WinBox = mod.default || mod;

        if (!WinBox) {
            console.error('[WinboxWrapper] Failed to load Winbox module');
            return;
        }

        console.log('[WinboxWrapper] WinBox module loaded, creating instance...');

        const wb = new WinBox({
            title: title,
            id: id,
            x: geometry.x,
            y: geometry.y,
            width: geometry.width,
            height: geometry.height,
            class: ['modern', 'no-min', 'no-max', 'no-full'],
            index: zIndex,
            
            // 這裡必須給 body 一個背景色，否則透明背景會讓你以為沒東西
            background: '#fff', 

            onmove: function (x: number, y: number) {
                updateGeometry(id, { x, y });
            },
            onresize: function (width: number, height: number) {
                updateGeometry(id, { width, height });
            },
            onclose: function (force: boolean) {
                closeWindow(id);
                return false; 
            },
            onfocus: function () {
                focusWindow(id);
            },
        });

        console.log('[WinboxWrapper] WinBox instance created:', wb);

        winboxRef.current = wb;
        setMountNode(wb.body);
    }).catch(err => {
        console.error('[WinboxWrapper] Error importing winbox:', err);
    });

    return () => {
      if (winboxRef.current) {
        winboxRef.current.close(true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    const wb = winboxRef.current;
    if (!wb) return;
    wb.setTitle(title);
    
    const winboxElement = document.getElementById(id);
    if (winboxElement) {
        winboxElement.style.zIndex = zIndex.toString();
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