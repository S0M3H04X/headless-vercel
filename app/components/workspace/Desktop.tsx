// app/components/workspace/Desktop.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WinboxWrapper } from '../ui/WinboxWrapper';
import { WidgetRenderer } from '@/components/widgets/Registry';
import { WorkspaceRepository } from '@/lib/persistence/storage';
import { ScenarioService } from '@/lib/services/scenarioService';


export default function Desktop() {
  const windows = useWorkspaceStore((state) => state.windows);
  const openWindow = useWorkspaceStore((state) => state.openWindow);
  const hydrate = useWorkspaceStore((state) => state.hydrate);

  // 防止水合不匹配 (Hydration Mismatch)
  const [isHydrated, setIsHydrated] = useState(false);

  // [新增] 初始化邏輯
  useEffect(() => {
    // 1. 嘗試載入狀態
    const savedState = WorkspaceRepository.load();

    if (savedState) {
      console.log('[Desktop] Restoring session...');
      hydrate(savedState);
    } else {
      console.log('[Desktop] No session found, starting fresh.');
      // 這裡可以選擇是否要開啟預設視窗
    }

    // 2. 標記為已水合，開始渲染 Winbox
    setIsHydrated(true);
  }, [hydrate]);


  // [關鍵保護] 如果還沒水合，不要渲染 Winbox (避免與 SSR 衝突)
  // 可以渲染一個 Loading Spinner 或空的 div
  if (!isHydrated) {
    return <div className="h-screen w-screen bg-slate-100" />;
  }

  return (
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden">
      {/* 測試控制台 */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
          onClick={() => ScenarioService.launchProductSuite('tee')}
        >
          Open Product Suite
        </button>

        <button
          className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition-colors"
          onClick={() => ScenarioService.launchVideoStudio('vid_demo_01')}
        >
          Open Video Studio
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors"
          onClick={() =>
            openWindow({
              title: 'Product Manual (PDF)',
              content: {
                kind: 'pdf_viewer', // 或使用 WidgetKind.PDFViewer
                // 請換成一個有效的 PDF 網址 (注意 CORS 問題)
                sourceId: '@/assets/pdf/dissertation.pdf',
              },
              initialGeometry: { x: 300, y: 100, width: 600, height: 800 },
            })
          }
        >
          Open PDF
        </button>
      </div>

      {/* 視窗渲染層 */}
      {Object.values(windows).map((win) => (
        <WinboxWrapper key={win.id} windowInstance={win}>
          <WidgetRenderer id={win.id} content={win.content} internalState={win.internalState} />
        </WinboxWrapper>
      ))}
    </div>
  );
}