// app/hooks/useCollectionData.ts
import { useState, useEffect } from 'react';
import { getCollectionProducts, Product } from '@/lib/shopify';

// Global cache for collection data
const collectionCache = new Map<string, Promise<Product[]>>();

export const preloadCollection = (handle: string) => {
  if (!collectionCache.has(handle)) {
    const promise = getCollectionProducts(handle);
    collectionCache.set(handle, promise);
    // Handle potential errors to avoid unhandled rejections if not awaited immediately
    promise.catch(err => {
      console.error(`[CollectionCache] Error preloading ${handle}:`, err);
      // We might want to remove it from cache on error so it can be retried
      collectionCache.delete(handle);
    });
  }
};

export const useCollectionData = (handle: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    // Check cache first
    let promise = collectionCache.get(handle);

    // If not in cache, fetch it and cache it
    if (!promise) {
      promise = getCollectionProducts(handle);
      collectionCache.set(handle, promise);
    }

    // 呼叫 Shopify API (using the promise)
    promise
      .then(data => {
        if (mounted) setProducts(data);
      })
      .catch(err => {
        console.error('[CollectionHook] Error:', err);
        if (mounted) setError(err);
        // Optionally remove from cache on error
        collectionCache.delete(handle);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, [handle]);

  return { products, isLoading, error };
};