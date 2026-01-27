import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const TABLE_NAME = 'member_states';

// Helper to ensure table exists
async function ensureTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      email TEXT PRIMARY KEY,
      state TEXT,
      updated_at INTEGER
    )
  `);
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('shopify_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Identify user from token (Reuse logic from auth/me or centralized helper)
    // For now, simple parsing as per existing auth/me pattern
    let email = '';
    if (token.startsWith('os_session_')) {
      const parts = token.split('_');
      email = Buffer.from(parts[2], 'base64').toString('utf-8');
    } else {
      // Legacy/Default fallback
      email = 'shopify_user@example.com';
    }

    if (!email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const body = await request.json();
    const { state } = body;

    if (!state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    await ensureTable();

    await db.execute({
      sql: `INSERT INTO ${TABLE_NAME} (email, state, updated_at) VALUES (?, ?, ?) 
            ON CONFLICT(email) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`,
      args: [email, JSON.stringify(state), Date.now()]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Save state failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('shopify_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let email = '';
    if (token.startsWith('os_session_')) {
      const parts = token.split('_');
      email = Buffer.from(parts[2], 'base64').toString('utf-8');
    } else {
      email = 'shopify_user@example.com';
    }

    await ensureTable();

    const rs = await db.execute({
      sql: `SELECT state FROM ${TABLE_NAME} WHERE email = ?`,
      args: [email]
    });

    if (rs.rows.length === 0) {
      return NextResponse.json({ state: null });
    }

    const stateStr = rs.rows[0].state as string;
    const state = JSON.parse(stateStr);

    return NextResponse.json({ state });
  } catch (error) {
    console.error('[API] Get state failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
