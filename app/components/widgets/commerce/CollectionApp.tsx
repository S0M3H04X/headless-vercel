'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ScenarioService } from '@/lib/services/scenarioService'; // [新增]
import { getCollectionProducts, Product } from '@/lib/shopify';
import { BaseWidgetProps } from '@/lib/types/workspace';
import styles from './CollectionApp.module.scss';

export const CollectionApp: React.FC<BaseWidgetProps> = ({ id, content }) => {
  const { updateWindowTitle } = useWorkspaceStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null); // [US-07-05-03] Canvas Ref

  useEffect(() => {
    const init = async () => {
      try {
        const handle = content.sourceId;
        const data = await getCollectionProducts(handle);
        setProducts(data);
        updateWindowTitle(id, `${handle.toUpperCase()} (${data.length})`);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [content.sourceId, id]);

  // [US-07-05-03] Initialize Canvas (Placeholder for Phase 8)
  useEffect(() => {
      if (canvasRef.current && !isLoading) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
              ctx.fillStyle = '#000';
              ctx.fillText('3D VIEW READY', 10, 50);
              // Future: new Three.Scene()...
          }
      }
  }, [isLoading]);

  const handleProductClick = (handle: string) => {
      // [修正] 點擊商品 -> 開啟全新的獨立視窗 (ProductPartsWidget)
      ScenarioService.launchProductSuite(handle);
  };

  return (
    <div className={styles.appContainer}>
      {/* 1. Canvas Area (Top Half) */}
      <div className="h-48 bg-black border-b border-gray-600 relative overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute bottom-2 right-2 text-white text-xs font-mono opacity-50">
              Interactive View
          </div>
      </div>

      {/* 2. Product Grid (Bottom Half) */}
      <div className={styles.viewArea}>
        {isLoading ? (
            <div className="p-4 text-center">Loading Data...</div>
        ) : (
            <div className={styles.productGrid}>
              {products.map((p) => (
                <div 
                  key={p.id} 
                  className={styles.productItem}
                  onDoubleClick={() => handleProductClick(p.handle)} // 雙擊開啟
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