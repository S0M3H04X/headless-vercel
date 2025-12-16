'use client';

import React, { useRef } from 'react';

interface DesktopProps {
  children?: React.ReactNode;
}

export const Desktop: React.FC<DesktopProps> = ({ children }) => {
  const desktopRef = useRef<HTMLDivElement>(null);

  return (
    // Desktop 容器
    // [修正] 加入 pt-8 (32px) 為頂部 MenuBar 預留空間
    <div ref={desktopRef} className="relative w-full h-full overflow-hidden bg-gray-100 pt-8">
      
      {/* 1. Wallpaper Layer */}
      {/* 這裡保持 inset-0，背景圖會延伸到 MenuBar 下方，但因為 MenuBar 有背景色所以沒關係 */}
      <div className="absolute inset-0 z-0 bg-[#3a6ea5]" /> {/* 改個稍微深一點的經典藍，對比灰階 MenuBar */}

      {/* 2. Composition Layer (Children) */}
      {children}

    </div>
  );
};