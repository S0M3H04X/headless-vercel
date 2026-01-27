// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json(); // password 這裡是 Access Key
    const now = Math.floor(Date.now() / 1000);

    // 1. 查詢 DB 驗證 Key
    const result = await db.execute({
      sql: 'SELECT * FROM otp_sessions WHERE email = ?',
      args: [email]
    });
    const session = result.rows[0] as any;

    if (!session) {
        return NextResponse.json({ error: 'Please request an Access Key first.' }, { status: 401 });
    }

    if (session.code !== password) {
        return NextResponse.json({ error: 'Invalid Access Key.' }, { status: 401 });
    }

    // 2. 登入成功！
    // 清除已使用的 Key (一次性使用，更安全)
    await db.execute({
        sql: 'DELETE FROM otp_sessions WHERE email = ?',
        args: [email]
    });

    // 3. 建立 OS Session (Mock Token)
    // 我們生成一個 Signed String 作為 Token，Middleware 只要看到 Cookie 存在就會放行
    const osToken = `os_session_${Buffer.from(email).toString('base64')}_${now}`;

    const cookieStore = cookies();
    cookieStore.set('shopify_access_token', osToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return NextResponse.json({ success: true, user: { email } });

  } catch (e) {
    console.error('[Login Error]', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}