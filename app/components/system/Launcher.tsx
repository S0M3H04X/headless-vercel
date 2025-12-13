'use client';
import React from 'react';
import { ScenarioService } from '@/lib/services/scenarioService';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WidgetKind } from '@/lib/types/workspace';

export const Launcher = () => {
  const openWindow = useWorkspaceStore((s) => s.openWindow);

  return (
    <div className="absolute top-4 left-4 z-50 flex gap-2 flex-wrap pointer-events-auto">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
        onClick={() => ScenarioService.launchProductSuite('tee')}
      >
        Open Product Suite
      </button>
      
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition-colors"
        onClick={() => ScenarioService.launchVideoStudio('01')}
      >
        Open Video Studio
      </button>

      <button
        className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors"
        onClick={() =>
          openWindow({
            title: 'Dissertation',
            content: { 
              kind: WidgetKind.PDFViewer, 
              sourceId: '/assets/pdf/dissertation.pdf' 
            },
            // 使用常數的例子 (可選)
            initialGeometry: { x: 300, y: 100, width: 600, height: 800 },
          })
        }
      >
        Open PDF
      </button>
    </div>
  );
};