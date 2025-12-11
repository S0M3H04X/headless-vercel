// app/components/workspace/Desktop.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WinboxWrapper } from '../ui/WinboxWrapper';
import { WidgetRenderer } from '@/components/widgets/Registry';
import { WorkspaceRepository } from '@/lib/persistence/storage';



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
  // 開啟商品工作站
  const openProductSuite = () => {
    const productId = 'gid://shopify/Product/12345';
    const baseId = Date.now().toString(); // 用於生成唯一 ID

    // 1. 左側大圖
    openWindow({
      title: 'Product Gallery',
      content: { kind: 'product_image', sourceId: productId },
      initialGeometry: { x: 50, y: 50, width: 400, height: 500 }
    });

    // 2. 右上標題 (緊鄰圖片)
    openWindow({
      title: 'Product Info',
      content: { kind: 'product_title', sourceId: productId },
      initialGeometry: { x: 460, y: 50, width: 300, height: 150 }
    });

    // 3. 右下描述
    openWindow({
      title: 'Details',
      content: { kind: 'product_desc', sourceId: productId },
      initialGeometry: { x: 460, y: 210, width: 300, height: 340 }
    });
  };

  // 開啟影音工作站
  const openStudioSuite = () => {
    const videoId = 'vid_demo_01';

    // 1. 上方視圖
    openWindow({
      title: 'Visualiser',
      content: { kind: 'video_visual', sourceId: videoId },
      initialGeometry: { x: 100, y: 100, width: 600, height: 200 }
    });

    // 2. 左下控制器
    openWindow({
      title: 'Playback',
      content: { kind: 'video_control', sourceId: videoId },
      initialGeometry: { x: 100, y: 310, width: 350, height: 150 }
    });

    // 3. 右下混音器
    openWindow({
      title: 'EQ Mixer',
      content: { kind: 'video_mixer', sourceId: videoId },
      initialGeometry: { x: 460, y: 310, width: 240, height: 150 }
    });
  };

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
          onClick={openProductSuite}
        >
          Open Product Suite (3 Windows)
        </button>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition-colors"
          onClick={openStudioSuite}
        >
          Open Video Studio (3 Windows)
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