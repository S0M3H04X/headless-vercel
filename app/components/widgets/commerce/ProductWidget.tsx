'use client';
import React from 'react';
import { ContentDescriptor } from '@/lib/types/workspace';

interface WidgetProps {
  content: ContentDescriptor;
  internalState: any; // 暫時使用 any，Phase 3 會處理
}

export default function ProductWidget({ content }: WidgetProps) {
  // 模擬：未來這裡會呼叫 Shopify API
  return (
    <div className="h-full w-full flex flex-col p-4 bg-white">
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
        Product Image Placeholder
      </div>
      <h2 className="text-xl font-bold mb-2">Shopify Product</h2>
      <code className="bg-gray-100 p-1 rounded text-sm mb-4 block">ID: {content.sourceId}</code>
      <p className="text-gray-600 flex-grow">
        這是一個動態載入的商品卡片。它獨立於桌面邏輯運行。
      </p>
      <button className="mt-4 w-full py-2 bg-black text-white rounded hover:bg-gray-800">
        Add to Cart
      </button>
    </div>
  );
}