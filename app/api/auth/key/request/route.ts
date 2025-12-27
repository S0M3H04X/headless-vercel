// app/api/auth/key/request/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { EmailService } from '@/lib/services/emailService';
import { ShopifyAdmin } from '@/lib/shopify/admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // 1. Rate Limiting (5分鐘冷卻)
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
      sql: 'SELECT * FROM otp_sessions WHERE email = ?',
      args: [email]
    });
    const existing = result.rows[0] as any;

    if (existing && (now - existing.created_at < 300)) {
        // 如果是開發測試，您可以暫時註解掉下面這行
        return NextResponse.json({ error: 'Please wait 5 minutes before requesting a new key.' }, { status: 429 });
    }

    // 2. 生成 Access Key (8位數，增強安全性)
    const accessKey = Math.floor(10000000 + Math.random() * 90000000).toString();

    // 3. Shopify 同步 (Optional)
    // 嘗試在 Shopify 建立該用戶 (如果不存在)，確保他是 "Real Customer"
    // 但我們不在乎密碼了
    try {
        const customer = await ShopifyAdmin.findCustomerByEmail(email);
        if (!customer) {
            await ShopifyAdmin.createCustomer(email);
        }
    } catch (shopifyErr) {
        console.warn('[Shopify Sync Warn]', shopifyErr);
        // 忽略 Shopify 錯誤，讓 OS 登入流程繼續 (Fallback)
    }

    // 4. 發送郵件
    const emailSent = await EmailService.sendAccessKey(email, accessKey);
    if (!emailSent) throw new Error('Failed to send email via Resend');

    // 5. 存入 DB (作為驗證真理)
    // 使用 UPSERT 邏輯：如果存在就更新 Code，不存在就插入
    if (existing) {
        await db.execute({ 
            sql: 'UPDATE otp_sessions SET code = ?, created_at = ?, attempts = 0 WHERE email = ?', 
            args: [accessKey, now, email] 
        });
    } else {
        await db.execute({ 
            sql: 'INSERT INTO otp_sessions (email, code, attempts, expires_at, created_at) VALUES (?, ?, 0, ?, ?)', 
            args: [email, accessKey, now + 900, now] // 15分鐘過期
        });
    }

    return NextResponse.json({ success: true, message: 'Access Key sent' });

  } catch (e: any) {
    console.error('[Key Request Error]', e);
    return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
  }
}