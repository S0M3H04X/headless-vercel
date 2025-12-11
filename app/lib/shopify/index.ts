const domain = `https://${process.env.SHOPIFY_STORE_DOMAIN}`;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch<T>({ query, variables }: { query: string; variables?: object }): Promise<T> {
  const endpoint = `${domain}/api/2023-10/graphql.json`;
  const key = JSON.stringify({ query, variables });

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken!,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'force-cache', // 利用 Next.js 緩存
      next: { tags: ['shopify'] } // 用於 Revalidation
    });

    const body = await result.json();
    if (body.errors) {
      throw body.errors[0];
    }
    return body.data;
  } catch (e) {
    throw {
      error: e,
      query
    };
  }
}