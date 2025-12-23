'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { resolvePath } from '@/lib/filesystem/data';
import { BaseWidgetProps } from '@/lib/types/workspace';
import styles from './FolderWidget.module.scss'; // 確保樣式被正確引入

export const FolderWidget: React.FC<BaseWidgetProps> = ({ id, content }) => {
  const { openWindow } = useWorkspaceStore();
  
  // 1. 解析路徑獲取資料
  const path = content.sourceId; 
  const node = resolvePath(path);
  const items = node?.children || [];

  // 2. 處理雙擊互動
  const handleDoubleClick = (item: any) => {
      if (item.type === 'app') {
          // 啟動應用程式 (如 Collection Widget)
          openWindow({
              title: item.name,
              content: { 
                  kind: item.appId, 
                  sourceId: item.metadata?.handle || 'root' 
              },
              initialGeometry: { x: 'center', y: 'center', width: 800, height: 600 }
          });
      } else if (item.type === 'folder') {
          // 進入子資料夾 (MVP: 開啟新視窗，未來可改為原地導航)
          // 注意: 這裡假設 data.ts 的 resolvePath 能處理這種路徑拼接
          // 若使用靜態 path 判斷，需確保 item.id 對應到 data.ts 的邏輯
          const nextPath = path === '/' ? `/${item.name}` : `${path}/${item.name}`;
          
          openWindow({
              title: item.name,
              content: { kind: 'Folder', sourceId: nextPath },
              initialGeometry: { x: 'center', y: 'center', width: 600, height: 400 }
          });
      }
  };

  // 3. 錯誤處理 (找不到路徑)
  if (!node) {
      return (
        <div className="flex items-center justify-center h-full text-red-500 font-mono">
            Error: Path not found "{path}"
        </div>
      );
  }

  // 4. 渲染內容 (Grid Layout)
  return (
    <div className={styles.folderContainer}>
        {/* Status Bar (Optional) */}
        <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 text-xs flex justify-between">
            <span>{items.length} items</span>
            <span>{path}</span>
        </div>

        {/* Content Area */}
        <div className={styles.gridContent}>
            {items.length === 0 && (
                <div className="w-full text-center mt-10 text-gray-400 italic">
                    (Empty Folder)
                </div>
            )}
            
            {items.map((item: any) => (
                <div 
                    key={item.id} 
                    className={styles.item} 
                    onDoubleClick={() => handleDoubleClick(item)}
                    title={item.name}
                >
                    {/* Icon */}
                    <img 
                        src={item.icon || '/assets/classicy/img/icons/system/folders/folder-generic.png'} 
                        alt={item.name} 
                        className="w-8 h-8 object-contain pixelated"
                    />
                    {/* Label */}
                    <span>{item.name}</span>
                </div>
            ))}
        </div>
    </div>
  );
};