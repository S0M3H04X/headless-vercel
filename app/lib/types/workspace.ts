// app/lib/types/workspace.ts

// 使用 const object 來模擬 Enum (比 TypeScript Enum 更輕量且容易整合)
export const WidgetKind = {
  // Commerce Context
  Product: 'shopify_product',
  ProductImage: 'product_image',
  ProductInfo: 'product_info',

  // Content Context
  MediaPlayer: 'media_player',
  VideoControl: 'video_control',
  VideoVisual: 'video_visual',
  VideoMixer: 'video_mixer',

  // Asset Context
  PDFViewer: 'pdf_viewer',
  Cart: 'cart_manager',
  UserProfile: 'user_profile',
  Auth: 'auth',

  // [新增] Finder & App Context
  Folder: 'folder_browser',      // 用於瀏覽檔案系統
  Collection: 'collection_app',  // 用於展示商品系列的 App

} as const;

// 衍生型別
export type WidgetKindType = typeof WidgetKind[keyof typeof WidgetKind];

// 為了讓 TypeScript 通過 BaseWidgetProps 檢查，確保 content.kind 是 string
export interface WidgetContent {
  kind: string; // 放寬限制，允許動態字串
  sourceId: string;
}

// 更新 ContentDescriptor
export interface ContentDescriptor {
  kind: WidgetKindType | string; // 允許 string 是為了容錯，但建議用 WidgetKind
  sourceId: string;
  initialMeta?: Record<string, unknown>;
}

// 2. 視窗實體 (中顆粒) - 包含幾何狀態與不透明的內部狀態
export interface WindowInstance {
  id: string;
  title: string;
  geometry: {
    x: number | 'center' | 'left' | 'right';
    y: number | 'center' | 'top' | 'bottom';
    width: number | string;
    height: number | string;
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

// [新增] 所有的 Widget 都必須接受這些 Props
export interface BaseWidgetProps {
  id: string; // 用於寫回狀態
  content: ContentDescriptor;
  internalState?: any; // 不透明狀態
}