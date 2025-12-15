import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  
  // 1. 取得 ID Token (這是 Shopify 登出端點需要的 hint)
  // const idToken = cookieStore.get('shopify_id_token')?.value;
  // const shopAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;
  // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // 定義要刪除的 Cookie 名稱列表
  const cookiesToDelete = [
    'shopify_access_token',
    'shopify_refresh_token',
    'shopify_id_token'
  ];

  // 強制刪除策略：設定內容為空，且立即過期
  cookiesToDelete.forEach((cookieName) => {
    // 嘗試標準刪除
    cookieStore.delete(cookieName);
    
    // [雙重保險] 強制覆蓋為立即過期
    // 注意：必須與當初 Set 時的 path 一致 ('/')
    cookieStore.set(cookieName, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0), // 設定為 1970 年，確保過期
    });
  });

  // 3. 建構 Shopify 登出網址
  // if (shopAuthUrl && idToken && baseUrl) {
  //   const logoutUrl = new URL(`${shopAuthUrl}/logout`);
  //   logoutUrl.searchParams.append('id_token_hint', idToken);
  //   // 登出後跳轉回我們的首頁
  //   logoutUrl.searchParams.append('post_logout_redirect_uri', baseUrl);
    
  //   return NextResponse.redirect(logoutUrl.toString());
  // }

  return NextResponse.json({ 
    status: 'success', 
    message: 'Session cleared' 
  });
}