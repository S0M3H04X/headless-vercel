// app/api/debug/admin/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const ADMIN_URL = process.env.SHOPIFY_ADMIN_API_URL;
  const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!ADMIN_URL || !ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Missing Environment Variables' }, { status: 500 });
  }

  try {
    // 查詢 CustomerInput 的欄位定義
    const query = `
      query InspectSchema {
        __type(name: "CustomerInput") {
          name
          inputFields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `;

    const res = await fetch(ADMIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    const json = await res.json();
    const fields = json.data?.__type?.inputFields?.map((f: any) => f.name) || [];

    return NextResponse.json({
      url_used: ADMIN_URL, // 顯示當前使用的 URL (請檢查是否有 /admin)
      has_password_field: fields.includes('password'), // 是否支援密碼
      available_fields: fields, // 列出所有支援的欄位
      raw_response: json
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}