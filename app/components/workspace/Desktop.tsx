'use client';
import React from 'react';
import { RetroOSLayout } from '@/components/layout/RetroOSLayout';
import { MenuBar } from '@/components/system/MenuBar';
import { Dock } from '@/components/system/Dock'; // Dock
import { WindowManager } from '@/components/system/WindowManager';
import { Finder } from '@/components/system/Finder'; // [新增] 背景與桌面圖示層

export const Desktop = () => {
  return (
    <RetroOSLayout>
      {/* Layer 1: Background & Desktop Icons (The Finder) */}
      <Finder />

      {/* Layer 2: Window Manager (Independent) */}
      <WindowManager />

      {/* Layer 3: System UI */}
      <MenuBar />
      <Dock />
    </RetroOSLayout>
  );
};