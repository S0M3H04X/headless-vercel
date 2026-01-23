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
  if (loading) return <div className="animate-pulse bg-gray-200 h-full w-full" />;

  const imgUrl = product?.images?.edges?.[0]?.node?.url;
  return (
    <div className={styles.imageContainer}>
      {imgUrl ? (
        <img src={imgUrl} alt={product.title} className="object-cover h-full w-full" />
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
      <h1 className={styles.productTitle}>
        {product?.title || 'Product Not Found'}
      </h1>
      <div className={styles.productPrice}>
        {product?.variants?.edges?.[0]?.node?.price?.amount
          ? `$${product.variants.edges[0].node.price.amount} ${product.variants.edges[0].node.price.currencyCode}`
          : ''}
      </div>
      <Button
        className={styles.btnAddToCart}
        buttonStyle="system" isDefault
        onClick={handleAddToCart}
        disabled={isAdding || !product}
      >
        {isAdding ? (
          <>
            Adding...
          </>
        ) : (
          'ADD TO CART'
        )}
      </Button>

      {/* 描述區塊 */}
      <div className={styles.productDescription}>
        <div
          style={{ fontSize: state.fontSize }}
          className="text-gray-700 leading-relaxed whitespace-pre-wrap"
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
    </div>
  );
};
