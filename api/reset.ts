import { verifyToken, extractToken } from '../src/server/auth';
import { resetStoredProfile } from '../src/server/profileStore';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

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
    const defaultProfile = await resetStoredProfile();

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil direset ke pengaturan awal.',
      profile: defaultProfile,
    });
  } catch (err: any) {
    console.error('[API Profile Reset Error]:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Gagal mereset profil.',
    });
  }
}

