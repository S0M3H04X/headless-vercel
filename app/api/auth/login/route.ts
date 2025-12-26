// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import { shopifyFetch } from '@/lib/shopify'; // 使用既有的 Storefront Client
import { shopifyStorefrontFetch } from '@/lib/shopify/storefront';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json(); // password 在這裡是 Access Key

    // 1. 呼叫 Storefront API 換 Token
    const query = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // [修正] 使用 shopifyStorefrontFetch 直接對話 Shopify
    const data = await shopifyStorefrontFetch<any>({
      query,
      variables: { input: { email, password } },
    });

    const tokenData = data?.customerAccessTokenCreate?.customerAccessToken;
    const errors = data?.customerAccessTokenCreate?.userErrors;

    // 錯誤處理：密碼錯誤或 API 拒絕
    if (errors && errors.length > 0) {
      console.error('[Login Failed] Shopify Errors:', errors);
      return NextResponse.json({ error: 'Invalid Access Key or Email' }, { status: 401 });
    }

    if (!tokenData?.accessToken) {
      console.error('[Login Failed] No Access Token returned');
      return NextResponse.json({ error: 'Login failed (No Token)' }, { status: 500 });
    }

    // 2. 寫入 HttpOnly Cookie (真實 Token!)
    const cookieStore = cookies();
    cookieStore.set('shopify_access_token', tokenData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(tokenData.expiresAt)
    });

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error('[Login Error]', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}