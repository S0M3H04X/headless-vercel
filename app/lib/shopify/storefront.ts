// app/lib/shopify/storefront.ts
// const domain = process.env.SHOPIFY_STORE_DOMAIN;
// const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// 使用 NEXT_PUBLIC_ 前綴以允許瀏覽器端存取
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !storefrontAccessToken) {
  throw new Error('Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
}

const GRAPHQL_URL = `https://${domain}/api/2025-10/graphql.json`;

export async function shopifyStorefrontFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: any;
}): Promise<T | undefined> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken!,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store', // Auth 請求不應該被快取
    });

    const json = await response.json();

    if (json.errors) {
      console.error('[Shopify Storefront Error]', json.errors);
      // 這裡不拋出錯誤，讓呼叫者處理業務邏輯
    }

    return json.data;
  } catch (error) {
    console.error('[Shopify Fetch Error]', error);
    throw new Error('Failed to fetch from Shopify Storefront API');
  }
}