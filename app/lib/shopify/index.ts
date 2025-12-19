// app/lib/shopify/index.ts

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

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orders: {
    edges: Array<{
      node: Order;
    }>;
  };
}

// --- Customer Operations ---

// app/lib/shopify/index.ts

export async function getCustomer(customerAccessToken: string): Promise<Customer | null> {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        orders(first: 10, reverse: true) {
          edges {
            node {
              id
              orderNumber
              financialStatus
              currentTotalPrice {
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
              # [修正] successfulFulfillments 是 List，不是 Connection
              successfulFulfillments {
                 trackingInfo {
                    number
                    url
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
    variables: { customerAccessToken },
    customerAccessToken, 
    apiType: 'storefront', 
    cache: 'no-store'
  });

  const rawCustomer = response.customer;
  if (!rawCustomer) return null;

  return {
    ...rawCustomer,
    email: rawCustomer.email, 
    orders: {
      edges: rawCustomer.orders.edges.map((edge: any) => ({
        node: {
          ...edge.node,
          // [修正] 資料結構轉換邏輯：檢查陣列長度
          fulfillmentStatus: (edge.node.successfulFulfillments && edge.node.successfulFulfillments.length > 0) 
            ? 'FULFILLED' 
            : 'UNFULFILLED',
          statusUrl: edge.node.successfulFulfillments?.[0]?.trackingInfo?.[0]?.url || ''
        }
      }))
    }
  };
}