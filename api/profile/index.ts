import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractToken, verifyToken } from '../_lib/auth.ts';
import { getStoredProfile, saveStoredProfile } from '../_lib/profileStore.ts';
import { ProfileData } from '../../src/types.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: Read Profile (Public)
  if (req.method === 'GET') {
    try {
      const profile = await getStoredProfile();
      // Cache-Control: s-maxage=0 to ensure fresh updates
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json(profile);
    } catch (err) {
      console.error('[API Profile GET] Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Gagal memuat profil.',
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

    let updatedData = req.body;
    if (typeof updatedData === 'string') {
      try {
        updatedData = JSON.parse(updatedData);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Format data JSON tidak valid.',
        });
      }
    }

    if (!updatedData || !updatedData.name) {
      return res.status(400).json({
        success: false,
        message: 'Data profil tidak lengkap atau tidak valid.',
      });
    }

    try {
      const formatted: ProfileData = {
        ...updatedData,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      await saveStoredProfile(formatted);

      return res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        profile: formatted,
      });
    } catch (err: any) {
      console.error('[API Profile PUT] Error:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Gagal menyimpan perubahan profil ke server.',
      });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} tidak diizinkan. Gunakan GET atau PUT.`,
  });
}
