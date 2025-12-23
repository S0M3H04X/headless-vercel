'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { INITIAL_FILE_SYSTEM } from '@/lib/filesystem/data';
import { FileSystemNode } from '@/lib/filesystem/types';
import styles from './Finder.module.scss'; // 需建立對應樣式

export const Finder = () => {
  const { openWindow } = useWorkspaceStore();
  
  // 1. 獲取桌面內容 (root -> Desktop)
  const desktopNode = INITIAL_FILE_SYSTEM.find(n => n.id === 'desktop');
  const icons = desktopNode?.children || [];

  // 2. 處理圖示雙擊 (啟動邏輯)
  const handleIconDoubleClick = (node: FileSystemNode) => {
    if (node.type === 'folder' || node.type === 'link') {
      // 開啟 "Folder Widget" 來瀏覽該目錄
      openWindow({
        title: node.name,
        content: { 
            kind: 'Folder', 
            sourceId: node.metadata?.targetPath || node.id // 傳遞路徑或ID
        },
        initialGeometry: { x: 100, y: 100, width: 600, height: 400 }
      });
    } else if (node.type === 'app') {
      // 開啟 "App Widget"
      openWindow({
        title: node.name,
        content: { 
            kind: node.appId || 'Unknown', 
            sourceId: node.metadata?.handle 
        },
        initialGeometry: { x: 'center', y: 'center', width: 800, height: 600 }
      });
    }
  };

  return (
    <div className={styles.finderLayer}>
      {/* Grid Layout for Desktop Icons */}
      <div className={styles.iconGrid}>
        {icons.map(node => (
          <div 
            key={node.id} 
            className={styles.desktopIcon}
            onDoubleClick={() => handleIconDoubleClick(node)}
          >
            <img src={node.icon || '/assets/classicy/img/icons/system/files/file.png'} alt={node.name} />
            <span>{node.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};