'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore'; // 注意：確認您的 cartStore 是放在哪，根據上一輪應為 @/store/cartStore
// 修正引用路徑：
import { useCartStore } from '@/store/cartStore';
import { ProgressBar } from '@/components/ui/primitives';
import { BaseWidgetProps } from '@/lib/types/workspace';

export default function CartWidget({ content }: BaseWidgetProps) {
  const { cart, error, isLoading, removeItem, updateQuantity, initialize, clearError } = useCartStore();

  // 初始化：確保 LocalStorage 中的 Cart ID 被載入並同步最新狀態
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 格式化金額
  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      // 轉導至 Shopify 原生結帳頁面
      window.location.href = cart.checkoutUrl;
    }
  };

  if (isLoading && !cart) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-[200px]">
          <ProgressBar label="Loading Cart..." />
        </div>
      </div>
    );
  }

  if (!cart || !cart.lines || cart.lines.edges.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="text-4xl mb-4">🛒</div>
        <p className="text-gray-500 font-medium">Your cart is empty.</p>
        <p className="text-sm text-gray-400 mt-2 text-center">
          Browse products and click "Add to Cart" to start shopping.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-red-50 text-red-600">
        <p className="font-bold mb-2">Error</p>
        <p className="text-sm text-center mb-4">{error}</p>
        <button
          onClick={() => { clearError(); initialize(); }}
          className="px-4 py-2 bg-white border border-red-200 rounded shadow-sm hover:bg-red-50"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 商品列表區域 (可捲動) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.lines.edges.map(({ node: item }) => (
          <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 items-center">
            {/* 商品圖片 */}
            <div className="w-16 h-16 bg-white rounded border overflow-hidden flex-shrink-0">
              {item.merchandise.image ? (
                <img
                  src={item.merchandise.image.url}
                  alt={item.merchandise.image.altText || item.merchandise.product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No Img</div>
              )}
            </div>

            {/* 商品資訊 */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate" title={item.merchandise.product.title}>
                {item.merchandise.product.title}
              </h4>
              <p className="text-xs text-gray-500">{item.merchandise.title}</p>
              <div className="text-sm font-medium mt-1">
                {formatPrice(item.cost.totalAmount.amount, item.cost.totalAmount.currencyCode)}
              </div>
            </div>

            {/* 數量控制 */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center border bg-white rounded overflow-hidden">
                <button
                  disabled={isLoading}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50 text-xs"
                >
                  -
                </button>
                <span className="px-2 text-xs font-mono w-6 text-center">{item.quantity}</span>
                <button
                  disabled={isLoading}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50 text-xs"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                disabled={isLoading}
                className="text-xs text-red-500 hover:text-red-700 underline decoration-dotted"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 底部結帳區域 (固定) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm text-gray-600 font-medium">Subtotal</span>
          <div className="text-right">
            <span className="text-xl font-bold text-gray-900 block">
              {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
            </span>
            <span className="text-xs text-gray-400">Tax included. Shipping calculated at checkout.</span>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full py-1">
            <ProgressBar height="30px" label="Processing Order..." />
          </div>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex justify-center items-center gap-2"
          >
            Proceed to Checkout →
          </button>
        )}
      </div>
    </div>
  );
}