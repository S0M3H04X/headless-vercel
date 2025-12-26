// app/api/auth/key/request/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // 沿用之前的 Turso DB 設定
import { EmailService } from '@/lib/services/emailService';
import { ShopifyAdmin } from '@/lib/shopify/admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // 1. Rate Limiting (使用 Turso 防止濫發郵件)
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
      sql: 'SELECT * FROM otp_sessions WHERE email = ?',
      args: [email]
    });
    const existing = result.rows[0] as any;

    if (existing && (now - existing.created_at < 300)) {
        return NextResponse.json({ error: 'Please wait 5 minutes before requesting a new key.' }, { status: 429 });
    }

    // 2. 生成 Access Key (6位數)
    const accessKey = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. 同步至 Shopify (Create or Update)
    let customer = await ShopifyAdmin.findCustomerByEmail(email);
    
    if (!customer) {
        // New User
        const createRes = await ShopifyAdmin.createCustomer(email, accessKey);
        if (createRes?.userErrors?.length > 0) throw new Error(createRes.userErrors[0].message);
    } else {
        // Existing User - Force Reset Password
        const updateRes = await ShopifyAdmin.updateCustomerPassword(customer.id, accessKey);
        if (updateRes?.userErrors?.length > 0) throw new Error(updateRes.userErrors[0].message);
    }

    // 4. 發送郵件
    const emailSent = await EmailService.sendAccessKey(email, accessKey);
    if (!emailSent) throw new Error('Failed to send email via Resend');

    // 5. 記錄 Rate Limit (Upsert)
    if (existing) {
        await db.execute({ sql: 'UPDATE otp_sessions SET created_at = ? WHERE email = ?', args: [now, email] });
    } else {
        await db.execute({ sql: 'INSERT INTO otp_sessions (email, code, attempts, expires_at) VALUES (?, "000000", 0, 0)', args: [email] });
    }

    return NextResponse.json({ success: true, message: 'Access Key sent' });

  } catch (e: any) {
    console.error('[Key Request Error]', e);
    return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
  }
}