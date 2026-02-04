'use client';

import React, { Suspense, lazy } from 'react';
import { ContentDescriptor, WidgetKind, BaseWidgetProps } from '@/lib/types/workspace';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';


// --- 1. Tier Configuration ---
import { UserTier, canAccess } from '@/lib/utils/tierUtils';
import { useAuthStore } from '@/store/authStore';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { ProgressBar } from '../ui/primitives';

const WIDGET_TIERS: Record<string, UserTier> = {
  // Admin Only
  [WidgetKind.VideoControl]: 'admin',
  [WidgetKind.VideoVisual]: 'admin',
  [WidgetKind.VideoMixer]: 'admin',

  // Pro Only
  [WidgetKind.MediaPlayer]: 'pro',

  // Member Only
  [WidgetKind.UserProfile]: 'member',
  [WidgetKind.Cart]: 'member',
  [WidgetKind.Collection]: 'member',
  [WidgetKind.Product]: 'member', // Product Browsing is member feature
  [WidgetKind.PDFViewer]: 'member', // Manuals should be readable? Or member? Let's say member based on Launcher.

  // Guest Access (Default)
  [WidgetKind.Auth]: 'guest',
  [WidgetKind.Folder]: 'guest', // Folders access controlled by FS node, but widget itself is open

};



// --- 2. 動態導入映射表 (Code Splitting) ---
// 只有當視窗被打開時，瀏覽器才會下載這些程式碼
const WIDGET_MAP: Record<string, React.LazyExoticComponent<React.ComponentType<BaseWidgetProps>>> = {
  [WidgetKind.Product]: lazy(() => import('./commerce/ProductWidget')),
  [WidgetKind.MediaPlayer]: lazy(() => import('./content/MediaPlayerWidget')),
  [WidgetKind.PDFViewer]: lazy(() => import('./assets/PDFViewerWidget')),

  [WidgetKind.ProductImage]: lazy(() => import('./commerce/ProductParts').then(m => ({ default: m.ProductImageWidget }))),
  [WidgetKind.ProductInfo]: lazy(() => import('./commerce/ProductParts').then(m => ({ default: m.ProductInfoWidget }))),
  [WidgetKind.Cart]: lazy(() => import('./commerce/CartWidget')),
  [WidgetKind.UserProfile]: lazy(() => import('./user/UserProfileWidget')),

  // [新增] 影音原子組件
  [WidgetKind.VideoControl]: lazy(() => import('./content/VideoParts').then(m => ({ default: m.PlaybackController }))),
  [WidgetKind.VideoVisual]: lazy(() => import('./content/VideoParts').then(m => ({ default: m.Visualiser }))),
  [WidgetKind.VideoMixer]: lazy(() => import('./content/VideoParts').then(m => ({ default: m.EQMixer }))),

  // [修正] 註冊 Auth
  [WidgetKind.Auth]: lazy(() => import('../desktop/AuthWidget').then(m => ({
    // 假設 AuthWidget 是 default export，或是 named export
    // 這裡做一個適配器，因為 AuthWidget 可能沒有接收 BaseWidgetProps
    default: (props: any) => {
      const { AuthWidget } = m;
      // 強制將 AuthWidget 渲染在視窗內，移除原本的 absolute 定位樣式
      return <div className="w-full"><AuthWidget /></div>;
    }
  }))),

  // [修正] 使用 lazy 動態導入，並指向 named export
  [WidgetKind.Folder]: lazy(() =>
    import('./finder/FolderWidget').then(module => ({ default: module.FolderWidget }))
  ),

  // [修正] 將 Collection 指向 CollectionFinder (App)
  [WidgetKind.Collection]: lazy(() =>
    import('./commerce/CollectionApp').then(module => ({ default: module.CollectionApp }))
  ),

};

// --- 3. 載入中畫面 (Skeleton) ---
const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
    <div className="text-center">
      {/* <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div> */}
      <p className="text-xs">Loading Widget...</p>
      <div className="w-full my-2">
        <ProgressBar height="12px" />
      </div>
    </div>
  </div>
);

// --- 4. 未知類型畫面 ---
const UnknownWidget = ({ kind }: { kind: string }) => (
  <div className="h-full w-full flex items-center justify-center bg-red-50 text-red-500 p-4">
    <div className="text-center">
      <h3 className="font-bold">Unknown Widget Type</h3>
      <p className="text-sm mt-1">Registry could not resolve: "{kind}"</p>
    </div>
  </div>
);

interface WidgetRendererProps {
  id: string;
  content: ContentDescriptor;
  internalState?: unknown;
}

// --- 5. 統一渲染入口 (Facade Pattern) ---
export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ id, content, internalState }) => {
  const WidgetComponent = WIDGET_MAP[content.kind];

  // Access Control Check
  const { tier } = useAuthStore();
  const requiredTier = WIDGET_TIERS[content.kind] || 'guest';
  const hasAccess = canAccess(tier, requiredTier);

  if (!WidgetComponent) {
    return <UnknownWidget kind={content.kind} />;
  }

  if (!hasAccess) {
    return <AccessDenied requiredTier={requiredTier} />;
  }

  return (
    // Layer 1: 錯誤隔離 (防止白屏)
    <WidgetErrorBoundary title={content.kind}>
      {/* Layer 2: 非同步載入 (防止卡頓) */}
      <Suspense fallback={<LoadingFallback />}>
        {/* Layer 3: 具體業務組件 */}
        <WidgetComponent id={id} content={content} internalState={internalState} />
      </Suspense>
    </WidgetErrorBoundary>
  );
};