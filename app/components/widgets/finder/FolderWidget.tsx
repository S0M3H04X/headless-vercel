'use client';
import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { resolvePath } from '@/lib/filesystem/data';
import { BaseWidgetProps } from '@/lib/types/workspace';

export const FolderWidget: React.FC<BaseWidgetProps> = ({ id, content }) => {
  const { openWindow } = useWorkspaceStore();
  
  // [關鍵] 從 content.sourceId 解析 path
  const path = content.sourceId; 
  const node = resolvePath(path);
  const items = node?.children || [];

  const handleDoubleClick = (item: any) => {
      if (item.type === 'app') {
          // Launch App (e.g., Collection Widget)
          openWindow({
              title: item.name,
              content: { kind: item.appId, sourceId: item.metadata?.handle }
          });
      }
      // Handle sub-folders...
  };

  if (!node) return <div>Folder not found</div>;

  return (
    <div>Folder Content: {path}</div>
  );
};