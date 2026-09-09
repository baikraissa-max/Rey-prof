import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractToken, verifyToken } from '../_lib/auth.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      valid: false,
      message: 'Method Not Allowed.',
    });
  }

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
}
