'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { WidgetKind } from '@/lib/types/workspace';
import { ScenarioService } from '@/lib/services/scenarioService';
import styles from '@/styles/classicy/dock.module.scss';

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
  const isAppRunning = (appId: string) => {
      // 這裡需要一個 Mapping 邏輯，目前簡化處理
      return false; 
  };

  if (!installedApps || installedApps.length === 0) return null;

  return (
    <div className={styles.dockContainer}>
      <div className={styles.dockPanel}>
        {installedApps.map((appId) => {
          const config = APP_CONFIG[appId];
          if (!config) return null;

          return (
            <button
              key={appId}
              onClick={config.action}
              className={styles.dockItem}
              aria-label={config.label}
            >
              {/* 圖示 */}
              <PixelIcon name={appId} size={32} className="text-black" />
              
              {/* Tooltip */}
              <span className={styles.tooltip}>{config.label}</span>

              {/* 運行指示燈 (Running Dot) */}
              {isAppRunning(appId) && <div className={styles.runningDot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};