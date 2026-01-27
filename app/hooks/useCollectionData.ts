// app/hooks/useCollectionData.ts
import { useState, useEffect } from 'react';
import { getCollectionProducts, Product } from '@/lib/shopify';

export const useCollectionData = (handle: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    // 呼叫 Shopify API
    getCollectionProducts(handle)
      .then(data => {
        if (mounted) setProducts(data);
      })
      .catch(err => {
        console.error('[CollectionHook] Error:', err);
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, [handle]);

  return { products, isLoading, error };
};