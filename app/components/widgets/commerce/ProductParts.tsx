'use client';
import React from 'react';
import { z } from 'zod';

import { BaseWidgetProps } from '@/lib/types/workspace';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';


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

// 2. 商品標題視窗
export const ProductTitleWidget = ({ content }: BaseWidgetProps) => {
  const { product, loading } = useShopifyProduct(content.sourceId);
  
  const addToCart = () => {
     alert(`Added ${product?.title} to cart! (Cart Context Pending)`);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="h-full w-full bg-white p-4 flex flex-col justify-center text-center border-l-4 border-blue-600">
      <h1 className="text-2xl font-black uppercase tracking-widest leading-tight">
        {product?.title || 'Product Not Found'}
      </h1>
      <button 
        onClick={addToCart}
        className="mt-4 bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 transition-transform active:scale-95"
      >
        ADD TO CART
      </button>
    </div>
  );
};

// 3. 商品描述視窗
export const ProductDescWidget = ({ content, internalState }: BaseWidgetProps) => {
  // 使用衛士：給定預設值
  const state = useWidgetState<ProductDescState>(
    internalState, 
    ProductDescStateSchema, 
    DEFAULT_DESC_STATE
  );

  return (
    <div className="h-full w-full bg-white p-6 overflow-y-auto">
      {/* 使用安全的 state */}
      <p style={{ fontSize: state.fontSize }}>
        這是一雙傳奇的球鞋。採用了最先進的氣墊技術，不僅適合運動，更適合收藏。
      (這裡是原子化拆分後的描述區塊，獨立渲染)
      </p>
    </div>
  );
};