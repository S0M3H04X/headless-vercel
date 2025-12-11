'use client';

import React, { Suspense, lazy } from 'react';
import { ContentDescriptor, ContentKind } from '@/lib/types/workspace';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';

// --- 1. 動態導入映射表 (Code Splitting) ---
// 只有當視窗被打開時，瀏覽器才會下載這些程式碼
const WIDGET_MAP: Record<ContentKind, React.LazyExoticComponent<any>> = {
  shopify_product: lazy(() => import('./commerce/ProductWidget')),
  media_player: lazy(() => import('./content/MediaPlayerWidget')),
  // 尚未實作的組件可以先指派給通用 Placeholder
  pdf_viewer: lazy(() => import('./commerce/ProductWidget')), // 暫代
};

// --- 2. 載入中畫面 (Skeleton) ---
const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-xs">Loading Widget...</p>
    </div>
  </div>
);

// --- 3. 未知類型畫面 ---
const UnknownWidget = ({ kind }: { kind: string }) => (
  <div className="h-full w-full flex items-center justify-center bg-red-50 text-red-500 p-4">
    <div className="text-center">
      <h3 className="font-bold">Unknown Widget Type</h3>
      <p className="text-sm mt-1">Registry could not resolve: "{kind}"</p>
    </div>
  </div>
);

interface WidgetRendererProps {
  content: ContentDescriptor;
  internalState?: unknown;
}

// --- 4. 統一渲染入口 (Facade Pattern) ---
export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ content, internalState }) => {
  const WidgetComponent = WIDGET_MAP[content.kind];

  if (!WidgetComponent) {
    return <UnknownWidget kind={content.kind} />;
  }

  return (
    // Layer 1: 錯誤隔離 (防止白屏)
    <WidgetErrorBoundary title={content.kind}>
      {/* Layer 2: 非同步載入 (防止卡頓) */}
      <Suspense fallback={<LoadingFallback />}>
        {/* Layer 3: 具體業務組件 */}
        <WidgetComponent content={content} internalState={internalState} />
      </Suspense>
    </WidgetErrorBoundary>
  );
};