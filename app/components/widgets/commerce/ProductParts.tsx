'use client';
import React, { useState } from 'react';
import { z } from 'zod';

import { BaseWidgetProps } from '@/lib/types/workspace';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import { useCartStore } from '@/store/cartStore'; // [新增] 引入 Store
import { Button } from '@/components/ui/primitives/Button';
import styles from './ProductParts.module.scss';


const DEFAULT_DESC_STATE = { fontSize: 14, showDetails: true };
const DEFAULT_TITLE_STATE = { fontSize: 24, showDetails: true };
const DEFAULT_IMAGE_STATE = { width: 500, showDetails: true };

// 定義這個 Widget 的狀態結構
const ProductImageStateSchema = z.object({
  width: z.number().min(100).max(1000),
  showDetails: z.boolean(),
});

type ProductImageState = z.infer<typeof ProductImageStateSchema>;

const ProductTitleStateSchema = z.object({
  fontSize: z.number().min(12).max(36),
  showDetails: z.boolean(),
});
type ProductTitleState = z.infer<typeof ProductTitleStateSchema>;

const ProductDescStateSchema = z.object({
  fontSize: z.number().min(12).max(24),
  showDetails: z.boolean(),
});

type ProductDescState = z.infer<typeof ProductDescStateSchema>;

// 1. 商品圖片視窗

export const ProductImageWidget = ({ content }: BaseWidgetProps) => {
  const { product, loading } = useShopifyProduct(content.sourceId);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch state for swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  if (loading) return <div className="animate-pulse bg-gray-200 h-full w-full" />;

  // Extract all images
  const images = product?.images?.edges?.map((e: any) => e.node) || [];
  const hasMultipleImages = images.length > 1;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const currentImg = images[currentIndex];

  return (
    <div
      className={`${styles.imageContainer} relative group touch-pan-y`}
      onTouchStart={hasMultipleImages ? onTouchStart : undefined}
      onTouchMove={hasMultipleImages ? onTouchMove : undefined}
      onTouchEnd={hasMultipleImages ? onTouchEnd : undefined}
    >
      {currentImg ? (
        <>
          <img
            src={currentImg.url}
            alt={currentImg.altText || product?.title || 'Product Image'}
            className={styles.imageSlide}
          />

          {hasMultipleImages && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 text-black p-2 rounded-full shadow-sm backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 text-black p-2 rounded-full shadow-sm backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1 px-2 rounded-full bg-black/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                {images.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <span className="text-gray-400">No Image</span>
      )}
    </div>
  );
};

// 2. 商品資訊視窗 (合併標題 + 描述)
export const ProductInfoWidget = ({ content, internalState }: BaseWidgetProps) => {
  const { product, loading } = useShopifyProduct(content.sourceId);
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const state = useWidgetState<ProductDescState>(
    internalState,
    ProductDescStateSchema,
    DEFAULT_DESC_STATE
  );

  const handleAddToCart = async () => {
    // 安全地獲取第一個 Variant ID
    const defaultVariantId = product?.variants?.edges?.[0]?.node?.id;

    if (!defaultVariantId) {
      console.error("Product data missing variants:", product);
      alert('Error: No variant available. Please check console.');
      return;
    }

    setIsAdding(true);
    await addItem(defaultVariantId, 1);
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-white p-6 flex flex-col gap-2">
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse mt-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mt-4" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className={styles.infoContainer}>
      {/* 標題區塊 */}

      <div className={styles.headerContainer}>
        <div className={styles.textSection}>
          <h1 className={styles.productTitle}>
            {product?.title || 'Product Not Found'}
          </h1>
          <div className={styles.productPrice}>
            {product?.variants?.edges?.[0]?.node?.price?.amount
              ? `$${product.variants.edges[0].node.price.currencyCode} ${product.variants.edges[0].node.price.amount} `
              : ''}
          </div>

        </div>


        {(() => {
          const variant = product?.variants?.edges?.[0]?.node;
          const isSoldOut = !variant?.availableForSale || (variant?.quantityAvailable !== undefined && variant.quantityAvailable <= 0);

          return (
            <div className="flex flex-col gap-2 items-center">
              {/* {isSoldOut && (
                <span className="text-red-500 text-xs font-bold uppercase tracking-wider border border-red-500 px-2 py-0.5 rounded">
                  Sold Out
                </span>
              )} */}
              <Button
                className={styles.btnAddToCart}
                buttonStyle="system" isDefault
                onClick={handleAddToCart}
                disabled={isAdding || !product || isSoldOut}
              >
                {isSoldOut ? 'SOLD OUT' : (isAdding ? 'Adding...' : 'ADD TO CART')}
              </Button>
            </div>
          );
        })()}
      </div>
      {/* 描述區塊 */}
      <div className={styles.descContainer}>
        <div
          style={{ fontSize: state.fontSize }}
          className={styles.descriptionText}
        >
          {product?.description || "No description available for this product."}
        </div>

        {/* 狀態控制的額外資訊 */}
        {state.showDetails && (
          <div className="mt-6 pt-4 border-gray-100 text-xs text-gray-400 font-mono">
            Product ID: {content.sourceId}<br />
            Source: Shopify Storefront API
          </div>
        )}
      </div>




    </div >
  );
};
