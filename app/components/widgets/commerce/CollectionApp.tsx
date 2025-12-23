'use client';
import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { SystemButton } from '@/components/ui/SystemButton'; // 使用我們剛建立的組件
import { getCollections, getCollectionProducts, Collection, Product } from '@/lib/shopify';
import { WidgetKind } from '@/lib/types/workspace';
import styles from './CollectionApp.module.scss'; // 下一步建立樣式

// 內部狀態：當前路徑與數據
interface FinderState {
  currentPath: string; // '/' or '/collection-handle'
  viewMode: 'root' | 'collection';
  items: Array<Collection | Product>;
  isLoading: boolean;
}

export const CollectionApp = ({ id }: { id: string }) => {
  const { openWindow, updateWindowTitle } = useWorkspaceStore();
  const [state, setState] = useState<FinderState>({
    currentPath: '/',
    viewMode: 'root',
    items: [],
    isLoading: true,
  });

  // 載入數據
  useEffect(() => {
    loadData(state.currentPath);
  }, [state.currentPath]);

  const loadData = async (path: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      if (path === '/') {
        // Root: Load Collections
        const collections = await getCollections();
        setState({
          currentPath: '/',
          viewMode: 'root',
          items: collections,
          isLoading: false
        });
        updateWindowTitle(id, 'Macintosh HD'); // 更新視窗標題
      } else {
        // Subfolder: Load Products
        const handle = path.replace('/', '');
        const products = await getCollectionProducts(handle);
        setState({
          currentPath: path,
          viewMode: 'collection',
          items: products,
          isLoading: false
        });
        updateWindowTitle(id, handle.toUpperCase());
      }
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleBack = () => {
    if (state.currentPath !== '/') {
      setState(prev => ({ ...prev, currentPath: '/' }));
    }
  };

  const handleItemClick = (item: any) => {
    // 單擊選取邏輯可在此實作 (改變樣式)
  };

  const handleItemDoubleClick = (item: any) => {
    if (state.viewMode === 'root') {
      // 進入資料夾
      setState(prev => ({ ...prev, currentPath: `/${item.handle}` }));
    } else {
      // 開啟商品詳情 (Product Widget)
      openWindow({
        title: item.title,
        content: { 
          kind: WidgetKind.Product, 
          sourceId: item.handle // 傳遞 product handle
        },
        initialGeometry: { x: 'center', y: 'center', width: 800, height: 600 }
      });
    }
  };

  return (
    <div className={styles.finderContainer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <SystemButton 
          onClick={handleBack} 
          disabled={state.currentPath === '/'}
          className="mr-2"
        >
          <div className="flex items-center gap-1">
            <span>←</span> Back
          </div>
        </SystemButton>
        <div className={styles.pathBar}>
          {state.currentPath === '/' ? 'Macintosh HD' : state.currentPath}
        </div>
      </div>

      {/* Grid View */}
      <div className={styles.gridArea}>
        {state.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <PixelIcon name="loader" size={32} className="animate-spin" />
          </div>
        ) : (
          state.items.map((item: any) => (
            <div 
              key={item.id} 
              className={styles.gridItem}
              onClick={() => handleItemClick(item)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              <div className={styles.iconWrapper}>
                {/* 根據類型顯示不同 Icon */}
                {state.viewMode === 'root' ? (
                  <img src="/assets/classicy/img/icons/system/folders/folder-system.png" alt="Folder" className="w-10 h-10" />
                ) : (
                  // 商品顯示縮圖或預設檔案圖示
                  item.featuredImage ? (
                    <img src={item.featuredImage.url} alt={item.title} className="w-10 h-10 object-cover border border-gray-500 bg-white" />
                  ) : (
                    <img src="/assets/classicy/img/icons/system/files/document.png" alt="File" className="w-8 h-10" />
                  )
                )}
              </div>
              <span className={styles.itemLabel}>{item.title}</span>
            </div>
          ))
        )}
      </div>
      
      {/* Status Bar */}
      <div className={styles.statusBar}>
        {state.items.length} items
      </div>
    </div>
  );
};