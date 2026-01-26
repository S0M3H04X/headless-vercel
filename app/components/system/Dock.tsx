'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { PixelIcon } from '@/components/ui/primitives/PixelIcon';
import { WidgetKind } from '@/lib/types/workspace';
import { ScenarioService } from '@/lib/services/scenarioService';
import { canAccess, type UserTier } from '@/lib/utils/tierUtils';
import styles from './Dock.module.scss';

// App config with tier requirements
interface AppConfig {
  label: string;
  icon: string;
  requiredTier: UserTier;
  action: () => void;
}

const APP_CONFIG: Record<string, AppConfig> = {
  'product_browser': {
    label: 'Store',
    icon: 'shop',
    requiredTier: 'admin',
    action: () => ScenarioService.launchProductSuite('tee')
  },
  'video_studio': {
    label: 'Studio',
    icon: 'retro-camera',
    requiredTier: 'admin', // VideoControl/Visual/Mixer are admin-only, but Studio app is member
    action: () => ScenarioService.launchVideoStudio('01')
  },
  'pdf_viewer': {
    label: 'Files',
    icon: 'folder-open',
    requiredTier: 'member',
    action: () => useWorkspaceStore.getState().openWindow({
      title: 'System Manual.pdf',
      content: { kind: WidgetKind.PDFViewer, sourceId: '/assets/pdf/dissertation.pdf' },
      initialGeometry: { x: 'center', y: 'center', width: 600, height: 700 },
    })
  },
  'cart': {
    label: 'Cart',
    icon: 'shopping-cart',
    requiredTier: 'member',
    action: () => useWorkspaceStore.getState().focusOrOpenWindow({
      title: 'Cart',
      content: { kind: WidgetKind.Cart, sourceId: 'cart' },
      initialGeometry: { x: 'right', y: 'bottom', width: 350, height: 500 }
    })
  },
  'profile': {
    label: 'My PC',
    icon: 'user',
    requiredTier: 'member',
    action: () => useWorkspaceStore.getState().focusOrOpenWindow({
      title: 'My Account',
      content: { kind: WidgetKind.UserProfile, sourceId: 'me' }
    })
  },
  'launcher': {
    label: 'Start',
    icon: 'grid',
    requiredTier: 'guest', // Always accessible
    action: () => { console.log('Open Start Menu'); }
  }
};

export const Dock = () => {
  const installedApps = useWorkspaceStore((s) => s.installedApps);
  const windows = useWorkspaceStore((s) => s.windows);
  const { tier, login } = useAuthStore();

  const isAppRunning = (appId: string) => {
    return false;
  };

  const handleAppClick = (appId: string, config: AppConfig) => {
    if (!canAccess(tier, config.requiredTier)) {
      console.warn(`[Dock] ${config.label} requires ${config.requiredTier} tier`);
      login(); // Prompt login for access
      return;
    }
    config.action();
  };

  if (!installedApps || installedApps.length === 0) return null;

  return (
    <div className={styles.dockContainer}>
      <div className={styles.dockPanel}>
        {installedApps.map((appId) => {
          const config = APP_CONFIG[appId];
          if (!config) return null;

          const isLocked = !canAccess(tier, config.requiredTier);

          return (
            <button
              key={appId}
              onClick={() => handleAppClick(appId, config)}
              className={`${styles.dockItem} ${isLocked ? styles.locked : ''}`}
              aria-label={config.label}
              title={isLocked ? `${config.label} (Login required)` : config.label}
            >
              <PixelIcon name={config.icon} className={isLocked ? 'opacity-50' : 'text-black'} style={{ fontSize: '2rem' }} />
              <span className={styles.tooltip}>{config.label}</span>
              {isAppRunning(appId) && <div className={styles.runningDot} />}
            </button>
          );
        })}
      </div>


    </div>
  );
};