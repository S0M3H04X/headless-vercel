// app/lib/shopify/admin.ts

const ADMIN_URL = process.env.SHOPIFY_ADMIN_API_URL;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

if (!ADMIN_URL || !ADMIN_TOKEN) {
  throw new Error('Missing SHOPIFY_ADMIN_API_URL or SHOPIFY_ADMIN_ACCESS_TOKEN');
}

async function adminFetch(query: string, variables = {}) {
  const res = await fetch(ADMIN_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  });

  const text = await res.text();

  if (!res.ok) {
     throw new Error(`Shopify Admin API HTTP Error (${res.status}): ${text}`);
  }

  let json;
  try {
     json = JSON.parse(text);
  } catch (e) {
     throw new Error(`Failed to parse Admin API response: ${text}`);
  }

  // Admin API 有時會回傳 userErrors 但不一定在 top level，這裡做基本檢查
  if (json.errors) {
      console.error('[Shopify Admin GraphQL Error]', JSON.stringify(json.errors, null, 2));
      // 這裡不 throw，因為有時只是部分欄位錯誤，我們容錯處理
  }

  return json;
}

export const ShopifyAdmin = {
  // 1. 透過 Email 查找用戶
  findCustomerByEmail: async (email: string) => {
    const query = `
      query findCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              email
              firstName
              lastName
            }
          }
        }
      }
    `;
    const data = await adminFetch(query, { query: `email:${email}` });
    return data.data?.customers?.edges[0]?.node || null;
  },

  // 2. [Simplified] 建立新用戶 (不設密碼)
  // 如果是新 Email，我們幫他在 Shopify 建檔，方便未來行銷，但「不」設密碼
  createCustomer: async (email: string) => {
    const query = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }
    `;
    const data = await adminFetch(query, {
      input: { 
          email,
          emailMarketingConsent: {
              marketingState: "NOT_SUBSCRIBED",
              marketingOptInLevel: "SINGLE_OPT_IN"
          }
      }
    });
    return data.data?.customerCreate;
  }
};