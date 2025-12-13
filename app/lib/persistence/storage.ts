import { WorkspaceSnapshot, WorkspaceSnapshotSchema } from './schema';

const STORAGE_KEY = 'app_workspace_v1';

export const WorkspaceRepository = {
  save: (snapshot: WorkspaceSnapshot) => {
    try {
      const serialized = JSON.stringify(snapshot);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.error('[Repository] Failed to save workspace:', e);
    }
  },

  load: (): WorkspaceSnapshot | null => {
    if (typeof window === 'undefined') return null;

    try {
      // 1. 嘗試從 URL 讀取 (Share Link) - 實作預留
      const params = new URLSearchParams(window.location.search);
      const urlLayout = params.get('layout');
      if (urlLayout) {
        // TODO: Implement URL decompression
        console.log('[Repository] URL layout detected.');
      }

      // 2. 從 LocalStorage 讀取
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      // [新增] Debug Log: 檢查讀出來的原始物件結構
      console.log('[Repository] Raw parsed data:', parsed);
      
      // 3. 使用 Zod 驗證結構 (關鍵防禦)
      const result = WorkspaceSnapshotSchema.safeParse(parsed);
      
      if (!result.success) {
        console.warn('[Repository] Invalid storage data, resetting:', result.error);
        console.error('[Repository] ❌ Schema Validation Failed!');
        console.error('Errors:', result.error.format());
        console.error('Bad Data Snippet (windows):', parsed.windows);
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return result.data;
    } catch (e) {
      
      console.error('[Repository] Failed to load workspace:', e);
      // 防止 JSON.parse 錯誤導致白屏
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
};