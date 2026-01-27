// app/components/system/WindowManager.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ClassicyWindow } from './window/ClassicyWindow';
import { WidgetRenderer } from '@/components/widgets/Registry';
// [New Imports]
import { useAuthStore } from '@/store/authStore';
import { WidgetKind, WidgetKindType } from '@/lib/types/workspace';

// Widget-specific height configuration
// Height can be a number (fixed) or 'auto' (use window's initialGeometry or default)
const WIDGET_HEIGHT_CONFIG: Partial<Record<WidgetKindType | string, number | 'auto'>> = {
  [WidgetKind.Auth]: 450,
  [WidgetKind.Cart]: 400,
  [WidgetKind.Product]: 300,
  [WidgetKind.Collection]: 600,
  [WidgetKind.Folder]: 200,
  [WidgetKind.PDFViewer]: 600,
  [WidgetKind.UserProfile]: 350,
  [WidgetKind.MediaPlayer]: 480,
  [WidgetKind.VideoVisual]: 400,
  [WidgetKind.ProductInfo]: 300,
};

// Widget-specific width configuration (optional)
const WIDGET_WIDTH_CONFIG: Partial<Record<WidgetKindType | string, number | 'auto'>> = {
  [WidgetKind.Auth]: 320,
  [WidgetKind.Cart]: 360,
  [WidgetKind.Product]: 400,
  [WidgetKind.Collection]: 500,
  [WidgetKind.Folder]: 200,
  [WidgetKind.PDFViewer]: 500,
  [WidgetKind.UserProfile]: 320,
};

export const WindowManager = () => {
  const { windows, stackOrder, isMissionControlActive } = useWorkspaceStore();
  const { tier } = useAuthStore();

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

  // --- Mission Control Layout Calculation ---
  const missionControlLayouts: Record<string, React.CSSProperties> = {};

  if (isMissionControlActive) {
    const visibleWindows = stackOrder.map(id => windows[id]).filter(Boolean); // Usually all in stack are visible
    const count = visibleWindows.length;

    if (count > 0) {
      // Grid Params
      const GAP = 20;
      const MARGIN_TOP = 40; // Space for labels/bar
      const MARGIN_BTM = 80;

      const availW = viewport.w - GAP * 2;
      const availH = viewport.h - MARGIN_TOP - MARGIN_BTM;

      // Calculate Cols/Rows (Squarish aspects)
      const idealAspect = availW / availH;
      const rows = Math.ceil(Math.sqrt(count / idealAspect)); // Rough approx
      const cols = Math.ceil(count / rows);

      const cellW = (availW - (cols - 1) * GAP) / cols;
      const cellH = (availH - (rows - 1) * GAP) / rows;

      visibleWindows.forEach((win, index) => {
        // Find grid position
        const rowIndex = Math.floor(index / cols);
        const colIndex = index % cols;

        // Target Cell Center
        const cellX = GAP + colIndex * (cellW + GAP);
        const cellY = MARGIN_TOP + rowIndex * (cellH + GAP);

        // Current 'Normal' Geometry (as rendered normally)
        // We reuse the logic below for "normal" geometry to know base size
        // But for simplicity, let's grab it from win.geometry if updated, or we need to run specific logic?
        // Actually, logic below calculates 'finalW' and 'finalH'. 
        // We should move that logic to a helper or just duplicate the essential clamping for consistency?
        // Let's rely on win.geometry from store which is roughly correct, 
        // BUT 'geometry' in store might be 'center' string.
        // So we need to resolve it. 
        // Let's refactor the resolution logic slightly or duplicate it for the MC pass.
      });
    }
  }

  // Helper to resolve geometry (Same as render loop)
  const resolveGeometry = (win: any) => {
    // 1. Get widget-specific dimensions or fallback
    const widgetKind = win.content.kind;
    const configHeight = WIDGET_HEIGHT_CONFIG[widgetKind];
    const configWidth = WIDGET_WIDTH_CONFIG[widgetKind];

    // Helper to parse dimension
    const parseDimension = (val: number | string | undefined, total: number): number => {
      if (typeof val === 'number') return val;
      if (!val) return 600;
      if (val === 'auto') return 600;

      const strVal = val as string;
      if (strVal.endsWith('vw')) return (parseFloat(strVal) / 100) * viewport.w;
      if (strVal.endsWith('vh')) return (parseFloat(strVal) / 100) * viewport.h;
      // Basic calc support
      if (strVal.startsWith('calc')) {
        const inner = strVal.replace('calc(', '').replace(')', '');
        const parts = inner.split('-').map(p => p.trim());
        if (parts.length === 2) {
          let base = 0;
          if (parts[0].endsWith('vh')) base = (parseFloat(parts[0]) / 100) * viewport.h;
          else if (parts[0].endsWith('vw')) base = (parseFloat(parts[0]) / 100) * viewport.w;
          else if (parts[0].endsWith('%')) base = (parseFloat(parts[0]) / 100) * total;
          let subtract = parseFloat(parts[1]);
          return base - subtract;
        }
      }
      return 600;
    };

    const geometryW = win.geometry.width;
    const geometryH = win.geometry.height;

    let baseW = configWidth && configWidth !== 'auto'
      ? (typeof configWidth === 'number' ? configWidth : 600)
      : parseDimension(geometryW, viewport.w);

    let baseH = configHeight && configHeight !== 'auto'
      ? (typeof configHeight === 'number' ? configHeight : 500)
      : parseDimension(geometryH, viewport.h);

    let finalW = baseW;
    let finalH = baseH;

    if (isMobile) {
      finalW = Math.min(baseW, viewport.w);
      finalH = Math.min(baseH, viewport.h - 96);
    } else {
      finalW = Math.min(baseW, viewport.w - 40);
      finalH = Math.min(baseH, viewport.h - 80);
    }

    let finalX = 0;
    let finalY = 0;

    if (win.geometry.x === 'center') finalX = (viewport.w - finalW) / 2;
    else if (win.geometry.x === 'right') finalX = viewport.w - finalW - 20;
    else if (typeof win.geometry.x === 'number') finalX = win.geometry.x;

    if (win.geometry.y === 'center') finalY = (viewport.h - finalH) / 2;
    else if (win.geometry.y === 'bottom') finalY = viewport.h - finalH - 80;
    else if (typeof win.geometry.y === 'number') finalY = win.geometry.y;

    // Clamp
    if (isMobile) {
      finalX = Math.max(0, Math.min(finalX, viewport.w - finalW));
      finalY = Math.max(42, Math.min(finalY, viewport.h - finalH));
    } else {
      finalX = Math.max(0, Math.min(finalX, viewport.w - finalW));
      finalY = Math.max(28, Math.min(finalY, viewport.h - finalH));
    }

    // Guest Auth override
    if (tier === 'guest' && win.content.kind === WidgetKind.Auth) {
      finalW = viewport.w;
      finalH = viewport.h;
      finalX = 0;
      finalY = 0;
    }

    return { x: finalX, y: finalY, width: finalW, height: finalH };
  };

  // Pre-calculate layouts if MC is active
  if (isMissionControlActive) {
    const visibleWindows = stackOrder.map(id => windows[id]).filter(Boolean);
    const count = visibleWindows.length;

    if (count > 0) {
      const GAP = 20;
      const MARGIN_TOP = 60;
      const MARGIN_BTM = 100;
      const availW = viewport.w - GAP * 2;
      const availH = viewport.h - MARGIN_TOP - MARGIN_BTM;

      const cols = Math.ceil(Math.sqrt(count * (availW / availH)));
      const rows = Math.ceil(count / cols);

      const cellW = (availW - (cols - 1) * GAP) / cols;
      const cellH = (availH - (rows - 1) * GAP) / rows;

      visibleWindows.forEach((win, index) => {
        const resolved = resolveGeometry(win);

        const r = Math.floor(index / cols);
        const c = index % cols;

        // Target box in grid
        const targetBoxX = GAP + c * (cellW + GAP);
        const targetBoxY = MARGIN_TOP + r * (cellH + GAP);

        // Scale to fit (contain) in cellW/cellH
        const scaleW = cellW / resolved.width;
        const scaleH = cellH / resolved.height;
        const scale = Math.min(scaleW, scaleH, 1); // Never scale up implies < 1. But allow slightly up? No, usually thumbnails.

        // Center in cell
        const centeredX = targetBoxX + (cellW - resolved.width * scale) / 2;
        const centeredY = targetBoxY + (cellH - resolved.height * scale) / 2;

        // Translate needed relative to current top/left (resolved.x, resolved.y)
        // transform-origin: top left
        const tx = centeredX - resolved.x;
        const ty = centeredY - resolved.y;

        missionControlLayouts[win.id] = {
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          transformOrigin: 'top left',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' // Enhanced shadow
        };
      });
    }
  }

  return (
    <>
      {/* Mission Control Backdrop */}
      {isMissionControlActive && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9000] transition-opacity duration-300"
          style={{ opacity: 1 }}
          onClick={() => useWorkspaceStore.getState().toggleMissionControl()}
        />
      )}

      {Object.values(windows).map((win) => {
        let zIndex = stackOrder.indexOf(win.id) + 10;
        const isActive = stackOrder[stackOrder.length - 1] === win.id;

        // Guest Auth Window Override
        if (tier === 'guest' && win.content.kind === WidgetKind.Auth) zIndex = 99999;

        const calculatedGeometry = resolveGeometry(win);

        // Apply MC override
        const mcStyle = missionControlLayouts[win.id] || {
          transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        };

        return (
          <ClassicyWindow
            key={win.id}
            id={win.id}
            title={win.title}
            isActive={isActive}
            geometry={calculatedGeometry}
            zIndex={isMissionControlActive ? 9001 + stackOrder.indexOf(win.id) : zIndex} // MC: flatten z-indexes above backdrop (9000)
            style={mcStyle}
            isDragDisabled={isMissionControlActive}
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