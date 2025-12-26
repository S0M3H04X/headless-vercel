// app/lib/shopify/admin.ts

const ADMIN_URL = process.env.SHOPIFY_ADMIN_API_URL!;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;

async function adminFetch(query: string, variables = {}) {
  const res = await fetch(ADMIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  });
  return res.json();
}

export const ShopifyAdmin = {
  // 1. 透過 Email 查找用戶 ID
  findCustomerByEmail: async (email: string) => {
    const query = `
      query findCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              email
            }
          }
        }
      }
    `;
    const data = await adminFetch(query, { query: `email:${email}` });
    return data.data?.customers?.edges[0]?.node || null;
  },

  // 2. 建立新用戶 (設定密碼為 Access Key)
  createCustomer: async (email: string, accessKey: string) => {
    const query = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }
    `;
    const data = await adminFetch(query, {
      input: { email, password: accessKey, passwordConfirmation: accessKey }
    });
    return data.data?.customerCreate;
  },

  // 3. 更新現有用戶密碼
  updateCustomerPassword: async (id: string, accessKey: string) => {
    const query = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }
    `;
    const data = await adminFetch(query, {
      input: { id, password: accessKey, passwordConfirmation: accessKey }
    });
    return data.data?.customerUpdate;
  }
};