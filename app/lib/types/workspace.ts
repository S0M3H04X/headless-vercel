// app/lib/types/workspace.ts

// 1. 內容描述符 (極細顆粒) - 這是 UI Shell 唯一知道關於"內容"的事
export type ContentKind = 'shopify_product' | 'media_player' | 'pdf_viewer';

export interface ContentDescriptor {
  kind: ContentKind;
  sourceId: string; // e.g., "gid://shopify/Product/123"
  initialMeta?: Record<string, unknown>; // 允許傳遞初始參數
}

// 2. 視窗實體 (中顆粒) - 包含幾何狀態與不透明的內部狀態
export interface WindowInstance {
  id: string;
  title: string;
  geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zIndex: number;
  isMinimized: boolean;
  content: ContentDescriptor;
  internalState: unknown; // Opaque State Pattern: Shell 不解析此內容
}

// 3. 視窗工廠參數
export interface CreateWindowParams {
  title: string;
  content: ContentDescriptor;
  initialGeometry?: Partial<WindowInstance['geometry']>;
}