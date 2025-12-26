// app/lib/db.ts
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error('Missing TURSO_DATABASE_URL environment variable');
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