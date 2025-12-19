'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WidgetKind } from '@/lib/types/workspace';
import { ScenarioService } from '@/lib/services/scenarioService';

// 定義 App 按鈕的設定 (Icon, Action, Title)
const APP_CONFIG: Record<string, { label: string; color: string; action: () => void }> = {
  'product_browser': {
    label: 'Tee',
    color: 'bg-blue-600',
    action: () => ScenarioService.launchProductSuite('tee')
  },
  'video_studio': {
    label: 'Studio',
    color: 'bg-purple-600',
    action: () => ScenarioService.launchVideoStudio('01')
  },
  'pdf_viewer': {
    label: 'PDF',
    color: 'bg-red-600',
    action: () => useWorkspaceStore.getState().openWindow({
      title: 'Dissertation',
      content: { kind: WidgetKind.PDFViewer, sourceId: '/assets/pdf/dissertation.pdf' },
      initialGeometry: { x: 300, y: 100, width: 600, height: 800 },
    })
  },
  'cart': {
    label: 'Cart',
    color: 'bg-green-600',
    action: () => useWorkspaceStore.getState().focusOrOpenWindow({
      title: 'My Cart',
      content: { kind: WidgetKind.Cart, sourceId: 'cart' }
    })
  },
  'profile': {
    label: 'Account',
    color: 'bg-gray-800',
    action: () => useWorkspaceStore.getState().focusOrOpenWindow({
      title: 'Profile',
      content: { kind: WidgetKind.UserProfile, sourceId: 'me' }
    })
  },
  // Launcher 本身通常不顯示在 Dock 中，或是作為開始選單
  'launcher': { label: 'Start', color: 'bg-black', action: () => {} } 
};

export const Launcher = () => {
  // [修正] 讀取 Store 中的 installedApps
  const installedApps = useWorkspaceStore((s) => s.installedApps);

  if (!installedApps || installedApps.length === 0) return null;

  return (
    <div className="absolute top-10 left-4 z-30 flex gap-2 flex-wrap pointer-events-auto">
      {installedApps.map((appId) => {
        const config = APP_CONFIG[appId];
        // 如果 Config 沒定義 (例如 launcher)，則跳過或顯示預設
        if (!config) return null; 

        return (
          <button
            key={appId}
            className={`px-4 py-2 text-white rounded shadow hover:opacity-90 transition-opacity ${config.color}`}
            onClick={config.action}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};