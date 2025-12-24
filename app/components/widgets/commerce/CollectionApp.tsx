'use client';
import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { SystemButton } from '@/components/ui/SystemButton';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { getCollections, getCollectionProducts, Collection, Product } from '@/lib/shopify';
import { BaseWidgetProps, WidgetKind } from '@/lib/types/workspace';
import styles from './CollectionApp.module.scss';

// 定義顯示項目的統一介面
interface GridItem {
  id: string;
  kind: 'collection' | 'product';
  title: string;
  handle: string;
  imageSrc: string;
  price?: string; // 僅商品有價格
}

interface AppState {
  viewMode: 'root' | 'folder';
  items: GridItem[];
  isLoading: boolean;
  error?: string;
}

export const CollectionApp: React.FC<BaseWidgetProps> = ({ id, content }) => {
  const { openWindow, updateWindowTitle } = useWorkspaceStore();
  const [state, setState] = useState<AppState>({
    viewMode: content.sourceId === 'root' ? 'root' : 'folder',
    items: [],
    isLoading: true
  });

  // 1. 數據載入邏輯 (API Integration)
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      try {
        const handle = content.sourceId;
        let fetchedItems: GridItem[] = [];
        let windowTitle = 'Loading...';

        if (!handle || handle === 'root') {
          // [API Call] 獲取所有 Collections
          const collections = await getCollections();
          windowTitle = 'Shop Collections';
          
          fetchedItems = collections.map((c: Collection) => ({
            id: c.id,
            kind: 'collection',
            title: c.title,
            handle: c.handle,
            imageSrc: c.image?.url || '/assets/classicy/img/icons/system/folders/folder-system.png'
          }));
        } else {
          // [API Call] 獲取特定 Collection 內的 Products
          const products = await getCollectionProducts(handle);
          windowTitle = handle.toUpperCase(); // 暫時使用 handle，理想是 API 回傳 Collection Title

          fetchedItems = products.map((p: Product) => ({
            id: p.id,
            kind: 'product',
            title: p.title,
            handle: p.handle,
            // 優先使用Featured Image，若無則使用預設圖示
            imageSrc: p.featuredImage?.url || '/assets/classicy/img/icons/system/files/document.png',
            price: p.variants?.edges?.[0]?.node?.price?.amount 
              ? `$${parseFloat(p.variants.edges[0].node.price.amount).toFixed(2)}`
              : undefined
          }));
        }

        if (isMounted) {
          setState({
            viewMode: (!handle || handle === 'root') ? 'root' : 'folder',
            items: fetchedItems,
            isLoading: false
          });
          updateWindowTitle(id, windowTitle);
        }
      } catch (e) {
        console.error('[CollectionApp] Data Fetch Error:', e);
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false, error: 'Failed to load data.' }));
        }
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [content.sourceId, id, updateWindowTitle]);

  // 2. 互動處理
  const handleItemDoubleClick = (item: GridItem) => {
    console.log('[CollectionApp] Clicked:', item);
    if (item.kind === 'collection') {
      // 開啟該 Collection 的視窗 (遞迴開啟自己，但 sourceId 不同)
      openWindow({
        title: item.title,
        content: { 
          kind: WidgetKind.Collection, 
          sourceId: item.handle 
        },
        initialGeometry: { x: 150, y: 150, width: 100, height: 200 } // 層疊開啟
      });
    } else {
      // 開啟商品詳情 (Product Widget)
      openWindow({
        title: item.title,
        content: { 
          kind: WidgetKind.Product, 
          sourceId: item.handle 
        },
        initialGeometry: { x: 'center', y: 'center', width: 400, height: 400 }
      });
    }
  };

  // 3. 渲染
  return (
    <div className={styles.appContainer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.addressBar}>
          <img 
            src={state.viewMode === 'root' 
              ? "/assets/classicy/img/icons/system/folders/favorites.png" 
              : "/assets/classicy/img/icons/system/folders/folder-flip.png"} 
            className={styles.addressIcon} 
            alt="icon" 
          />
          <span>{content.sourceId === 'root' ? 'Shop Collections' : `shopify://${content.sourceId}`}</span>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-gray-600 mr-2">{state.items.length} items</span>
      </div>

      {/* Main View Area */}
      <div className={styles.viewArea}>
        {state.isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <PixelIcon name="loader" size={24} className="animate-spin mb-2" />
            <span className="text-xs font-mono">Connecting to Store...</span>
          </div>
        ) : state.error ? (
          <div className="flex items-center justify-center h-full text-red-600 font-mono text-xs">
            {state.error}
          </div>
        ) : state.items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 font-mono text-xs">
            (Empty Folder)
          </div>
        ) : (
          <div className={styles.productGrid}>
            {state.items.map((item) => (
              <div 
                key={item.id} 
                className={styles.productItem}
                onDoubleClick={() => handleItemDoubleClick(item)}
                title={item.title}
              >
                <div className={styles.productThumb}>
                  <img src={item.imageSrc} alt={item.title} loading="lazy" />
                </div>
                <div className={styles.productName}>{item.title}</div>
                {item.price && (
                  <div className={styles.productPrice}>{item.price}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <span className="truncate">
          {state.isLoading ? 'Network Activity...' : `${state.items.length} object(s)`}
        </span>
      </div>
    </div>
  );
};