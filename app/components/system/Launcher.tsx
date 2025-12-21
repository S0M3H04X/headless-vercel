'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { WidgetKind } from '@/lib/types/workspace';
import { ScenarioService } from '@/lib/services/scenarioService';

// 定義 App 按鈕的設定 (Icon, Action, Title)
const APP_CONFIG: Record<string, { label: string; action: () => void }> = {
  'product_browser': {
    label: 'Store',
    action: () => ScenarioService.launchProductSuite('tee')
  },
  'video_studio': {
    label: 'Studio',
    action: () => ScenarioService.launchVideoStudio('01')
  },
  'pdf_viewer': {
    label: 'Files',
    action: () => useWorkspaceStore.getState().openWindow({
      title: 'System Manual.pdf',
      content: { kind: WidgetKind.PDFViewer, sourceId: '/assets/pdf/dissertation.pdf' },
      initialGeometry: { x: 'center', y: 'center', width: 600, height: 700 }, // 使用 'center'
    })
  },
  'cart': {
    label: 'Cart',
    action: () => useWorkspaceStore.getState().focusOrOpenWindow({
      title: 'Cart',
      content: { kind: WidgetKind.Cart, sourceId: 'cart' },
      initialGeometry: { x: 'right', y: 'bottom', width: 350, height: 500 }
    })
  },
  'profile': {
    label: 'My PC',
    action: () => useWorkspaceStore.getState().focusOrOpenWindow({
      title: 'My Account',
      content: { kind: WidgetKind.UserProfile, sourceId: 'me' }
    })
  },
  'launcher': {
    label: 'Start', 
    action: () => { console.log('Open Start Menu'); } // 未來可做開始選單
  } 
};

export const Launcher = () => {
  // [修正] 讀取 Store 中的 installedApps
  const installedApps = useWorkspaceStore((s) => s.installedApps);
  const windows = useWorkspaceStore((s) => s.windows);

  if (!installedApps || installedApps.length === 0) return null;

  return (
    // Dock Container: 底部置中
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40">
      <div className="
        flex items-end gap-2 px-4 py-2 
        bg-[#c0c0c0] 
        dock-container border-black border-1
      ">
        {installedApps.map((appId) => {
          const config = APP_CONFIG[appId];
          if (!config) return null;

          // 檢查該 App 是否有視窗正在運行 (簡單判斷: title 或 kind 匹配，這裡簡化為 appId 關聯)
          // 實務上可能需要更嚴謹的 isRunning 判斷
          const isRunning = false; 

          return (
            <button
              key={appId}
              onClick={config.action}
              className="
                group relative flex flex-col items-center justify-center 
                w-12 h-12 dock-app-button
                border-1
                active:border-t-black active:border-l-black active:border-b-white active:border-r-white /* Active 凹陷 */
              "
              title={config.label} // Native Tooltip
            >
              <PixelIcon name={appId} size={28} className="text-black" />
              
              {/* Tooltip (Hover Show) - Pixel Style */}
              <span className="
                absolute -top-10 left-1/2 -translate-x-1/2 
                bg-[#ffffe0] border border-black text-black text-xs font-mono px-1 py-1
                opacity-0 group-hover:opacity-100 hidden group-hover:block
                pointer-events-none whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]
              ">
                {config.label}
              </span>

              {/* Running Indicator (Dot) */}
              {isRunning && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-black rounded-none"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};