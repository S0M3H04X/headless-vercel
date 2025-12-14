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

  if (!storedVerifier || !storedState) {
    return NextResponse.json({ error: 'Session expired or invalid' }, { status: 400 });
  }

  if (state !== storedState) {
    return NextResponse.json({ error: 'State mismatch (CSRF warning)' }, { status: 400 });
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
      const errorText = await response.text();
      console.error('Token Exchange Failed:', errorText);
      return NextResponse.json({ error: 'Failed to exchange token', details: errorText }, { status: 500 });
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

    if (id_token) {
       cookieStore.set('shopify_id_token', id_token, {
        httpOnly: true,
        secure: true,
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