import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const KV_KEY = 'rey_profile_v1';

function getKvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && url.startsWith('http')) {
    return { url: url.replace(/\/$/, ''), token };
  }
  return null;
}

function getLocalFilePath(): string {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'profile.json');
  }
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {}
  }
  return path.join(dataDir, 'profile.json');
}

function getAdminPassword(): string | null {
  const pwd =
    process.env.ADMIN_PASWORD_REY ||
    process.env.admin_pasword_rey;
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
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return false;
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
    if (match) return decodeURIComponent(match[1]);
  }

  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Gunakan POST untuk reset profil.',
    });
  }

  const token = extractToken(req);

  if (!token || !verifyToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak valid atau sesi admin telah berakhir.',
    });
  }

  try {
    const kv = getKvConfig();
    if (kv) {
      try {
        await fetch(`${kv.url}/del/${KV_KEY}`, {
          headers: { Authorization: `Bearer ${kv.token}` },
        });
      } catch (err) {
        console.error('[KV Store] Error deleting KV key:', err);
      }
    }

    try {
      const filePath = getLocalFilePath();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.warn('[File Store] Error deleting local file on reset:', err);
    }

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil direset ke pengaturan awal.',
    });
  } catch (err: any) {
    console.error('[API Profile Reset Error]:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Gagal mereset profil.',
    });
  }
}
