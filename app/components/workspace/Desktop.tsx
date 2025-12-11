// app/components/workspace/Desktop.tsx
'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WinboxWrapper } from '../ui/WinboxWrapper';
import { WidgetRenderer } from '@/components/widgets/Registry';
import { ContentDescriptor } from '@/lib/types/workspace';



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
            // 檢查 Store 是否更新 [DEBUG]
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
        <button
            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors"
            onClick={() =>
                openWindow({
                    title: 'Broken Widget',
                    // @ts-expect-error Testing invalid kind
                    content: { kind: 'invalid_kind', sourceId: 'test' },
                })
            }
        >
            Test Error
        </button>
      </div>

      {/* 視窗渲染層 */}
      {Object.values(windows).map((win) => (
        <WinboxWrapper key={win.id} windowInstance={win}>
          <WidgetRenderer content={win.content} internalState={win.internalState} />
        </WinboxWrapper>
      ))}
    </div>
  );
}