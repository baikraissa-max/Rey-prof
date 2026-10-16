import { verifyToken, extractToken } from '../../src/server/auth';

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
      message: 'Terjadi kesalahan internal saat memverifikasi sesi admin.',
    });
  }
}
