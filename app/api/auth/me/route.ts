import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('shopify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // 可選：如果要更嚴謹，這裡可以用 accessToken 去呼叫 Shopify Customer API 獲取詳細資料
  // 目前我們先做簡單的 Token 存在性檢查
  return NextResponse.json({ 
    authenticated: true,
    // 注意：不要回傳敏感的 Access Token 給前端！
  });
}