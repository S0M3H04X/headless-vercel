import { FileSystemNode } from './types';
import { WidgetKind } from '../types/workspace';

const Kinds = WidgetKind

export const INITIAL_FILE_SYSTEM: FileSystemNode[] = [
  {
    id: 'desktop',
    name: 'Desktop',
    type: 'folder',
    children: [
      {
        id: 'hd',
        name: '1313 HD',
        type: 'folder',
        icon: '/assets/classicy/img/icons/system/drives/disk.png',
        children: [
          {
            id: 'apps',
            name: 'Applications',
            type: 'folder',
            children: [
              { id: 'radio', name: 'Radio', type: 'app', appId: Kinds.MediaPlayer, icon: '/assets/classicy/img/icons/system/files/sound.png' },
              { id: 'chat', name: 'Chat', type: 'app', appId: 'Chatroom', icon: '/assets/classicy/img/icons/system/files/232.Messages.png' }
            ]
          },
          {
            id: 'shop',
            name: 'Shop',
            type: 'folder', // 這是一個資料夾，裡面裝著各個 Collection 的捷徑
            icon: '/assets/classicy/img/icons/system/folders/favorites.png',
            children: [
              // 這裡模擬從 Shopify 獲取的 Collections
              { 
                id: 'col_tees', 
                name: 'Tees', 
                type: 'app', 
                appId: Kinds.Product, // 這是 Collection Widget (App)
                metadata: { handle: 'tee' },
                icon: '/assets/classicy/img/icons/system/folders/folder-flip.png'
              },
              { 
                id: 'col_pants', 
                name: 'Pants', 
                type: 'app', 
                appId: Kinds.Product, // 這是 Collection Widget (App)
                metadata: { handle: 'pants' },
                icon: '/assets/classicy/img/icons/system/folders/folder-flip.png'
              }
            ]
          }
        ]
      },
      // 放在桌面的捷徑
      {
        id: 'shortcut_shop',
        name: '1CR3DIT',
        type: 'link', // 指向 /Macintosh HD/Shop
        metadata: { targetPath: '/Macintosh HD/Shop' },
        icon: '/assets/classicy/img/icons/system/folders/favorites.png'
      }
    ]
  }
];

// Helper to find node by path (MVP naive implementation)
export const resolvePath = (path: string): FileSystemNode | null => {
    // 簡單實作：假設路徑層級對應 children 結構
    // 實際專案應寫遞迴搜尋
    if (path === '/Desktop') return INITIAL_FILE_SYSTEM[0];
    if (path === '/Macintosh HD/Shop') return INITIAL_FILE_SYSTEM[0].children![0].children![1];
    return null;
};