import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const shopAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // 1. 驗證基本參數
  if (!code || !state || !clientId || !shopAuthUrl || !baseUrl) {
    return NextResponse.json({ error: 'Invalid request or config' }, { status: 400 });
  }

  // 2. 從 Cookie 取出 Verifier 與原 State
  const cookieStore = cookies();
  const storedVerifier = cookieStore.get('shopify_auth_verifier')?.value;
  const storedState = cookieStore.get('shopify_auth_state')?.value;

  if (!storedVerifier || !storedState || state !== storedState) {
    return NextResponse.json({ error: 'Session validation failed' }, { status: 400 });
  }

  // 3. 向 Shopify 交換 Token (PKCE Flow)
  try {
    const tokenUrl = `${shopAuthUrl}/oauth/token`;
    const redirectUri = `${baseUrl}/api/auth/callback`;

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('client_id', clientId);
    body.append('redirect_uri', redirectUri);
    body.append('code', code);
    body.append('code_verifier', storedVerifier); // 關鍵：證明我是發起人

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 注意：這裡是 Public Client，不需要 Authorization Header
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    const { access_token, id_token, refresh_token, expires_in } = data;

    // 4. 登入成功！將 Token 存入 HttpOnly Cookie
    // 注意：Access Token 通常效期很短，Refresh Token 效期較長
    cookieStore.set('shopify_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expires_in, // 跟隨 API 回傳的過期時間
    });

    // 2. [新增] 存入 Refresh Token (長期)
    // 雖然 API 可能沒回傳 refresh_token 的 expires_in，但通常較長，我們設為 30 天
    if (refresh_token) {
        cookieStore.set('shopify_refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 天
        });
    }

    if (id_token) {
       cookieStore.set('shopify_id_token', id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expires_in,
       });
    }

    // 5. 清理暫存的 PKCE Cookie
    cookieStore.delete('shopify_auth_verifier');
    cookieStore.delete('shopify_auth_state');

    // 6. 導回桌面
    // return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.redirect(new URL('/', baseUrl));

  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}