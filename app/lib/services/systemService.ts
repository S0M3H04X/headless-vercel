// app/lib/services/systemService.ts
import { useWorkspaceStore } from '@/store/workspaceStore';

type SystemWindowType = 'ABOUT' | 'SETTINGS' | 'SOCIAL';

/**
 * SystemService: 負責處理全域系統指令與視窗工廠邏輯
 * 解耦 UI (SystemMenu) 與 業務邏輯 (Window Creation)
 */
export const SystemService = {
  openSystemWindow: (type: SystemWindowType) => {
    // 直接存取 Store (Zustand 允許在元件外使用 getState)
    const openWindow = useWorkspaceStore.getState().openWindow;

    switch (type) {
      case 'ABOUT':
        openWindow({
          title: 'About Headless OS',
          content: { 
            kind: 'text_viewer', // 需確保 Registry 有對應或 Fallback
            sourceId: 'system_about',
            initialMeta: { text: 'Headless OS v1.0\nPowered by Next.js & Python' }
          },
          initialGeometry: { x: 150, y: 150, width: 320, height: 240 }
        });
        break;

      case 'SETTINGS':
        openWindow({
          title: 'Control Panels',
          content: { 
            kind: 'settings_panel', 
            sourceId: 'system_settings' 
          },
          initialGeometry: { x: 200, y: 100, width: 500, height: 400 }
        });
        break;

      case 'SOCIAL':
        // 未來可改為開啟瀏覽器或 Social Widget
        console.log('[SystemService] Social command executed');
        break;
    }
  }
};