// app/lib/services/systemService.ts
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useWidgetStore } from '@/store/widgetStore';

import { ScenarioService } from './scenarioService';
import { WidgetKind } from '@/lib/types/workspace';

import { FileSystemNode } from '@/lib/filesystem/types';

export const SystemService = {
  /**
   * 核心方法：開啟檔案/應用
   * 這是 OS 的 Dispatcher，負責根據檔案類型決定行為
   */
  openFile: (node: FileSystemNode) => {
    const authStore = useAuthStore.getState();
    const { openWindow } = useWorkspaceStore.getState();

    console.log(`[System] Opening: ${node.name} (${node.type})`);
    // [US-08-01] 核心攔截邏輯
    if (node.locked && !authStore.isAuthenticated) {
      console.warn(`[Access Denied] ${node.name} is locked for guests.`);
      
      // 1. 播放拒絕音效 (Optional)
      // playSound('error');

      // 2. 觸發登入視窗 (假設 AuthWidget 也是一個視窗或全域 Modal)
      // 如果您的 AuthWidget 是一個 desktop window:
      // useWidgetStore.getState().openWindow('auth-login'); 
      
      // 或者呼叫 AuthStore 的 login 導向
      authStore.login(); 
      
      return; // 中斷開啟流程
    }

    console.log(`[System] Opening ${node.name}`);

    switch (node.type) {
      case 'folder':
        // 開啟資料夾視窗
        openWindow({
          title: node.name,
          content: { kind: WidgetKind.Folder, sourceId: node.id }
        });
        break;

      case 'app':
        // 處理各類 App 的啟動參數
        if (node.appId === WidgetKind.Collection) {
           openWindow({
              title: node.name,
              content: { 
                kind: WidgetKind.Collection, 
                sourceId: node.metadata?.handle || 'root' 
              },
              initialGeometry: { x: 150, y: 150, width: 640, height: 480 }
           });
        }
        // 未來可在此擴充其他 App (如 MediaPlayer)
        break;

      case 'widget':
      case 'link':
        // 處理特殊捷徑與場景 (Scenarios)
        if (node.appId === WidgetKind.Product) {
           ScenarioService.launchProductSuite(node.metadata?.handle);
        }
        break;
        
      default:
        console.warn(`[System] Unknown file type: ${node.type}`);
    }
  },
  // 2. [新增] 系統視窗開啟邏輯
  openSystemWindow: (type: 'ABOUT' | 'SETTINGS' | 'SOCIAL') => {
    const { openWindow } = useWorkspaceStore.getState();
    
    switch (type) {
      case 'ABOUT':
        openWindow({
          title: 'About 1313',
          content: { kind: WidgetKind.PDFViewer, sourceId: 'about_doc' }, // 範例：開啟說明文件
          initialGeometry: { width: 400, height: 300, x: 'center', y: 'center' }
        });
        break;
      case 'SETTINGS':
        // 未來可開啟控制台 Widget
        alert("Control Panel is under construction (Phase 9)");
        break;
      case 'SOCIAL':
        window.open('https://instagram.com/1313heart', '_blank');
        break;
    }
  }
};