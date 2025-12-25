'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ScenarioService } from '@/lib/services/scenarioService'; // [新增]
// import { getCollectionProducts, Product } from '@/lib/shopify';
import { BaseWidgetProps } from '@/lib/types/workspace';
import { useCollectionData } from '@/hooks/useCollectionData'; // [Hook]
import { CollectionVisualizer } from './CollectionVisualizer';
import styles from './CollectionApp.module.scss';

export const CollectionApp: React.FC<BaseWidgetProps> = ({ id, content }) => {
  const { updateWindowTitle } = useWorkspaceStore();
  const { products, isLoading, error } = useCollectionData(content.sourceId);

  // 2. 副作用：更新視窗標題
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      updateWindowTitle(id, `${content.sourceId.toUpperCase()} (${products.length})`);
    } else if (error) {
      updateWindowTitle(id, 'Connection Error');
    }
  }, [isLoading, products, error, id, content.sourceId, updateWindowTitle]);

  // 3. 互動：開啟商品詳情
  const handleProductClick = (handle: string) => {
      ScenarioService.launchProductSuite(handle);
  };

  return (
    <div className={styles.appContainer}>
      {/* Visual Layer */}
      <CollectionVisualizer isLoading={isLoading} />

      {/* Content Layer */}
      <div className={styles.viewArea}>
        {isLoading ? (
            <div className="p-4 text-center text-xs text-gray-500 font-mono">
                Connecting to Commerce Cloud...
            </div>
        ) : error ? (
            <div className="p-4 text-center text-red-600 text-xs font-mono">
                Error loading collection.
            </div>
        ) : (
            <div className={styles.productGrid}>
              {products.map((p) => (
                <div 
                  key={p.id} 
                  className={styles.productItem}
                  onDoubleClick={() => handleProductClick(p.handle)}
                  title={p.title}
                >
                  <div className={styles.productThumb}>
                    {p.featuredImage && <img src={p.featuredImage.url} alt={p.title} />}
                  </div>
                  <div className={styles.productName}>{p.title}</div>
                </div>
              ))}
            </div>
        )}
      </div>
    </div>
  );
};