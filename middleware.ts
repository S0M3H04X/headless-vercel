import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 定義受保護的路徑 (Protected Routes)
  // 只有呼叫 Shopify 數據的 API 需要被攔截
  const isProtectedApi = pathname.startsWith('/api/shopify');

  // 2. 獲取 Token
  const hasToken = request.cookies.has('shopify_access_token');

  // 3. 攔截邏輯
  if (isProtectedApi && !hasToken) {
    // API 請求若無權限，回傳 401 (讓前端 Widget 處理顯示登入按鈕)
    return NextResponse.json(
      { error: 'Unauthorized', code: 'needs_login' },
      { status: 401 }
    );
  }

  // 4. 其他請求一律放行 (Pass-through)
  return NextResponse.next();
}

// 設定 Matcher 以優化效能 (排除靜態資源與 Next.js 內部請求)
export const config = {
  matcher: [
    /*
     * 匹配所有請求路徑，除了:
     * 1. /api/auth/* (登入/登出/Callback)
     * 2. /api/python/* (Python 後端)
     * 3. /_next/* (Next.js 系統檔)
     * 4. 靜態檔案 (favicon, images, etc.)
     */
    '/((?!api/auth|api/python|_next/static|_next/image|favicon.ico).*)',
  ],
};