import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/api/auth/pkce';

export async function GET() {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const shopAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL; // 例如: https://shopify.com/<shop_id>/auth
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !shopAuthUrl || !baseUrl) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  // 1. 生成 PKCE 參數
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  // 2. 將 Verifier 與 State 存入 HttpOnly Cookie (安全關鍵！)
  // 這些 Cookie 必須在 Callback 時取出驗證
  const cookieStore = cookies();
  
  cookieStore.set('shopify_auth_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // 本地開發若用 Tunnel 也是 HTTPS，所以通常設 true
    sameSite: 'lax',
    path: '/',
    maxAge: 300, // 5分鐘內必須完成登入
  });

  cookieStore.set('shopify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  });

  // 3. 建構 Shopify OAuth URL
  const redirectUri = `${baseUrl}/api/auth/callback`;
  const scope = 'openid email customer-account-api:full';

  const authUrl = new URL(`${shopAuthUrl}/oauth/authorize`);
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');

  // 4. 重導向
  return NextResponse.redirect(authUrl.toString());
}