import { verifyAdminPassword, createToken } from '../../src/server/auth';

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
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Gunakan POST untuk endpoint login.',
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

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password atau PIN admin wajib diisi.',
      });
    }

    const isMatch = verifyAdminPassword(password);

    if (!isMatch) {
      await new Promise((resolve) => setTimeout(resolve, 200));
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
    });
  }
}
