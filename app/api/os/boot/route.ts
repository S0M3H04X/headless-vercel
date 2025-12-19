import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bootConfig from '../../../config/boot.json'; // 直接 Import JSON

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('shopify_customer_access_token')?.value;

  // 1. 身分判斷邏輯
  let role: 'guest' | 'member' | 'admin' = 'guest';

  if (token) {
    role = 'member';
    // TODO: Phase 8 可在此呼叫 Shopify 檢查是否為 Admin (e.g. 檢查 Tags)
    // 目前若有特殊 Cookie 可視為 Admin (僅供開發測試)
    if (cookieStore.get('os_admin_mode')?.value === 'true') {
      role = 'admin';
    }
  }

  // 2. 讀取設定
  // TypeScript 可能會抱怨 JSON 索引，需強制轉型或忽略
  const config = (bootConfig as any)[role];

  // 3. 回傳
  return NextResponse.json({
    ...config,
    timestamp: Date.now() // 用於前端判斷版本
  });
}