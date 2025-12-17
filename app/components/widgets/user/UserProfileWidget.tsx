'use client';

import React from 'react';
import { useShopifyCustomer } from '@/hooks/useShopifyCustomer';
import { useAuthStore } from '@/store/authStore';
import { BaseWidgetProps } from '@/lib/types/workspace';

export default function UserProfileWidget({ id }: BaseWidgetProps) {
  const { customer, loading, error } = useShopifyCustomer();
  const logout = useAuthStore((s) => s.logout);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-gray-600 text-sm mb-4">{error || 'Session expired'}</p>
        <button 
          onClick={logout}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-xs"
        >
          Re-login
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header: Profile Info */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            {customer.firstName?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="text-xs text-gray-500">{customer.email}</p>
          </div>
        </div>
      </div>

      {/* Content: Order History */}
      <div className="flex-1 overflow-y-auto p-0">
        <div className="px-6 py-4 bg-white sticky top-0 z-10 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Order History
          </h3>
        </div>

        {customer.orders.edges.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No orders found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {customer.orders.edges.map(({ node: order }) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-gray-900">
                      Order #{order.orderNumber}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      order.financialStatus === 'PAID' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {order.financialStatus}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.processedAt).toLocaleDateString()} • 
                    {order.lineItems.edges.map(e => e.node.title).join(', ').slice(0, 30)}...
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-sm">
                    {order.currentTotalPrice.amount} {order.currentTotalPrice.currencyCode}
                  </div>
                  {order.statusUrl && (
                    <a 
                      href={order.statusUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Receipt ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-400">Shopify Secure Session</span>
        <button 
          onClick={logout}
          className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1 hover:bg-red-50 rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}