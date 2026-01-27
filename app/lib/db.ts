// app/lib/db.ts
import { createClient } from '@libsql/client';

const url = process.env.STORAGE_TURSO_DATABASE_URL || 'file::memory:';
const authToken = process.env.STORAGE_TURSO_AUTH_TOKEN;

if (!process.env.TURSO_DATABASE_URL) {
  console.warn('⚠️  TURSO_DATABASE_URL is missing. Using in-memory fallback for build/dev.');
}

export const db = createClient({
  url,
  authToken,
});

export interface OtpSession {
  email: string;
  code: string;
  attempts: number;
  expires_at: number;
}