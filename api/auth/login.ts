import crypto from 'crypto';

function getAdminPassword(): string | null {
  const pwd =
    process.env.ADMIN_PASWORD_REY ||
    process.env.admin_pasword_rey;
  if (!pwd || typeof pwd !== 'string') return null;
  // Strip quotes if user entered them in Vercel UI
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

function timingSafeMatch(input: string, target: string): boolean {
  if (!input || !target) return false;
  const bufA = Buffer.from(input.trim());
  const bufB = Buffer.from(target.trim());
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function createToken(payload: { role: string; exp: number }): string {
  const secret = getServerSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
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

  // If body is an incoming stream
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
  // Ensure standard response headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Gunakan POST untuk endpoint ini.',
    });
  }

  try {
    const body = await parseRequestBody(req);

    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Format request body tidak valid (harus JSON).',
      });
    }

    const { password } = body;

    // Validate input presence
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password atau PIN admin wajib diisi.',
      });
    }

    // Check if ADMIN_PASWORD_REY environment variable is configured
    const configuredPassword = getAdminPassword();
    if (!configuredPassword) {
      console.error('[AUTH ERROR] ADMIN_PASWORD_REY belum dikonfigurasi di Environment Variables Vercel.');
      return res.status(500).json({
        success: false,
        message: 'ADMIN_PASWORD_REY belum dikonfigurasi di Environment Variables Vercel.',
      });
    }

    // Timing-safe comparison against configured password
    const isMatch = timingSafeMatch(password, configuredPassword);

    if (!isMatch) {
      // Small artificial delay to mitigate brute-force timing attacks
      await new Promise((resolve) => setTimeout(resolve, 350));
      return res.status(401).json({
        success: false,
        message: 'Password atau PIN admin salah.',
      });
    }

    // Generate signed token valid for 24 hours
    const exp = Date.now() + 24 * 60 * 60 * 1000;
    const token = createToken({ role: 'admin', exp });

    return res.status(200).json({
      success: true,
      token,
      expiresAt: exp,
      message: 'Login berhasil sebagai Admin Rey.',
    });
  } catch (err: any) {
    console.error('[API AUTH LOGIN UNCAUGHT ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal server saat memproses login.',
      error: err?.message || 'Internal Server Error',
    });
  }
}
