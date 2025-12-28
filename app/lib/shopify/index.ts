// app/lib/shopify/index.ts
import { updateCartBuyerIdentityMutation } from './graphql/cart';
import { shopifyStorefrontFetch } from './storefront';


const BFF_ENDPOINT = '/api/shopify/query';

export async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache',
  customerAccessToken,
  apiType = 'storefront'
}: {
  query: string;
  variables?: object;
  cache?: RequestCache;
  customerAccessToken?: string; // [新增] 支援會員權杖
  apiType?: 'storefront' | 'customer';
}): Promise<T> {
  console.log(`[BFF Client] Fetching ${apiType}:`, variables);
  try {
    // [修改] 改為呼叫 Next.js BFF API
    const result = await fetch(BFF_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 注意：這裡不再需要傳送 Storefront Access Token，因為它在後端
      },
      body: JSON.stringify({
        query,
        variables,
        customerAccessToken, // 將用戶 Token 傳給後端 (若需要)
        apiType
      }),
      cache,
      // next: { tags: ['shopify'] } // BFF 模式下，Next.js 的 tag revalidation 機制需調整，暫時移除
    });

    const body = await result.json();

    if (body.errors) {
      console.error('[Shopify Error]', body.errors);
      throw body.errors[0];
    }

    return body.data;
  } catch (e) {
    console.error('[Shopify Fetch Error]', e);
    throw {
      error: e,
      query
    };
  }
}


// --- 2. 型別定義 (Types) ---

// --- Product Types ---

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  featuredImage?: {
    url: string;
    altText: string;
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

// --- Product Operations ---

export async function getProduct(handle: string): Promise<Product | null> {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        featuredImage {
          url
          altText
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch<{ product: Product }>({
    query,
    variables: { handle },
  });

  return response.product;
}


export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
    };
    image?: {
      url: string;
      altText: string;
    };
    price: {
      amount: string;
      currencyCode: string;
    };
  };
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
}

// 用於定義 GraphQL 回傳結構的輔助型別
type CartOperationResponse<K extends string> = {
  [key in K]: {
    cart: Cart;
    userErrors: Array<{ field: string; message: string }>;
  };
};

// --- 3. Fragments ---

const CART_FRAGMENT = `
  fragment cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                title
                handle
              }
              image {
                url
                altText
              }
              price {
                amount
                currencyCode
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

// --- 4. 購物車操作 (Cart Operations) ---

export async function createCart(): Promise<Cart> {
  const query = `
    mutation createCart {
      cartCreate {
        cart {
          ...cart
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  // [修正 1] 傳入物件參數
  // [修正 2] 泛型指定為 CartOperationResponse<'cartCreate'>
  const response = await shopifyFetch<CartOperationResponse<'cartCreate'>>({ query });

  // [修正 3] 直接存取 cartCreate，不需要再 .data
  return response.cartCreate.cart;
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const query = `
    mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...cart
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<CartOperationResponse<'cartLinesAdd'>>({
    query,
    variables: { cartId, lines }
  });
  return response.cartLinesAdd.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const query = `
    mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...cart
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<CartOperationResponse<'cartLinesRemove'>>({
    query,
    variables: { cartId, lineIds }
  });
  return response.cartLinesRemove.cart;
}

export async function updateCartLine(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart> {
  const query = `
    mutation updateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...cart
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<CartOperationResponse<'cartLinesUpdate'>>({
    query,
    variables: { cartId, lines }
  });
  return response.cartLinesUpdate.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        ...cart
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<{ cart: Cart }>({
    query,
    variables: { cartId }
  });
  return response.cart;
}

// --- Customer Types ---

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  statusUrl: string;
  currentTotalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    edges: Array<{
      node: {
        title: string;
        quantity: number;
      }
    }>
  }
}


// --- Customer Operations ---
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // phone?: string;
  orders: {
    edges: Array<{
      node: Order;
    }>;
  };
}


export async function getCustomer(customerAccessToken: string): Promise<Customer | null> {
  // [關鍵修正 1] 移除 ($customerAccessToken) 參數
  // Customer Account API 直接從 HTTP Header 讀取 Token，不需要在 Query 中傳遞
  const query = `
    query getCustomerProfile {
      customer {
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        orders(first: 10, reverse: true) {
          edges {
            node {
              id
              name           # Customer API 用 name 代表訂單號 (如 #1001)
              financialStatus
              totalPrice {   # 注意：這裡是 totalPrice 而非 currentTotalPrice
                amount
                currencyCode
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch<{ customer: any }>({
    query,
    // variables: {}, // 不需要變數
    customerAccessToken, // 傳給 BFF 放入 Header
    apiType: 'customer', // [關鍵修正 2] 明確指定走 Customer Account API 線路
    cache: 'no-store'
  });

  const rawCustomer = response.customer;
  
  // [安全檢查] 若 Token 無效或過期，API 可能回傳 null
  if (!rawCustomer) return null;

  // [關鍵修正 3] Adapter: 將 API 結構轉換為 UI 預期的結構
  return {
    id: rawCustomer.id,
    firstName: rawCustomer.firstName,
    lastName: rawCustomer.lastName,
    email: rawCustomer.emailAddress?.emailAddress || '', // 欄位轉換
    orders: {
      edges: (rawCustomer.orders?.edges || []).map((edge: any) => ({
        node: {
          id: edge.node.id,
          orderNumber: edge.node.name, // Mapping name -> orderNumber
          processedAt: new Date().toISOString(), // API 可能未回傳，給預設值
          financialStatus: edge.node.financialStatus,
          fulfillmentStatus: 'UNFULFILLED', // Customer API 需額外查詢，暫時給預設值以防崩潰
          statusUrl: '', 
          currentTotalPrice: edge.node.totalPrice, // Mapping totalPrice -> currentTotalPrice
          lineItems: edge.node.lineItems
        }
      }))
    }
  };
}

// app/lib/shopify/index.ts


// [新增] Collection 介面定義
export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: {
    url: string;
    altText: string;
  };
  updatedAt: string;
}

// [新增] 獲取所有 Collections (模擬資料夾列表)
export async function getCollections(): Promise<Collection[]> {
  const query = `
    query getCollections {
      collections(first: 20) {
        edges {
          node {
            id
            title
            handle
            updatedAt
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;
  
  const response = await shopifyFetch<{ collections: { edges: Array<{ node: Collection }> } }>({ 
    query, 
    cache: 'force-cache' 
  });
  
  return response.collections.edges.map((edge) => edge.node);
}

// [新增] 獲取特定 Collection 內的商品 (模擬資料夾內容)
export async function getCollectionProducts(handle: string): Promise<Product[]> {
  const query = `
    query getCollectionProducts($handle: String!) {
      collection(handle: $handle) {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch<{ collection: { products: { edges: Array<{ node: Product }> } } }>({ 
    query, 
    variables: { handle },
    cache: 'no-store' // 確保庫存狀態即時
  });

  if (!response.collection) {
    console.warn(`[Shopify] Collection not found: ${handle}`);
    return [];
  }
  
  if (!response.collection) return [];
  return response.collection.products.edges.map((edge) => edge.node);
}


export async function updateCartBuyerIdentity(
  cartId: string, 
  buyerIdentity: { 
    customerAccessToken: string; 
    email?: string;
  }
) {
  const res = await shopifyStorefrontFetch<any>({
    query: updateCartBuyerIdentityMutation,
    variables: {
      cartId,
      buyerIdentity,
    },
  });

  if (res.cartBuyerIdentityUpdate?.userErrors?.length > 0) {
    console.error('[Shopify] Identity Update Error:', res.cartBuyerIdentityUpdate.userErrors);
    // 這裡可以選擇 throw error 或回傳 null，視您希望前端如何處理
    // 如果 Token 失效，通常建議讓前端知道以便觸發重新登入
    throw new Error(res.cartBuyerIdentityUpdate.userErrors[0].message);
  }

  return res.cartBuyerIdentityUpdate.cart;
}