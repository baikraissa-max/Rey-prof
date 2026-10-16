import { verifyToken, extractToken } from './_lib/auth';
import { resetStoredProfile } from './_lib/profileStore';

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).end();
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
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

    const defaultProfile = await resetStoredProfile();

    console.log(`[API Profile Reset] Successfully reset profile defaults at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil direset ke pengaturan awal.',
      profile: defaultProfile,
    });
  } catch (err: any) {
    console.error('[API Profile Reset Error]:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: err?.message || 'Gagal mereset profil.',
      });
    }
  }
}
