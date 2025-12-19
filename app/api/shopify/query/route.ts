import { NextResponse } from 'next/server';

// 定義環境變數介面 (確保型別安全)
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-01';

export async function POST(req: Request) {

  if (!domain || !storefrontAccessToken) {
    return NextResponse.json(
      { error: 'Missing Shopify credentials on server' }, 
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { query, variables, customerAccessToken } = body;

    const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    };

    // 如果前端傳來了 Customer Token，則附加到 Header 或 Variables
    // 注意：Storefront API 通常不需要將 Token 放在 Header (除非是 Customer Account API)
    // 這裡保留彈性，若您的 Query 需要它作為 Header，可在此處理
    if (customerAccessToken) {
        // 部分舊版實作或特定 Query 可能需要
        // headers['X-Shopify-Customer-Access-Token'] = customerAccessToken;
    }

    const result = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      cache: 'no-store', // BFF 不快取，避免資料過期 (可改用 next/cache 優化)
    });

    const json = await result.json();

    if (json.errors) {
      console.error('[Shopify BFF Error]', json.errors);
      // 回傳 200 但帶有錯誤訊息，讓前端 handle
      return NextResponse.json(json); 
    }

    return NextResponse.json(json);

  } catch (error) {
    console.error('[Shopify BFF Critical]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}