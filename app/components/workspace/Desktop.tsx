// app/components/workspace/Desktop.tsx
'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WinboxWrapper } from '../ui/WinboxWrapper';
import { ContentDescriptor } from '@/lib/types/workspace';

// --- 臨時的 Registry (Phase 2 會移出) ---
const WidgetRenderer = ({ content }: { content: ContentDescriptor }) => {
  switch (content.kind) {
    case 'shopify_product':
      return <div>🛒 Product Widget: {content.sourceId}</div>;
    case 'media_player':
      return <div>▶️ Media Player: {content.sourceId}</div>;
    case 'pdf_viewer':
      return <div>📄 PDF Viewer: {content.sourceId}</div>;
    default:
      return <div className="text-red-500">Unknown Widget</div>;
  }
};
// ----------------------------------------

export default function Desktop() {
  const windows = useWorkspaceStore((state) => state.windows);
  const openWindow = useWorkspaceStore((state) => state.openWindow);

  return (
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden">
      {/* 測試控制台 */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          onClick={() => {
            console.log('[Desktop] Clicked Open Product'); // [DEBUG]
            openWindow({
              title: 'Product A',
              content: { kind: 'shopify_product', sourceId: 'prod_123' },
            });
            // 檢查 Store 是否更新
            setTimeout(() => {
              console.log('[Desktop] Current Windows:', useWorkspaceStore.getState().windows);
            }, 100);
          }}
        >
          Open Product
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
          onClick={() =>
            openWindow({
              title: 'Promo Video',
              content: { kind: 'media_player', sourceId: 'vid_demo' },
              initialGeometry: { x: 200, y: 150 },
            })
          }
        >
          Open Video
        </button>
      </div>

      {/* 視窗渲染層 */}
      {Object.values(windows).map((win) => (
        <WinboxWrapper key={win.id} windowInstance={win}>
          <WidgetRenderer content={win.content} />
        </WinboxWrapper>
      ))}
    </div>
  );
}