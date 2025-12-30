import type { UserTier } from '@/lib/utils/tierUtils';

export type FileType = 'folder' | 'app' | 'link' | 'widget' | 'file';

export interface FileSystemNode {
  id: string;
  parentId?: string | null; // 根目錄的 parentId 為 null
  name: string;
  type: FileType;
  icon?: string; // 自定義 icon 路徑
  // 如果是 App/Link，指向的目標
  appId?: string; // 對應 Registry 中的 WidgetKind (例如 'Collection')
  metadata?: Record<string, any>;
  children?: FileSystemNode[];
  locked?: boolean; // 是否鎖定 (不可編輯/刪除) - DEPRECATED, use requiredTier
  requiredTier?: UserTier; // Minimum tier required to access this node
}