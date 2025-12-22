// app/components/system/WindowManager.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ClassicyWindow } from './window/ClassicyWindow';
import { WidgetRenderer } from '@/components/widgets/Registry';

export const WindowManager = () => {
  const { windows, stackOrder } = useWorkspaceStore();
  
  // [新增] 視窗尺寸狀態，用於觸發重算
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    // 初始化與 RWD 監聽
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <>
      {Object.values(windows).map((win) => {
        const zIndex = stackOrder.indexOf(win.id) + 10;
        const isActive = stackOrder[stackOrder.length - 1] === win.id;

        // [關鍵修正] RWD Geometry 計算邏輯
        // 如果還沒拿到 viewport (SSR 階段)，先隱藏或給預設值
        if (viewport.w === 0) return null;

        let finalX = 100;
        let finalY = 100;
        const winW = typeof win.geometry.width === 'number' ? win.geometry.width : 400;
        const winH = typeof win.geometry.height === 'number' ? win.geometry.height : 300;

        // 處理 "center"
        if (win.geometry.x === 'center') {
            finalX = (viewport.w - winW) / 2;
        } else if (typeof win.geometry.x === 'number') {
            finalX = win.geometry.x;
        }

        if (win.geometry.y === 'center') {
            finalY = (viewport.h - winH) / 2;
        } else if (typeof win.geometry.y === 'number') {
            finalY = win.geometry.y;
        }

        // [防呆] 確保視窗不會跑出螢幕左上角
        finalX = Math.max(0, finalX);
        finalY = Math.max(24, finalY); // 保留 MenuBar 空間

        const calculatedGeometry = {
            x: finalX,
            y: finalY,
            width: winW,
            height: winH,
        };

        return (
          <ClassicyWindow
            key={win.id}
            id={win.id}
            title={win.title}
            isActive={isActive}
            geometry={calculatedGeometry}
            zIndex={zIndex}
          >
            <WidgetRenderer 
                id={win.id}
                content={win.content} 
                internalState={win.internalState} 
            />
          </ClassicyWindow>
        );
      })}
    </>
  );
};