import { useState, useEffect } from 'react';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;

export function useShopifyProduct(sourceId: string) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 簡單的 ID 解析邏輯 (gid://shopify/Product/12345 -> 12345)
    // 實務上建議使用 handle 查詢，這裡模擬直接 ID 查詢
    const fetchProduct = async () => {
      if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
            console.warn("Shopify Env missing");
            setLoading(false);
            return;
        }
        const isGid = sourceId.startsWith('gid://');
        const idVariableType = isGid ? "ID!" : "String!";
        const queryArg = isGid ? "id: $id" : "handle: $id"; // 使用 handle 查詢更方便測試

        const query = `
        query getProduct($id: ${idVariableType}) {
          product(${queryArg}) {
            title
            description
            images(first: 1) {
              edges { node { url } }
            }
          }
        }`;

        if (!SHOPIFY_DOMAIN) {
            // [Mock Mode] 如果沒設定環境變數，回傳假資料以免卡關
            setProduct({ 
                title: "Mock: Nike Air Zoom", 
                description: "This is a mock product because ENV vars are missing.",
                images: { edges: [{ node: { url: "https://placehold.co/600x400/png" } }] }
            });
            setLoading(false);
            return;
        }


        try {
            const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN!
                },
                body: JSON.stringify({ query, variables: { id: sourceId } })
            });
            const json = await res.json();

            if (json.errors) {
                console.error("Shopify API Errors:", json.errors);
            }
            
            setProduct(json.data?.product);
        } catch (e) {
            console.error("Shopify fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    fetchProduct();
  }, [sourceId]);

  return { product, loading };
}