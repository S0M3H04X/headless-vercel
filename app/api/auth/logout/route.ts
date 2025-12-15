import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  
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

  return NextResponse.json({ 
    status: 'success', 
    message: 'Session cleared' 
  });
}