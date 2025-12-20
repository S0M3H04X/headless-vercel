'use client';

import React, { useRef } from 'react';
import { LAYOUT } from '@/lib/constants/ui';

interface DesktopProps {
  children?: React.ReactNode;
}

export const Desktop: React.FC<DesktopProps> = ({ children }) => {
  const desktopRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={desktopRef} 
      className="relative w-full h-full overflow-hidden bg-gray-100"
      // [重構] 使用常數定義安全區域，確保不被 MenuBar 遮擋
      style={{ paddingTop: LAYOUT.MENU_BAR_HEIGHT }}
    >
      <div className="absolute inset-0 z-0 bg-[#3a6ea5]" />
      {children}
    </div>
  );
};