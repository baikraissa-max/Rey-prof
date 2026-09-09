import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractToken, verifyToken } from '../_lib/auth.ts';
import { resetStoredProfile } from '../_lib/profileStore.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const profile = await resetStoredProfile();
    return res.status(200).json({
      success: true,
      message: 'Profil berhasil direset ke pengaturan awal.',
      profile,
    });
  } catch (err: any) {
    console.error('[API Profile Reset] Error:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Gagal mereset profil.',
    });
  }
}
