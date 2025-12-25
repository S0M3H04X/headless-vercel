'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ScenarioService } from '@/lib/services/scenarioService';
import { getNodeById } from '@/lib/filesystem/data'; // [修正] 引入新函式
import { BaseWidgetProps, WidgetKind } from '@/lib/types/workspace';
import styles from './FolderWidget.module.scss';

export const FolderWidget: React.FC<BaseWidgetProps> = ({ id, content }) => {
  const { openWindow } = useWorkspaceStore();
  const nodeId = content.sourceId; // 這裡接收到的會是 'shop'
  
  // [修正] 使用 ID 查找節點
  const node = getNodeById(nodeId);
  const items = node?.children || [];

  const handleDoubleClick = (item: any) => {
      // 互動邏輯
      if (item.type === 'widget' && item.appId === WidgetKind.Product) {
          // 情境 A: 點擊 Product Icon -> 調用 ScenarioService
          ScenarioService.launchProductSuite(item.metadata.handle);
      } 
      else if (item.type === 'app' && item.appId === WidgetKind.Collection) {
          // 情境 B: 點擊 Collection Icon -> 開啟 CollectionApp
          openWindow({
              title: item.name,
              content: { 
                  kind: WidgetKind.Collection, 
                  sourceId: item.metadata.handle 
              },
              initialGeometry: { x: 150, y: 150, width: 640, height: 480 }
          });
      }
      else if (item.type === 'folder') {
          // 情境 C: 進入子資料夾
          openWindow({
              title: item.name,
              content: { kind: WidgetKind.Folder, sourceId: item.id } // 傳遞 ID
          });
      }
  };

  if (!node) {
      return (
        <div className="flex items-center justify-center h-full text-red-500 font-mono text-sm">
            Error: Path not found "{nodeId}"
        </div>
      );
  }

  return (
    <div className={styles.folderContainer}>
        {/* Status Bar / Info */}
        <div className="px-2 py-1 text-xs border-b border-gray-400 bg-gray-100 flex gap-2">
            <span>{items.length} items</span>
        </div>

        <div className={styles.gridContent}>
            {items.length === 0 ? (
                <div className="w-full text-center text-gray-400 text-xs mt-4">(Empty)</div>
            ) : (
                items.map(item => (
                    <div 
                        key={item.id} 
                        className={styles.item} 
                        onDoubleClick={() => handleDoubleClick(item)}
                        title={item.name}
                    >
                        <img src={item.icon || '/assets/classicy/img/icons/system/files/file.png'} alt={item.name} />
                        <span>{item.name}</span>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};