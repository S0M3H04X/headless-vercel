import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('shopify_customer_access_token')?.value;
  const refreshToken = cookieStore.get('shopify_refresh_token')?.value;
  // 讀取 HttpOnly Cookie (名稱需與 Login Route 設定的一致)

  // 情況 A: Access Token 有效 -> 直接通過
  if (accessToken) {
    return NextResponse.json({
      authenticated: true,
      // Security Fix: Do not expose raw Access Token to frontend
      // accessToken: accessToken, 
      user: {
        name: 'Member'  // 可擴充更多用戶資訊
      }
    });
  }

  // 情況 B: Access Token 失效，但沒有 Refresh Token -> 視為未登入
  if (!refreshToken) {
    return NextResponse.json({
      authenticated: false,
      accessToken: null
    }, { status: 401 });
  }

  // 情況 C: Access Token 失效，嘗試使用 Refresh Token 交換
  try {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const shopAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;

    if (!clientId || !shopAuthUrl) {
      throw new Error("Missing env vars");
    }

    const tokenUrl = `${shopAuthUrl}/oauth/token`;
    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('client_id', clientId);
    body.append('refresh_token', refreshToken);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    const { access_token: newAccessToken, refresh_token: newRefreshToken, id_token: newIdToken, expires_in } = data;

    // 交換成功！寫入新的 Cookies
    cookieStore.set('shopify_customer_access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expires_in,
    });

    // 如果 Shopify 有回傳新的 Refresh Token (通常會)，則更新它
    if (newRefreshToken) {
      cookieStore.set('shopify_refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 Days
      });
    }

    if (newIdToken) {
      cookieStore.set('shopify_id_token', newIdToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expires_in,
      });
    }

    // 回傳成功狀態，讓前端以為一切正常
    return NextResponse.json({ authenticated: true, refreshed: true });

  } catch (error) {
    console.error("[Auth] Token refresh failed:", error);

    // 刷新失敗（例如 Refresh Token 也過期或被撤銷），必須清除所有殘留，強制登出
    cookieStore.delete('shopify_customer_access_token');
    cookieStore.delete('shopify_refresh_token');
    cookieStore.delete('shopify_id_token');

    return NextResponse.json({ authenticated: false, error: 'Session expired' }, { status: 401 });
  }
}