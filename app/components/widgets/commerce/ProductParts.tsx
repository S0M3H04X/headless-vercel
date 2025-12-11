'use client';
import React from 'react';
import { ContentDescriptor } from '@/lib/types/workspace';

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
export const ProductDescWidget = ({ content }: { content: ContentDescriptor }) => (
  <div className="h-full w-full bg-white p-6 overflow-y-auto">
    <h3 className="font-bold text-sm mb-2 text-gray-500">DESCRIPTION</h3>
    <p className="text-sm leading-relaxed text-gray-800">
      這是一雙傳奇的球鞋。採用了最先進的氣墊技術，不僅適合運動，更適合收藏。
      (這裡是原子化拆分後的描述區塊，獨立渲染)
    </p>
  </div>
);