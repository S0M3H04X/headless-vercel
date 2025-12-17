'use client';
import React, { useState } from 'react';
import { z } from 'zod';

import { BaseWidgetProps } from '@/lib/types/workspace';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import { useCartStore } from '@/store/cartStore'; // [新增] 引入 Store


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
export const ProductImageWidget = ({ content }: BaseWidgetProps ) => {
  const { product, loading } = useShopifyProduct(content.sourceId);
  if (loading) return <div className="animate-pulse bg-gray-200 h-full w-full" />;
  
  const imgUrl = product?.images?.edges?.[0]?.node?.url;
  return (
    <div className="h-full w-full bg-white flex items-center justify-center overflow-hidden">
      {imgUrl ? (
        <img src={imgUrl} alt={product.title} className="object-cover h-full w-full" />
      ) : (
        <span className="text-gray-400">No Image</span>
      )}
    </div>
  );
};

// 2. 商品標題視窗 (修正加入購物車邏輯)
export const ProductTitleWidget = ({ content }: BaseWidgetProps) => {
  const { product, loading } = useShopifyProduct(content.sourceId);
  console.log(product)
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);

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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="h-full w-full bg-white p-4 flex flex-col justify-center text-center border-l-4 border-blue-600">
      <h1 className="text-2xl font-black uppercase tracking-widest leading-tight">
        {product?.title || 'Product Not Found'}
      </h1>
      <div className="text-sm text-gray-500 mt-2 font-mono">
        {product?.variants?.edges?.[0]?.node?.price?.amount 
          ? `$${product.variants.edges[0].node.price.amount} ${product.variants.edges[0].node.price.currencyCode}`
          : ''}
      </div>
      <button 
        onClick={handleAddToCart}
        disabled={isAdding || !product}
        className="mt-4 bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 disabled:bg-gray-400 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
      >
        {isAdding ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding...
          </>
        ) : (
          'ADD TO CART'
        )}
      </button>
    </div>
  );
};

// 3. 商品描述視窗
export const ProductDescWidget = ({ content, internalState }: BaseWidgetProps) => {
  // 使用衛士：給定預設值
  const { product, loading } = useShopifyProduct(content.sourceId);
  const state = useWidgetState<ProductDescState>(
    internalState, 
    ProductDescStateSchema, 
    DEFAULT_DESC_STATE
  );

  if (loading) {
    return (
      <div className="h-full w-full bg-white p-6 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white p-6 overflow-y-auto">
      {/* C. 渲染真實描述 */}
      <div 
        style={{ fontSize: state.fontSize }} 
        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
      >
        {product?.description || "No description available for this product."}
      </div>

      {/* 狀態控制的額外資訊 */}
      {state.showDetails && (
        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 font-mono">
          Product ID: {content.sourceId}<br/>
          Source: Shopify Storefront API
        </div>
      )}
    </div>
  );

};