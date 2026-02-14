// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('shopify_access_token')?.value;

  // 1. 檢查 Token 是否存在
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // 2. [Fix] 支援 OS Native Token (Mock Token)
  // 這是 Option A 的核心：只要持有我們發的 os_session_ Key，就是有效會員
  if (token.startsWith('os_session_')) {
    // 解析 Email (Token 格式: os_session_BASE64EMAIL_TIMESTAMP)
    try {
      const parts = token.split('_');
      const email = Buffer.from(parts[2], 'base64').toString('utf-8');

      // Determine Tier logic
      // Future: Fetch from DB or Shopify Tags
      // For now: Default = Member, Specific Email = Admin
      let tier = 'member';
      if (email === 'admin@1313.io') tier = 'admin';
      // if (await checkProToken(email)) tier = 'pro';

      return NextResponse.json({
        authenticated: true,
        user: {
          email: email,
          tier: tier
        }
      });
    } catch (e) {
      // Token 格式損毀
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  }

  // 3. (Legacy) 支援舊版 Shopify Token (如果未來切換回 Option B)
  // 如果不是 os_session 開頭，這裡可以保留原本驗證邏輯，或直接視為有效
  return NextResponse.json({
    authenticated: true,
    user: {
      email: 'shopify_user@example.com',
      tier: 'member'
    }
  });
}