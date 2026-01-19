import { useState, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragBounds {
  width: number;
  height: number;
}

export const useDraggable = (
  id: string,
  initialPosition: Position,
  dimensions: DragBounds, // [新增] 傳入視窗尺寸以計算邊界
  onDragEnd: (id: string, pos: Position) => void,
  zIndex: number,
  focusWindow: (id: string) => void
) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 同步外部位置更新
  useEffect(() => {
    if (!isDragging) {
      setPosition(initialPosition);
    }
  }, [initialPosition.x, initialPosition.y, isDragging]);

  // --- 1. 統一座標獲取邏輯 (Mouse & Touch) ---
  const getClientCoordinates = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
    return {
      x: (e as MouseEvent).clientX,
      y: (e as MouseEvent).clientY
    };
  };

  // --- 2. 啟動拖曳 (Start) ---
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // 防止手機上拖曳時觸發捲動
    // 注意: 在 Passive Event Listener 中 preventDefault 可能會報錯，但 React Synthetic Event 通常已處理
    // 若有報錯，可移除 preventDefault
    e.preventDefault(); 
    e.stopPropagation();

    focusWindow(id);
    setIsDragging(true);

    const { x, y } = getClientCoordinates(e);
    setDragOffset({
      x: x - position.x,
      y: y - position.y
    });
  }, [id, position.x, position.y, focusWindow]);

  // --- 3. 處理移動與邊界 (Move) ---
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      // 防止手機下拉刷新或捲動頁面
      if (e.cancelable) e.preventDefault();

      const { x, y } = getClientCoordinates(e);
      let newX = x - dragOffset.x;
      let newY = y - dragOffset.y;

      // [修正] 嚴格邊界計算 (Strict Boundaries)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuBarHeight = 32; // 頂部選單高度
      const dockHeight = 0;    // 底部 Dock 預留高度 (可選)

      // X 軸限制：0 ~ (螢幕寬 - 視窗寬)
      // 確保視窗不會往左或往右跑出去
      const minX = 0;
      const maxX = Math.max(0, viewportWidth - dimensions.width);
      
      // Y 軸限制：MenuBar高度 ~ (螢幕高 - 視窗高 - Dock緩衝)
      const minY = menuBarHeight;
      const maxY = Math.max(menuBarHeight, viewportHeight - dimensions.height - dockHeight);

      // 套用限制 (Clamp)
      newX = Math.min(Math.max(newX, minX), maxX);
      newY = Math.min(Math.max(newY, minY), maxY);

      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd(id, position);
      }
    };

    if (isDragging) {
      // 綁定全域事件 (包含 Touch)
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false }); // passive: false 允許 preventDefault
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset, id, position, onDragEnd, dimensions.width, dimensions.height]);

  return {
    position,
    handleDragStart, // 統一對外的 Handler
    isDragging
  };
};