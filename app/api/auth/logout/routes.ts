import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  
  // 1. 取得 ID Token (這是 Shopify 登出端點需要的 hint)
  const idToken = cookieStore.get('shopify_id_token')?.value;
  const shopAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // 2. 清除所有相關 Cookie
  cookieStore.delete('shopify_access_token');
  cookieStore.delete('shopify_id_token');
  cookieStore.delete('shopify_refresh_token');

  // 3. 建構 Shopify 登出網址
  if (shopAuthUrl && idToken && baseUrl) {
    const logoutUrl = new URL(`${shopAuthUrl}/logout`);
    logoutUrl.searchParams.append('id_token_hint', idToken);
    // 登出後跳轉回我們的首頁
    logoutUrl.searchParams.append('post_logout_redirect_uri', baseUrl);
    
    return NextResponse.redirect(logoutUrl.toString());
  }

  // Fallback: 如果參數不足，直接導回首頁
  return NextResponse.redirect(new URL('/', request.url));
}