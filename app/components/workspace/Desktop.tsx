'use client';

import React, { useRef } from 'react';
// 移除 AuthWidget 的 import
// import { AuthWidget } from '@/components/desktop/AuthWidget'; 

interface DesktopProps {
  children?: React.ReactNode;
}

export const Desktop: React.FC<DesktopProps> = ({ children }) => {
  const desktopRef = useRef<HTMLDivElement>(null);

  return (
    // Desktop 容器：負責背景與基本佈局 (Relative Positioning)
    <div ref={desktopRef} className="relative w-full h-full overflow-hidden bg-gray-100">
      
      {/* 1. Wallpaper Layer (可選，目前是純色) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-100 to-gray-200" />

      {/* 2. Composition Layer (Children) */}
      {/* AuthWidget, Icons, Windows 都將透過 children 傳入 */}
      {children}

    </div>
  );
};