// app/api/auth/otp/request/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
      sql: 'SELECT * FROM otp_sessions WHERE email = ?',
      args: [email]
    });

    const existing = result.rows[0] as unknown as { attempts: number, created_at: number };

    // Rate Limiting Logic: 5分鐘 (300秒) 內檢查
    if (existing) {
      const timeDiff = now - existing.created_at;
      if (timeDiff < 300 && existing.attempts >= 2) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait 5 minutes.' }, 
          { status: 429 }
        );
      }
      
      // 若超過 5 分鐘，重置計數
      if (timeDiff >= 300) {
         await db.execute({
            sql: 'DELETE FROM otp_sessions WHERE email = ?',
            args: [email]
         });
      }
    }

    // 生成 6 位數 OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 300; // 5分鐘後過期

    // 寫入/更新 DB (Upsert 邏輯)
    if (existing) {
        await db.execute({
            sql: 'UPDATE otp_sessions SET code = ?, attempts = attempts + 1, expires_at = ?, created_at = ? WHERE email = ?',
            args: [code, expiresAt, now, email]
        });
    } else {
        await db.execute({
            sql: 'INSERT INTO otp_sessions (email, code, attempts, expires_at) VALUES (?, ?, 1, ?)',
            args: [email, code, expiresAt]
        });
    }

    // [MOCK] 實際場景請呼叫 Shopify Customer API 或 Email Service (Resend)
    console.log(`[🔐 OTP System] Sent code to ${email}: ${code}`);

    return NextResponse.json({ success: true, message: 'OTP sent' });

  } catch (e) {
    console.error('[OTP Request Error]', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}