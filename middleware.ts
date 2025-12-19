import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. 定義公開路徑 (Whitelist)
  // 關鍵修正：必須包含 path === '/'，否則會導致首頁無限重導向
  const isPublicPath = 
    path === '/' ||                        // [关键] 允許加載 PWA Shell
    path.startsWith('/_next') ||           // Next.js 系統資源
    path.startsWith('/assets') ||          // 公開靜態資源 (非受保護部分)
    path.startsWith('/favicon.ico') ||
    path.startsWith('/api/auth') ||        // 登入/登出/Callback 流程
    path === '/api/shopify/query' ||
    path.includes('pdf.worker.min');         // BFF 查詢 (由 BFF 內部處理權限)

  // 如果是公開路徑，直接放行
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. 檢查身分憑證
  // 注意：請確認這裡的 Cookie 名稱與 login/route.ts 設定的一致
  // 通常建議使用 'shopify_customer_access_token'
  const token = request.cookies.get('shopify_customer_access_token')?.value;

  // 3. 未登入攔截邏輯
  if (!token) {
    // Case A: API 請求 -> 回傳 401 JSON
    if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Session expired' }, 
          { status: 401 }
        );
    }

    // Case B: 受保護的靜態資源 (PDF/MP4) -> 回傳 403 禁止訪問
    // 這裡不建議 Redirect，因為瀏覽器對資源檔的 Redirect 處理不一定會顯示登入頁
    if (path.startsWith('/assets/pdf') || path.startsWith('/assets/mp4')) {
        return new NextResponse('Access Denied: Please login via Desktop.', {
            status: 403,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    // Case C: 其他頁面路由 -> 導回首頁 (讓 Desktop UI 處理登入)
    // 這裡導向 '/' 是安全的，因為 '/' 已經在 isPublicPath 中
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. 已登入 -> 放行
  return NextResponse.next();
}

// 設定 Matcher：攔截所有路徑，除了 Next.js 靜態資源
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};