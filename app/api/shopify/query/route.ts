import { NextResponse } from 'next/server';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-10';
const shopId = process.env.SHOPIFY_SHOP_ID;

/**
 * [Discovery Pattern]
 * 動態獲取 Customer Account API 的 GraphQL 端點
 * 文檔來源: Customer Account API reference -> Discovery endpoints
 */
async function getCustomerAccountEndpoint(shopDomain: string): Promise<string | null> {
  // 1. 確保網域格式乾淨
  const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const discoveryUrl = `https://${cleanDomain}/.well-known/customer-account-api`;
  
  console.log(`[Discovery] Fetching config from: ${discoveryUrl}`);

  try {
    const response = await fetch(discoveryUrl, { 
      next: { revalidate: 3600 },
      method: 'GET',
      headers: { 'User-Agent': 'NextJS-BFF' }
    });
    
    if (!response.ok) {
      console.warn(`[Discovery] Failed with status: ${response.status}`);
      return null;
    }

    const config = await response.json();
    console.log(`[Discovery] Config received:`, config); // [除錯] 查看回傳了什麼

    // 2. 驗證回傳值
    if (config && config.graphql_api) {
      return config.graphql_api;
    }
    return null;
  } catch (error) {
    console.error('[Discovery Error]', error);
    return null;
  }
}

export async function POST(req: Request) {
  // 1. 基礎環境變數檢查
  if (!domain || !storefrontAccessToken) {
    return NextResponse.json(
      { error: 'Server Config Error: Missing Shopify Credentials' }, 
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { query, variables, customerAccessToken, apiType = 'storefront' } = body;

    let endpoint: string | null = null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 2. 路由分流 (Routing)
    if (apiType === 'customer') {
      // --- Customer Account API ---

      // [除錯關鍵] 印出 Token 的前綴，確認 BFF 到底收到了什麼
      // 若顯示 undefined 或非 shcat_ 開頭，則問題在前端
      const tokenPreview = customerAccessToken 
        ? `${customerAccessToken.substring(0, 10)}...` 
        : 'UNDEFINED/NULL';
      console.log(`[BFF Debug] Received Customer Token: ${tokenPreview}`);
      
      // A. 嘗試動態發現
      endpoint = await getCustomerAccountEndpoint(domain);
      
      // B. Fallback 機制 (若發現失敗且有設定 Shop ID)
      if (!endpoint && shopId) {
        console.warn('[Discovery] Falling back to manual URL construction');
        endpoint = `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`;
      }

      // C. 若仍無 Endpoint，則報錯
      if (!endpoint) {
        return NextResponse.json({ error: 'Configuration Error: No Endpoint' }, { status: 500 });
      }
      
      // [修正 2] 確保 Token 存在才加入 Header，且格式正確
      if (customerAccessToken) {
        headers['Authorization'] = customerAccessToken; // 嘗試 1: 直接傳送 (部分文件建議)
        // headers['Authorization'] = `Bearer ${customerAccessToken}`; // 嘗試 2: 標準 OAuth
      }

      
      console.log(`[BFF] Final Endpoint -> ${endpoint}`);

    } else {
      // --- Storefront API ---
      endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
      headers['X-Shopify-Storefront-Access-Token'] = storefrontAccessToken;
    }

    // 3. 轉發請求 (Proxy Request)
    // [修正] 這裡 endpoint 已經保證不為 undefined/null，否則上面已 return
    const result = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });

    const text = await result.text();
    let json;
    
    // 嘗試解析 JSON
    try {
      json = JSON.parse(text);
      if (json.errors) {
        console.warn('[Shopify API Error]', json.errors);
        return NextResponse.json(json);
      }
      return NextResponse.json(json);
    } catch (e) {
      console.error('[BFF] Non-JSON Response from Shopify:', text.substring(0, 200));
      return NextResponse.json(
        { error: `Upstream Error: Received invalid response (${result.status})` },
        { status: 502 }
      );
    }

    if (json.errors) {
      console.warn('[Shopify API Error]', json.errors);
      return NextResponse.json(json);
    }

    return NextResponse.json(json);

  } catch (error: any) {
    console.error('[BFF Critical]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}