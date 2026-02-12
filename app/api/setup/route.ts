// app/api/setup/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 建立 otp_sessions 表格
    await db.execute(`
      CREATE TABLE IF NOT EXISTS otp_sessions (
        email TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      );
    `);

    // 建立 member_avatars 表格
    await db.execute(`
      CREATE TABLE IF NOT EXISTS member_avatars (
        email TEXT PRIMARY KEY,
        avatar_seed TEXT NOT NULL,
        updated_at INTEGER
      );
    `);

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully (otp_sessions, member_avatars created).'
    });

  } catch (error: any) {
    console.error('[Setup Error]', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}