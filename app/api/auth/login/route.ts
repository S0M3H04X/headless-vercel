// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { shopifyFetch } from '@/lib/shopify'; // 使用既有的 Storefront Client

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

    const response = await shopifyFetch<any>({
      query,
      variables: { input: { email, password } },
      cache: 'no-store'
    });

    const tokenData = response?.customerAccessTokenCreate?.customerAccessToken;
    const errors = response?.customerAccessTokenCreate?.userErrors;

    if (errors && errors.length > 0) {
      return NextResponse.json({ error: 'Invalid Access Key' }, { status: 401 });
    }

    if (!tokenData?.accessToken) {
      return NextResponse.json({ error: 'Login failed' }, { status: 500 });
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