// app/components/system/WindowManager.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ClassicyWindow } from './window/ClassicyWindow';
import { WidgetRenderer } from '@/components/widgets/Registry';

export const WindowManager = () => {
  const { windows, stackOrder } = useWorkspaceStore();
  
  // 1. 監聽視口尺寸 (Viewport)
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      setViewport({ 
        w: window.innerWidth, 
        h: window.innerHeight 
      });
    };
    
    // 初始化
    update();
    
    // 監聽 RWD 變化 (旋轉/縮放)
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // SSR 防呆：尚未取得視窗尺寸前不渲染 (避免閃爍)
  if (viewport.w === 0) return null;

  const isMobile = viewport.w < 768; // Tailwind 'md' breakpoint

  return (
    <>
      {Object.values(windows).map((win) => {
        const zIndex = stackOrder.indexOf(win.id) + 10;
        const isActive = stackOrder[stackOrder.length - 1] === win.id;

        // --- RWD Geometry Calculation Engine ---

        // 1. 取得原始設定或預設值
        let baseW = typeof win.geometry.width === 'number' ? win.geometry.width : 600;
        let baseH = typeof win.geometry.height === 'number' ? win.geometry.height : 500;

        // 2. [關鍵修正] 強制尺寸約束 (Size Constraints)
        let finalW = baseW;
        let finalH = baseH;

        if (isMobile) {
            // Mobile: 寬度佔滿 95% 或留邊，高度適應但保留 Dock 空間
            finalW = Math.min(baseW, viewport.w); // 左右各留 8px
            finalH = Math.min(baseH, viewport.h - 96); // 扣除 MenuBar(30) + Dock(60) + Buffer
        } else {
            // Desktop: 僅防止溢出螢幕
            finalW = Math.min(baseW, viewport.w - 40);
            finalH = Math.min(baseH, viewport.h - 80);
        }

        // 3. 位置計算 (Positioning)
        let finalX = 0;
        let finalY = 0;

        // 解析 X
        if (win.geometry.x === 'center') {
            finalX = (viewport.w - finalW) / 2;
        } else if (win.geometry.x === 'right') {
            finalX = viewport.w - finalW - 20;
        } else if (typeof win.geometry.x === 'number') {
            finalX = win.geometry.x;
        }

        // 解析 Y
        if (win.geometry.y === 'center') {
            finalY = (viewport.h - finalH) / 2;
        } else if (win.geometry.y === 'bottom') {
            finalY = viewport.h - finalH - 80; // Dock space
        } else if (typeof win.geometry.y === 'number') {
            finalY = win.geometry.y;
        }

        // 4. [關鍵修正] 邊界防呆 (Boundary Clamp)
        // 確保視窗不會因為計算誤差而跑出螢幕左側或上方
        // 手機版強制水平置中
        if (isMobile) {
            finalX = (viewport.w - finalW) / 2;
            // 確保標題列可見
            finalY = Math.max(32, Math.min(finalY, viewport.h - finalH - 60)); 
        } else {
            // Desktop Clamp
            finalX = Math.max(0, Math.min(finalX, viewport.w - finalW));
            finalY = Math.max(28, Math.min(finalY, viewport.h - finalH));
        }

        const calculatedGeometry = {
            x: finalX,
            y: finalY,
            width: finalW,
            height: finalH,
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