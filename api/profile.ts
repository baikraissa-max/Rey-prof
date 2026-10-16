import {
  ProfileData,
  initialProfileData,
  getStoredProfile,
  saveStoredProfile,
  resetStoredProfile,
} from '../src/server/profileStore';
import { verifyToken, extractToken } from '../src/server/auth';

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

function sanitizeProfileData(input: any): ProfileData {
  const safeName = typeof input.name === 'string' && input.name.trim().length > 0 ? input.name.trim() : initialProfileData.name;

  return {
    name: safeName,
    username: typeof input.username === 'string' ? input.username.trim() : initialProfileData.username,
    title: typeof input.title === 'string' ? input.title.trim() : initialProfileData.title,
    bio: typeof input.bio === 'string' ? input.bio.trim() : initialProfileData.bio,
    avatarUrl: typeof input.avatarUrl === 'string' && input.avatarUrl.trim().length > 0 ? input.avatarUrl.trim() : initialProfileData.avatarUrl,
    status: typeof input.status === 'string' ? input.status.trim() : initialProfileData.status,
    isAvailable: typeof input.isAvailable === 'boolean' ? input.isAvailable : Boolean(input.isAvailable),
    announcement: input.announcement ? {
      enabled: Boolean(input.announcement.enabled),
      text: typeof input.announcement.text === 'string' ? input.announcement.text : '',
      link: typeof input.announcement.link === 'string' ? input.announcement.link : undefined,
    } : initialProfileData.announcement,
    about: {
      heading: input.about?.heading || initialProfileData.about.heading,
      paragraphs: Array.isArray(input.about?.paragraphs) ? input.about.paragraphs : [input.about?.paragraphs || ''].filter(Boolean),
      quote: typeof input.about?.quote === 'string' ? input.about.quote : initialProfileData.about.quote,
    },
    interests: Array.isArray(input.interests) ? input.interests : initialProfileData.interests,
    skills: Array.isArray(input.skills) ? input.skills : initialProfileData.skills,
    currentlyDoing: typeof input.currentlyDoing === 'string' ? input.currentlyDoing : initialProfileData.currentlyDoing,
    favoriteStack: Array.isArray(input.favoriteStack) ? input.favoriteStack : initialProfileData.favoriteStack,
    links: Array.isArray(input.links) ? input.links : initialProfileData.links,
    projects: Array.isArray(input.projects) ? input.projects : initialProfileData.projects,
    contact: {
      reyWhatsApp: input.contact?.reyWhatsApp || initialProfileData.contact.reyWhatsApp,
      parentWhatsApp: input.contact?.parentWhatsApp || initialProfileData.contact.parentWhatsApp,
      email: input.contact?.email || initialProfileData.contact.email,
      location: input.contact?.location || initialProfileData.contact.location,
      note: input.contact?.note || initialProfileData.contact.note,
    },
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  // Anti-caching headers for real-time consistency across all devices
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // GET: Public read profile
  if (req.method === 'GET') {
    try {
      const profile = await getStoredProfile();
      return res.status(200).json(profile);
    } catch (err: any) {
      console.error('[API Profile GET Error]:', err);
      return res.status(200).json(initialProfileData);
    }
  }

  // PUT or POST: Update Profile (Admin Only)
  if (req.method === 'PUT' || (req.method === 'POST' && req.query?.action !== 'reset')) {
    const token = extractToken(req);

    if (!token || !verifyToken(token)) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak valid atau sesi admin telah berakhir. Silakan login kembali.',
      });
    }

    try {
      const body = await parseRequestBody(req);
      if (!body || typeof body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Format request body tidak valid (harus JSON objek).',
        });
      }

      if (!body.name || (typeof body.name === 'string' && body.name.trim().length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Nama profil wajib diisi dan tidak boleh kosong.',
        });
      }

      const formatted = sanitizeProfileData(body);

      await saveStoredProfile(formatted);

      return res.status(200).json({
        success: true,
        message: 'Profil Rey berhasil diperbarui dan disimpan.',
        profile: formatted,
      });
    } catch (err: any) {
      console.error('[API Profile PUT Error]:', err);
      return res.status(500).json({
        success: false,
        message: `Terjadi kendala saat menyimpan data: ${err?.message || 'Kesalahan server'}`,
      });
    }
  }

  // POST (with reset) or DELETE: Reset Profile (Admin Only)
  if (req.method === 'DELETE' || (req.method === 'POST' && req.query?.action === 'reset')) {
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
      console.error('[API Profile Reset Error]:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Gagal mereset profil.',
      });
    }
  }

  res.setHeader('Allow', 'GET, PUT, POST, DELETE');
  return res.status(405).json({
    success: false,
    message: 'Method Not Allowed. Gunakan GET untuk melihat atau PUT/POST untuk menyimpan.',
  });
}
