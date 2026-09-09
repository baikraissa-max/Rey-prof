import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminPassword, timingSafeMatch, createToken } from '../_lib/auth.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Gunakan POST untuk endpoint ini.',
    });
  }

  // Parse body safely
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Format request body tidak valid (harus JSON).',
      });
    }
  }

  const { password } = body || {};

  // Validate input
  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Password atau PIN admin wajib diisi.',
    });
  }

  // Check if ADMIN_PASSWORD environment variable is configured
  const configuredPassword = getAdminPassword();
  if (!configuredPassword) {
    console.error('[AUTH ERROR] ADMIN_PASSWORD is not configured in server environment variables.');
    return res.status(500).json({
      success: false,
      message: 'ADMIN_PASSWORD belum dikonfigurasi di Environment Variables Vercel / server.',
    });
  }

  // Timing-safe comparison
  const isMatch = timingSafeMatch(password.trim(), configuredPassword);

  if (!isMatch) {
    // Small artificial delay to mitigate brute-force timing attacks
    await new Promise((resolve) => setTimeout(resolve, 350));
    return res.status(401).json({
      success: false,
      message: 'Password atau PIN admin salah.',
    });
  }

  // Generate signed token with 24 hours expiry
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  const token = createToken({ role: 'admin', exp });

  return res.status(200).json({
    success: true,
    token,
    expiresAt: exp,
    message: 'Login berhasil sebagai Admin Rey.',
  });
}
