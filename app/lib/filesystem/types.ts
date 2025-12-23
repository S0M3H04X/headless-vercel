export type FileType = 'folder' | 'app' | 'link';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileType;
  icon?: string; // 自定義 icon 路徑
  // 如果是 App/Link，指向的目標
  appId?: string; // 對應 Registry 中的 WidgetKind (例如 'Collection')
  metadata?: Record<string, any>; // 例如 collection handle
  children?: FileSystemNode[]; // 只有 folder 有 children
}