import crypto from 'crypto';

/**
 * Reads the admin password strictly from server environment variables.
 * Returns null if not set or empty (NEVER falls back to hardcoded defaults).
 */
export function getAdminPassword(): string | null {
  const pwd =
    process.env.ADMIN_PASSWORD ||
    process.env.admin_password ||
    process.env.Admin_Password ||
    process.env.VITE_ADMIN_PASSWORD;
  if (!pwd || typeof pwd !== 'string') {
    return null;
  }
  const trimmed = pwd.trim().replace(/^["'](.*)["']$/, '$1');
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Returns a stable server secret for signing session tokens.
 * Prioritizes ADMIN_SECRET if provided; otherwise derives a stable hash from ADMIN_PASSWORD.
 */
export function getServerSecret(): string {
  if (process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.trim().length > 0) {
    return process.env.ADMIN_SECRET.trim();
  }

  const pwd = getAdminPassword();
  if (pwd) {
    return crypto
      .createHmac('sha256', 'rey-profil-auth-salt-stable-v1')
      .update(pwd)
      .digest('hex');
  }

  // Temporary fallback secret if neither is set (prevents crash, but tokens won't validate without ADMIN_PASSWORD)
  return 'unconfigured-secret-key-rey-profil';
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
export function timingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a.trim());
  const bufB = Buffer.from(b.trim());

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Creates a signed stateless token for the admin session (HMAC-SHA256).
 */
export function createToken(payload: { role: string; exp: number }): string {
  const secret = getServerSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies the token signature and expiration.
 */
export function verifyToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const secret = getServerSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return false;
    }
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Extracts Bearer token from HTTP request Authorization header or cookie.
 */
export function extractToken(req: any): string | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // Also check cookie if present
  const cookieHeader = req.headers?.cookie;
  if (typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/rey_admin_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}
