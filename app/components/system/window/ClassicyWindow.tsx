// app/components/system/window/ClassicyWindow.tsx
'use client';
import React, { useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useDraggable } from '@/hooks/useDraggable';
// import { PolygonFrame, getClipPath } from './PolygonFrame';
import styles from './ClassicyWindow.module.scss'; // Assuming we still need this for windowBody or if we want to pass custom styles
import { Point } from '@/hooks/usePolygon';
// import { ShapeEditor } from './ShapeEditor';
import { Window } from '@/components/ui/primitives/window';

interface ClassicyWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  geometry: { x: number; y: number; width: number; height: number };
  zIndex: number;
  points?: Point[]; // Optional custom polygon shape
  onUpdatePoints?: (points: Point[]) => void;
  isEditingShape?: boolean;
  style?: React.CSSProperties; // [新增] 允許覆蓋樣式 (Mission Control)
  isDragDisabled?: boolean; // [新增] 禁止拖曳
  isFrameless?: boolean; // [新增] 無邊框模式 (For Webamp etc)
}

export const ClassicyWindow: React.FC<ClassicyWindowProps> = ({
  id,
  title,
  children,
  isActive,
  geometry,
  zIndex,
  points,
  onUpdatePoints,
  isEditingShape = false,
  style: overrideStyle,
  isDragDisabled = false,
  isFrameless = false,
}) => {
  const { closeWindow, focusWindow, updateWindowGeometry } = useWorkspaceStore();
  const windowRef = useRef<HTMLDivElement>(null);

  // [修正] 傳入寬高以進行邊界計算
  const { position, handleDragStart, isDragging } = useDraggable(
    id,
    { x: geometry.x, y: geometry.y },
    { width: geometry.width, height: geometry.height }, // Dimensions
    (winId, newPos) => {
      updateWindowGeometry(winId, { x: newPos.x, y: newPos.y });
    },
    zIndex,
    focusWindow
  );

  const onDragHandler = isDragDisabled ? undefined : handleDragStart;

  // Determine if we should show the standard OS frame
  // If Frameless, we hide background, border, shadow, and TitleBar
  const showFrame = !points && !isFrameless;

  return (
    <Window.Frame
      ref={windowRef}
      isActive={isActive}
      className={`${styles.windowFrame} ${isActive ? 'active' : ''}`} // Keep existing class for extra SCSS specific to ClassicyWindow if needed, or rely on WindowFrame styles
      style={{
        position: 'absolute', // WindowFrame might not force absolute
        left: position.x,
        top: position.y,
        width: geometry.width,
        height: geometry.height,
        zIndex: zIndex,
        // If polygon or frameless, remove standard frame styles
        background: showFrame ? undefined : 'transparent',
        border: showFrame ? undefined : 'none',
        boxShadow: showFrame ? (isDragging ? '0 10px 20px rgba(0,0,0,0.3)' : undefined) : 'none',
        borderRadius: showFrame ? undefined : 0,
        pointerEvents: isFrameless ? 'none' : 'auto', // Allow clicks to pass through empty areas in frameless mode
        ...overrideStyle, // [新增] 套用覆蓋樣式
      }}
      // 點擊視窗本體聚焦 (桌面版) / 手機版 TouchStart 也觸發聚焦
      onMouseDown={() => focusWindow(id)}
      onTouchStart={() => focusWindow(id)}
    >
      {/* Title Bar: Standard Windows Only */}
      {showFrame && (
        <Window.TitleBar
          title={title}
          isActive={isActive}
          onClose={() => closeWindow(id)}
          // We pass handleDragStart to the logic that needs to drag. 
          // Existing TitleBar doesn't natively expose 'onDragStart' prop for the whole bar, 
          // but it spreads props. So we can pass onMouseDown/onTouchStart.
          onMouseDown={onDragHandler}
          onTouchStart={onDragHandler}
          style={{ cursor: 'default', touchAction: 'none' }} // [修正] 禁止瀏覽器預設手勢
        />
      )}

      {/* Window Body */}
      <div
        className={styles.windowBody}
        style={{
          ...(points ? {
            position: 'absolute',
            inset: 0,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            // clipPath: getClipPath(points) // Clip content to polygon
          } : undefined),
          // Ensure children can receive events even if parent has pointer-events: none
          pointerEvents: isFrameless ? 'auto' : undefined,
          // Frameless usually implies full bleed
          height: isFrameless ? '100%' : undefined
        }}
      >
        {/* 遮罩層：防止 iframe 在拖曳時吞掉事件，或在 Mission Control (isDragDisabled) 時防止誤觸內容 */}
        {(isDragging || isDragDisabled) && <div className="absolute inset-0 z-50 bg-transparent" />}
        {children}
      </div>
    </Window.Frame>
  );
};