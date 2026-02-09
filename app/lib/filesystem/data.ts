// app/lib/filesystem/data.ts
import { FileSystemNode } from './types';
import { WidgetKind } from '@/lib/types/workspace';

export const INITIAL_FILE_SYSTEM: FileSystemNode[] = [
  {
    id: 'desktop',
    name: 'Desktop',
    type: 'folder',
    children: [
      {
        id: 'hd',
        name: '1CR3DIT',
        type: 'folder',
        icon: '/assets/classicy/img/icons/system/drives/disk.png',
        requiredTier: 'member',
        children: [
          {
            id: 'shop',
            name: 'Shop',
            type: 'app',
            appId: WidgetKind.Collection,
            metadata: { handle: 'One Credit' },
            icon: '/assets/classicy/img/icons/system/folders/favorites.png',
            requiredTier: 'member',
          },
          // {
          //   id: 'scan',
          //   name: 'Scan',
          //   type: 'app',
          //   appId: WidgetKind.PDFViewer,
          //   metadata: { handle: '1cr3dit' },
          //   icon: '/assets/classicy/img/icons/system/folders/favorites.png',
          //   requiredTier: 'member',
          // },
        ]
      }
    ]
  }
];

// [新增] 遞迴查找節點 (By ID)
export const getNodeById = (id: string): FileSystemNode | null => {
  const find = (nodes: FileSystemNode[]): FileSystemNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = find(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  return find(INITIAL_FILE_SYSTEM);
};

// [保留] 向下相容的路徑解析 (若有需要)
export const resolvePath = (path: string): FileSystemNode | null => {
  // 簡易實作：如果傳入的是 ID，直接用 ID 找
  if (!path.startsWith('/')) {
    return getNodeById(path);
  }
  return null;
};