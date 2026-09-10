import crypto from 'crypto';
import {
  ProfileData,
  initialProfileData,
  getStoredProfile,
  saveStoredProfile,
  resetStoredProfile,
} from '../src/server/profileStore';

function getAdminPassword(): string | null {
  const pwd = process.env.ADMIN_PASWORD_REY || process.env.admin_pasword_rey;
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

async function parseRequestBody(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return null;
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return JSON.parse(req.body.toString('utf-8'));
      } catch {
        return null;
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  // Anti-caching headers for real-time consistency across all devices
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // GET: Public read profile
  if (req.method === 'GET') {
    try {
      const profile = await getStoredProfile();
      return res.status(200).json(profile);
    } catch (err: any) {
      console.error('[API Profile GET Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Gagal memuat profil.',
        error: err?.message || 'Internal Server Error',
      });
    }
  }

  // PUT: Update Profile (Admin Only)
  if (req.method === 'PUT') {
    const token = extractToken(req);

    if (!token || !verifyToken(token)) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak valid atau sesi admin telah berakhir.',
      });
    }

    try {
      const body = await parseRequestBody(req);
      if (!body || typeof body !== 'object' || !body.name) {
        return res.status(400).json({
          success: false,
          message: 'Format data profil tidak valid atau tidak lengkap.',
        });
      }

      const formatted: ProfileData = {
        ...body,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      await saveStoredProfile(formatted);

      return res.status(200).json({
        success: true,
        message: 'Profil Rey berhasil diperbarui.',
        profile: formatted,
      });
    } catch (err: any) {
      console.error('[API Profile PUT Error]:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Gagal menyimpan pembaruan profil.',
      });
    }
  }

  // POST (with reset) or DELETE: Reset Profile (Admin Only)
  if (req.method === 'DELETE' || (req.method === 'POST' && req.query?.action === 'reset')) {
    const token = extractToken(req);

    if (!token || !verifyToken(token)) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak valid atau sesi admin telah berakhir.',
      });
    }

    try {
      const profile = await resetStoredProfile();
      return res.status(200).json({
        success: true,
        message: 'Profil berhasil direset ke pengaturan awal.',
        profile,
      });
    } catch (err: any) {
      console.error('[API Profile Reset Error]:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Gagal mereset profil.',
      });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE, POST');
  return res.status(405).json({
    success: false,
    message: 'Method Not Allowed. Gunakan GET atau PUT.',
  });
}
