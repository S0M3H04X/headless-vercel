'use client';
import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { SystemButton } from '@/components/ui/SystemButton';
import { getCollections, getCollectionProducts, Collection, Product } from '@/lib/shopify';
import { WidgetKind } from '@/lib/types/workspace';
import styles from './CollectionWidget.module.scss'; // 請確保建立對應樣式

// 這是視窗內部的內容
export const CollectionWidget = ({ id, content }: { id: string, content: { sourceId?: string } }) => {
  const { openWindow, updateWindowTitle } = useWorkspaceStore();
  const [items, setItems] = useState<Array<Collection | Product>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'root' | 'folder'>(content.sourceId === 'root' ? 'root' : 'folder');

  // 載入數據
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (content.sourceId === 'root' || !content.sourceId) {
          // 模式 1: 顯示所有 Collections (Root Level)
          const collections = await getCollections();
          setItems(collections);
          updateWindowTitle(id, 'Macintosh HD'); 
          setViewMode('root');
        } else {
          // 模式 2: 顯示特定 Collection 內的商品 (Folder Level)
          const handle = content.sourceId;
          const products = await getCollectionProducts(handle);
          setItems(products);
          updateWindowTitle(id, handle.charAt(0).toUpperCase() + handle.slice(1)); // Capitalize
          setViewMode('folder');
        }
      } catch (e) {
        console.error("Failed to load finder data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [content.sourceId, id, updateWindowTitle]);

  const handleDoubleClick = (item: any) => {
    if (viewMode === 'root') {
      // 在 Root 雙擊 Collection -> 開啟新視窗顯示該 Collection
      openWindow({
        title: item.title,
        content: { kind: 'collection' as WidgetKind, sourceId: item.handle },
        geometry: { x: 'center', y: 'center', width: 600, height: 400 }
      });
    } else {
      // 在 Folder 雙擊 Product -> 開啟商品詳情
      openWindow({
        title: item.title,
        content: { kind: WidgetKind.Product, sourceId: item.handle },
        geometry: { x: 'center', y: 'center', width: 800, height: 600 }
      });
    }
  };

  return (
    <div className={styles.finderContainer}>
      {/* 簡單的 Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.pathBar}>
            {viewMode === 'root' ? 'Computer' : content.sourceId}
        </div>
      </div>

      <div className={styles.gridArea}>
        {isLoading ? (
          <div className="flex justify-center p-8"><span className="animate-spin">⌛</span></div>
        ) : (
          items.map((item: any) => (
            <div 
              key={item.id} 
              className={styles.gridItem}
              onDoubleClick={() => handleDoubleClick(item)}
            >
              <div className={styles.iconWrapper}>
                 {/* Root 顯示資料夾 Icon，Folder 顯示商品圖或檔案 Icon */}
                 {viewMode === 'root' ? (
                    <img src="/assets/classicy/img/icons/system/folders/folder-system.png" className="w-10 h-10" />
                 ) : (
                    item.featuredImage ? 
                    <img src={item.featuredImage.url} className="w-10 h-10 object-cover border border-gray-400" /> :
                    <img src="/assets/classicy/img/icons/system/files/document.png" className="w-8 h-10" />
                 )}
              </div>
              <span className={styles.itemLabel}>{item.title}</span>
            </div>
          ))
        )}
      </div>
      <div className={styles.statusBar}>{items.length} items</div>
    </div>
  );
};