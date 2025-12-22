
'use client';
import React, { useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useDraggable } from '@/hooks/useDraggable';
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
    <div
      className={`${styles.windowFrame} ${isActive ? 'active' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: geometry.width,
        height: geometry.height,
        zIndex: zIndex,
        // 拖曳時加上 shadow 強化浮動感
        boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.3)' : undefined, 
      }}
      // 點擊視窗本體聚焦 (桌面版) / 手機版 TouchStart 也觸發聚焦
      onMouseDown={() => focusWindow(id)} 
      onTouchStart={() => focusWindow(id)}
    >
      {/* Title Bar: 綁定 Mouse 與 Touch */}
      <div 
        className={`${styles.titleBar} ${isActive ? styles.active : ''}`}
        onMouseDown={handleDragStart} // 滑鼠
        onTouchStart={handleDragStart} // [修正] 手機觸控
        style={{ cursor: 'default', touchAction: 'none' }} // [修正] 禁止瀏覽器預設手勢
      >
        <button 
          className={`${styles.controlBtn} ${styles.closeBtn}`} 
          // 阻止事件冒泡，避免按鈕觸發拖曳
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
        />
        
        <span className={`${styles.titleText} ${isActive ? styles.active : ''}`}>
          {title}
        </span>

        <button className={`${styles.controlBtn} ${styles.collapseBtn}`} />
      </div>

      <div className={styles.windowBody}>
        {/* 遮罩層：防止 iframe 在拖曳時吞掉事件 */}
        {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}
        {children}
      </div>
    </div>
  );
};