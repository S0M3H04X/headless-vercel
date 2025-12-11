'use client';
import React from 'react';
import { ContentDescriptor } from '@/lib/types/workspace';
import { z } from 'zod';
import { useWidgetState } from '@/hooks/useWidgetState';

// 定義這個 Widget 的狀態結構
const ProductDescStateSchema = z.object({
  fontSize: z.number().min(12).max(24),
  showDetails: z.boolean(),
});

type ProductDescState = z.infer<typeof ProductDescStateSchema>;

// 1. 商品圖片視窗
export const ProductImageWidget = ({ content }: { content: ContentDescriptor }) => (
  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
    <div className="text-6xl">👟</div>
    <span className="sr-only">Product Image for {content.sourceId}</span>
  </div>
);

// 2. 商品標題視窗
export const ProductTitleWidget = ({ content }: { content: ContentDescriptor }) => (
  <div className="h-full w-full bg-white p-4 flex flex-col justify-center text-center border-l-4 border-blue-500">
    <h1 className="text-2xl font-black uppercase tracking-widest">Air Jordan X</h1>
    <p className="text-xs text-gray-400 mt-2">{content.sourceId}</p>
  </div>
);

// 3. 商品描述視窗
export const ProductDescWidget = ({ content, internalState }: { content: ContentDescriptor, internalState: unknown }) => {
  // 使用衛士：給定預設值
  const state = useWidgetState<ProductDescState>(
    internalState, 
    ProductDescStateSchema, 
    { fontSize: 14, showDetails: true }
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