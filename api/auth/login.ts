import { verifyAdminPassword, createToken } from '../_lib/auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

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
    if (typeof req.body === 'object') {
      return req.body;
    }
  }

  if (req.readableEnded || req.complete || req.destroyed) {
    return null;
  }

  return new Promise((resolve) => {
    let raw = '';
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try {
          resolve(raw.trim() ? JSON.parse(raw) : null);
        } catch {
          resolve(null);
        }
      }
    }, 2000);

    req.on('data', (chunk: any) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          resolve(null);
        }
      }
    });

    req.on('end', () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        try {
          resolve(raw.trim() ? JSON.parse(raw) : null);
        } catch {
          resolve(null);
        }
      }
    });

    req.on('error', () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(null);
      }
    });
  });
}

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).end();
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return res.status(405).json({
        success: false,
        message: 'Method Not Allowed. Gunakan POST untuk endpoint login.',
      });
    }

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

    console.log(`[API Auth Login] Successful admin login at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      token,
      expiresAt: exp,
      message: 'Login berhasil sebagai Admin Rey.',
    });
  } catch (err: any) {
    console.error('[API AUTH LOGIN UNCAUGHT ERROR]:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal server saat memproses login.',
      });
    }
  }
}
