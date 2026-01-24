'use client';
import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ScenarioService } from '@/lib/services/scenarioService';
import { BaseWidgetProps } from '@/lib/types/workspace';
import { useCollectionData } from '@/hooks/useCollectionData';
import { CollectionVisualizer } from './CollectionVisualizer';
import { Button } from '@/components/ui/primitives/Button';
import styles from './CollectionApp.module.scss';

export const CollectionApp: React.FC<BaseWidgetProps> = ({ id, content }) => {
  const { updateWindowTitle } = useWorkspaceStore();
  const { products, isLoading, error } = useCollectionData(content.sourceId);

  // Navigation state: track currently selected product index
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update window title
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      updateWindowTitle(id, `${content.sourceId.toUpperCase()} (${products.length})`);
    } else if (error) {
      updateWindowTitle(id, 'Connection Error');
    }
  }, [isLoading, products, error, id, content.sourceId, updateWindowTitle]);

  // Reset selection when products change
  useEffect(() => {
    setSelectedIndex(0);
  }, [products]);

  // Navigation handlers
  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < products.length - 1 ? prev + 1 : 0));
  };

  const handleView = () => {
    if (products.length > 0 && products[selectedIndex]) {
      ScenarioService.launchProductSuite(products[selectedIndex].handle);
    }
  };

  // Double-click to open product
  // const handleProductClick = (handle: string) => {
  //   ScenarioService.launchProductSuite(handle);
  // };

  // Click to select product
  const handleProductSelect = (index: number) => {
    setSelectedIndex(index);
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
          <>
            <div className={styles.productGrid}>
              {products.map((p, index) => (
                <div
                  key={p.id}
                  className={`${styles.productItem} ${index === selectedIndex ? styles.selected : ''}`}
                  onClick={() => handleProductSelect(index)}
                  // onDoubleClick={() => handleProductClick(p.handle)}
                  title={p.title}
                >
                  <div className={styles.productThumb}>
                    {p.featuredImage && <img src={p.featuredImage.url} alt={p.title} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Product Large Preview */}
            {products.length > 0 && products[selectedIndex] && (
              <div className={styles.selectedPreview}>
                {products[selectedIndex].featuredImage && (
                  <img
                    src={products[selectedIndex].featuredImage.url}
                    alt={products[selectedIndex].title}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation Controller */}
      {!isLoading && !error && products.length > 0 && (
        <div className={styles.controller}>
          <div className={styles.viewContainer}>

            <Button
              buttonStyle="system"
              isDefault
              onClick={handleView}
              className={styles.viewButton}
            >
              View Detail
            </Button>
          </div>
          <div className={styles.navContainer}>
            <Button
              buttonStyle="custom"
              onClick={handlePrevious}
              className={styles.navButton}
              aria-label="Previous product"
            >
              ▲
            </Button>
            <Button
              buttonStyle="custom"
              onClick={handleNext}
              className={styles.navButton}
              aria-label="Next product"
            >
              ▼
            </Button>

          </div>

          <div className={styles.infoContainer}>
            <div className={styles.controllerInfo}>
              <span className={styles.indexDisplay}>
                {selectedIndex + 1} / {products.length}
              </span>
              <span className={styles.productLabel}>
                {products[selectedIndex]?.title || ''}
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};