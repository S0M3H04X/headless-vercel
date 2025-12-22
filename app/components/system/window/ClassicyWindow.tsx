
'use client';
import React, { useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import styles from './ClassicyWindow.module.scss';

interface ClassicyWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  geometry: { x: number; y: number; width: number; height: number };
  zIndex: number;
}

export const ClassicyWindow: React.FC<ClassicyWindowProps> = ({
  id,
  title,
  children,
  isActive,
  geometry,
  zIndex,
}) => {
  const { closeWindow, focusWindow, updateWindowGeometry } = useWorkspaceStore();
  const windowRef = useRef<HTMLDivElement>(null);

  // 簡單的拖曳邏輯 (Native React Drag)
  // 注意：Phase 8 可升級為 @dnd-kit 或 react-draggable
  const handleMouseDown = (e: React.MouseEvent) => {
    focusWindow(id); // 點擊即聚焦
  };

  const handleDragStart = (e: React.MouseEvent) => {
    // 簡單實作：記錄初始位置，mousemove 計算 delta
    // 為了代碼簡潔，這裡暫時略過完整 Drag 實作，
    // 建議在下一步整合 useDraggable Hook 或直接使用現成庫。
    // 目前僅聚焦。
    focusWindow(id);
  };

  return (
    <div
      ref={windowRef}
      className={`${styles.windowFrame} ${isActive ? 'active' : ''}`}
      style={{
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        height: geometry.height,
        zIndex: zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div className={`${styles.titleBar} ${isActive ? styles.active : ''}`} onMouseDown={handleDragStart}>
        <button 
          className={`${styles.controlBtn} ${styles.closeBtn}`} 
          onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
        />
        
        <span className={`${styles.titleText} ${isActive ? styles.active : ''}`}>
          {title}
        </span>

        <button className={`${styles.controlBtn} ${styles.collapseBtn}`} />
      </div>

      {/* Content Area */}
      <div className={styles.windowBody}>
        {children}
      </div>
    </div>
  );
};