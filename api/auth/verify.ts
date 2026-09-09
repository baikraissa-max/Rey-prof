import crypto from 'crypto';

function getAdminPassword(): string | null {
  const pwd =
    process.env.ADMIN_PASSWORD ||
    process.env.admin_password ||
    process.env.Admin_Password ||
    process.env.VITE_ADMIN_PASSWORD;
  if (!pwd || typeof pwd !== 'string') return null;
  const trimmed = pwd.trim().replace(/^["'](.*)["']$/, '$1');
  return trimmed.length > 0 ? trimmed : null;
}

function getServerSecret(): string {
  if (process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.trim().length > 0) {
    return process.env.ADMIN_SECRET.trim().replace(/^["'](.*)["']$/, '$1');
  }
  const pwd = getAdminPassword();
  if (pwd) {
    return crypto
      .createHmac('sha256', 'rey-profil-auth-salt-stable-v1')
      .update(pwd)
      .digest('hex');
  }
  return 'fallback-rey-profil-secret-salt-2026';
}

function verifyToken(token: string | undefined | null): boolean {
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

function extractToken(req: any): string | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers?.cookie;
  if (typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/rey_admin_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      valid: false,
      message: 'Method Not Allowed.',
    });
  }

  try {
    const token = extractToken(req);

    if (token && verifyToken(token)) {
      return res.status(200).json({
        valid: true,
        success: true,
        message: 'Sesi admin aktif dan terverifikasi.',
      });
    }

    return res.status(401).json({
      valid: false,
      success: false,
      message: 'Sesi admin tidak valid atau telah berakhir. Silakan login kembali.',
    });
  } catch (err: any) {
    console.error('[API AUTH VERIFY UNCAUGHT ERROR]:', err);
    return res.status(500).json({
      valid: false,
      success: false,
      message: 'Terjadi kesalahan internal server saat memverifikasi sesi.',
      error: err?.message || 'Internal Server Error',
    });
  }
}
