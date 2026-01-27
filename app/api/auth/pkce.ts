import crypto from 'crypto';

// 產生隨機字串 (Code Verifier)
export function generateCodeVerifier(length = 64): string {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 對 Verifier 進行 SHA-256 雜湊 (Code Challenge)
export function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 產生隨機 State (防止 CSRF)
export function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}