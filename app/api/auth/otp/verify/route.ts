// app/api/auth/otp/verify/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    const now = Math.floor(Date.now() / 1000);

    // 1. 查詢 DB
    const result = await db.execute({
      sql: 'SELECT * FROM otp_sessions WHERE email = ?',
      args: [email]
    });

    const session = result.rows[0] as unknown as { code: string, expires_at: number };

    // 2. 驗證邏輯
    if (!session) {
      return NextResponse.json({ error: 'Session not found. Please request OTP first.' }, { status: 400 });
    }

    if (session.code !== code) {
       return NextResponse.json({ error: 'Invalid code.' }, { status: 401 });
    }

    if (now > session.expires_at) {
        return NextResponse.json({ error: 'Code expired.' }, { status: 401 });
    }

    // 3. 驗證成功：清除 OTP
    await db.execute({
        sql: 'DELETE FROM otp_sessions WHERE email = ?',
        args: [email]
    });

    // 4. [Critical] 建立 Session
    // 這裡我們暫時模擬一個 Shopify Access Token。
    // 在真實 Shopify Plus 場景中，這裡會呼叫 multipass create 或 exchange token
    const mockAccessToken = `shpat_${Buffer.from(email).toString('base64')}_mock_token`;

    const cookieStore = cookies();
    cookieStore.set('shopify_access_token', mockAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return NextResponse.json({ success: true, user: { email } });

  } catch (e) {
    console.error('[OTP Verify Error]', e);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}