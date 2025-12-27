// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. 定義公開路徑 (Whitelist)
  const isPublicPath = 
    path === '/' ||                        
    path.startsWith('/_next') ||           
    path.startsWith('/assets') ||          
    path.startsWith('/favicon.ico') ||
    path.startsWith('/api/auth') ||        // [重要] 涵蓋 /api/auth/key/request
    path === '/api/shopify/query' ||
    path.includes('pdf.worker.min') ||
    path === '/api/os/boot' ||
    path.startsWith('/api/debug') ||
    path === '/api/setup';                 // [新增] 允許執行資料庫初始化

  // 如果是公開路徑，直接放行
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. 檢查身分憑證
  // [修正] 名稱需與 login route 設定的一致 ('shopify_access_token')
  const token = request.cookies.get('shopify_access_token')?.value;

  // 3. 未登入攔截邏輯
  if (!token) {
    // Case A: API 請求 -> 回傳 401 JSON
    if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Session expired' }, 
          { status: 401 }
        );
    }

    // Case B: 受保護的靜態資源
    if (path.startsWith('/assets/pdf') || path.startsWith('/assets/mp4')) {
        return new NextResponse('Access Denied: Please login via Desktop.', {
            status: 403,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    // Case C: 其他頁面 -> 導回首頁
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. 已登入 -> 放行
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};