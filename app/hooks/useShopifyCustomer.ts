import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getCustomer, Customer } from '@/lib/shopify';

export function useShopifyCustomer() {
  const { customerAccessToken, logout } = useAuthStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!customerAccessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCustomer(customerAccessToken);
      
      if (!data) {
        // Token 可能過期或無效
        setError('Session expired');
        // logout(); // 可選：自動登出
      } else {
        setCustomer(data);
      }
    } catch (err) {
      console.error('Failed to fetch customer:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [customerAccessToken]); // logout 不放入依賴以免循環

  // 初始載入
  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return { 
    customer, 
    loading, 
    error, 
    refresh: fetchCustomer // 供手動重新整理用
  };
}