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
        // If polygon, remove standard frame styles
        background: points ? 'transparent' : undefined,
        border: points ? 'none' : undefined,
        boxShadow: points ? 'none' : (isDragging ? '0 10px 20px rgba(0,0,0,0.3)' : undefined),
        borderRadius: points ? 0 : undefined,
      }}
      // 點擊視窗本體聚焦 (桌面版) / 手機版 TouchStart 也觸發聚焦
      onMouseDown={() => focusWindow(id)}
      onTouchStart={() => focusWindow(id)}
    >
      {/* Polygon Frame Background */}
      {/* {points && (
        <PolygonFrame
          points={points}
          width={geometry.width}
          height={geometry.height}
        />
      )} */}

      {/* Shape Editor Overlay */}
      {/* {isEditingShape && points && onUpdatePoints && (
        <ShapeEditor
          points={points}
          width={geometry.width}
          height={geometry.height}
          onMoveVertex={(index, pos) => {
            const newPoints = [...points];
            newPoints[index] = pos;
            onUpdatePoints(newPoints);
          }}
          onAddVertex={(index, pos) => {
            const newPoints = [...points];
            // Insert after index (which is what index represents in ShapeEditor midpoints)
            newPoints.splice(index + 1, 0, pos);
            onUpdatePoints(newPoints);
          }}
        />
      )} */}

      {/* Title Bar: Standard Windows Only */}
      {/* {!points && ( // Hide standard title bar for polygon windows? Or keep it? keeping for now but maybe inside? */}

      {/* Using Window.TitleBar */}
      <Window.TitleBar
        title={title}
        isActive={isActive}
        onClose={() => closeWindow(id)}
        // We pass handleDragStart to the logic that needs to drag. 
        // Existing TitleBar doesn't natively expose 'onDragStart' prop for the whole bar, 
        // but it spreads props. So we can pass onMouseDown/onTouchStart.
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ cursor: 'default', touchAction: 'none' }} // [修正] 禁止瀏覽器預設手勢
      // Note: TitleBar expects 'children' for custom controls or 'onClose', 'onMinimize' etc.
      // We can pass children if we want to customize the buttons exactly like before
      >
        {/* If we want to strictly match the previous implementation which had close, title, and collapse button */}

        {/* Close Button */}
        {/* We can use the simplified props: onClose={() => closeWindow(id)} passed to TitleBar above, 
            but the previous code had specific e.stopPropagation() logic.
            The new WindowTitleBar's auto-generated buttons use onClick. We might want to be careful about drag propagation.
            However, usually buttons on titlebars stop propagation of drag if they are clickable.
            Let's try using the standard props first. If we need custom buttons, we use children.
        */}

        {/* The previous code had:
             <button closeBtn ... onClick={(e) => { e.stopPropagation(); closeWindow(id); }} />
             <span title ... />
             <button collapseBtn ... /> 
        */}

        {/* Let's try to match the EXACT previous layout using children to be safe, 
            or rely on standard TitleBar if it's close enough.
            The user wants to "Update ClassicyWindow to the UI Window Primitives".
            Usually this means "use the standard way".
            The standard way is passing `onClose`.
        */}
      </Window.TitleBar>

      {/* )} */}

      <div
        className={styles.windowBody}
        style={points ? {
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          // clipPath: getClipPath(points) // Clip content to polygon
        } : undefined}
      >
        {/* 遮罩層：防止 iframe 在拖曳時吞掉事件 */}
        {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}
        {children}
      </div>
    </Window.Frame>
  );
};