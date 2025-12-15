import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. 定義需要受保護的路徑 (Matcher)
// 注意：Next.js 的 matcher 語法不支援變數，必須寫死字串
export const config = {
  matcher: [
    /* * 受保護的 API 路由
     * 攔截所有 /api/shopify/ 開頭的請求
     */
    '/api/shopify/:path*',

    /* * 受保護的靜態資產 (High Value Assets)
     * 攔截 PDF 與 MP4，防止未登入使用者直接下載
     */
    '/assets/pdf/:path*',
    '/assets/mp4/:path*',
  ],
};

export function middleware(request: NextRequest) {
  // 2. 檢查身分憑證
  // 讀取 HttpOnly Cookie: 'shopify_access_token'
  const accessToken = request.cookies.get('shopify_access_token');
  const isAuth = !!accessToken;

  // 3. 如果已登入，直接放行 (Pass-through)
  if (isAuth) {
    return NextResponse.next();
  }

  // 4. 如果未登入，根據請求類型回傳 401
  const path = request.nextUrl.pathname;

  // Case A: API 請求 (回傳 JSON)
  if (path.startsWith('/api/')) {
    return NextResponse.json(
      { 
        error: 'Unauthorized', 
        message: 'Valid shopify_access_token required' 
      },
      { status: 401 }
    );
  }

  // Case B: 靜態資源請求 (PDF/MP4)
  // 這裡回傳 401 純文字，瀏覽器會顯示錯誤頁面，達到「阻擋下載」的目的
  // 未來可改為 Rewrite 到一個 "Please Login" 的佔位圖片或頁面
  return new NextResponse('Access Denied: Please login to view this content.', {
    status: 401,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}