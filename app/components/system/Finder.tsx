'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WidgetKind } from '@/lib/types/workspace';

// 桌面圖示定義 (未來可移至 boot.json)
const DESKTOP_ICONS = [
  {
    id: 'hd',
    label: 'Macintosh HD',
    icon: '/assets/classicy/img/icons/system/drives/disk.png',
    action: { kind: 'collection', sourceId: 'root', title: 'Macintosh HD' }
  },
  {
    id: 'trash',
    label: 'Trash',
    icon: '/assets/classicy/img/icons/system/desktop/trash-full.png', // 範例
    action: { kind: 'collection', sourceId: 'trash', title: 'Trash' } // 暫時指向空資料夾
  }
];

export const Finder = () => {
  const { openWindow } = useWorkspaceStore();

  return (
    // Layer 2: The Finder (Desktop Icons Layer)
    // 使用 absolute inset-0 覆蓋全螢幕，但在 z-0 (背景)
    <div className="absolute top-8 right-4 bottom-12 left-4 z-0 pointer-events-none">
      <div className="flex flex-col flex-wrap-reverse content-end gap-4 h-full pointer-events-auto w-fit ml-auto">
        {DESKTOP_ICONS.map((icon) => (
          <div 
            key={icon.id}
            className="flex flex-col items-center w-20 group cursor-pointer"
            onDoubleClick={() => openWindow({
              title: icon.action.title,
              content: { kind: icon.action.kind as WidgetKind, sourceId: icon.action.sourceId },
              geometry: { x: 50, y: 50, width: 600, height: 400 }
            })}
          >
            <img src={icon.icon} alt={icon.label} className="w-12 h-12 mb-1 drop-shadow-md" />
            <span className="
              text-black bg-white/80 px-1 text-xs font-mono border border-transparent 
              group-hover:border-gray-500 group-active:bg-blue-800 group-active:text-white
            ">
              {icon.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};