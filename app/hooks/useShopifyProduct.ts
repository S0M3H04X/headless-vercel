import { useState, useEffect } from 'react';
import { getProduct, Product } from '@/lib/shopify';


export function useShopifyProduct(handle: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      if (!handle) return;
      
      try {
        setLoading(true);
        // sourceId 通常是 handle (例如 "fancy-cup")
        const data = await getProduct(handle);
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [handle]);

  return { product, loading, error };
}