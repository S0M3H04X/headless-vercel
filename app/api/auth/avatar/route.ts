// app/api/auth/avatar/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const TABLE_NAME = 'member_avatars';

export const dynamic = 'force-dynamic';


// Helper: extract email from session cookie
function getEmailFromToken(token: string): string | null {
  if (token.startsWith('os_session_')) {
    try {
      const parts = token.split('_');
      return Buffer.from(parts[2], 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }
  return 'shopify_user@example.com';
}

async function ensureTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      email TEXT PRIMARY KEY,
      avatar_seed TEXT NOT NULL,
      updated_at INTEGER
    )
  `);
}

// GET /api/auth/avatar — Fetch the user's stored avatar seed
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('shopify_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = getEmailFromToken(token);
    if (!email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    await ensureTable();

    const rs = await db.execute({
      sql: `SELECT avatar_seed FROM ${TABLE_NAME} WHERE email = ?`,
      args: [email]
    });

    if (rs.rows.length === 0) {
      return NextResponse.json({ avatarSeed: null });
    }

    return NextResponse.json({ avatarSeed: rs.rows[0].avatar_seed as string });
  } catch (error) {
    console.error('[API] Get avatar failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/auth/avatar — Upsert the user's avatar seed
export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('shopify_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = getEmailFromToken(token);
    if (!email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const body = await request.json();
    const { avatarSeed } = body;

    if (!avatarSeed || typeof avatarSeed !== 'string') {
      return NextResponse.json({ error: 'avatarSeed is required' }, { status: 400 });
    }

    await ensureTable();

    await db.execute({
      sql: `INSERT INTO ${TABLE_NAME} (email, avatar_seed, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET avatar_seed = excluded.avatar_seed, updated_at = excluded.updated_at`,
      args: [email, avatarSeed, Date.now()]
    });

    return NextResponse.json({ success: true, avatarSeed });
  } catch (error) {
    console.error('[API] Save avatar failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
