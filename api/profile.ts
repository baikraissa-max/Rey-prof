import {
  ProfileData,
  initialProfileData,
  getStoredProfile,
  saveStoredProfile,
  resetStoredProfile,
  logStorageDiagnostics,
  normalizeProfileData,
} from './_lib/profileStore';
import { verifyToken, extractToken } from './_lib/auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

/**
 * Safely parses request body across Vercel serverless, Express, and raw Node.js streams.
 * Includes a 2-second timeout and readableEnded check so it NEVER hangs indefinitely.
 */
async function parseRequestBody(req: any): Promise<any> {
  // 1. If body is already parsed by Vercel or Express middleware
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

  // 2. If the stream has already been consumed or ended, do not hang
  if (req.readableEnded || req.complete || req.destroyed) {
    return null;
  }

  // 3. Fallback: Read incoming stream with strict safety timeout
  return new Promise((resolve) => {
    let raw = '';
    let isSettled = false;

    const safetyTimer = setTimeout(() => {
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
      // Guard against payloads larger than 12MB
      if (raw.length > 12 * 1024 * 1024) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(safetyTimer);
          resolve(null);
        }
      }
    });

    req.on('end', () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(safetyTimer);
        try {
          resolve(raw.trim() ? JSON.parse(raw) : null);
        } catch {
          resolve(null);
        }
      }
    });

    req.on('error', (err: any) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(safetyTimer);
        console.warn('[API Profile Stream Warning]:', err?.message || err);
        resolve(null);
      }
    });
  });
}

function sanitizeProfileData(input: any): ProfileData {
  const safeName =
    typeof input.name === 'string' && input.name.trim().length > 0
      ? input.name.trim()
      : initialProfileData.name;

  return {
    name: safeName,
    username: typeof input.username === 'string' ? input.username.trim() : initialProfileData.username,
    title: typeof input.title === 'string' ? input.title.trim() : initialProfileData.title,
    bio: typeof input.bio === 'string' ? input.bio.trim() : initialProfileData.bio,
    avatarUrl:
      typeof input.avatarUrl === 'string' && input.avatarUrl.trim().length > 0
        ? input.avatarUrl.trim()
        : initialProfileData.avatarUrl,
    status: typeof input.status === 'string' ? input.status.trim() : initialProfileData.status,
    isAvailable: typeof input.isAvailable === 'boolean' ? input.isAvailable : Boolean(input.isAvailable),
    announcement: input.announcement
      ? {
          enabled: Boolean(input.announcement.enabled),
          text: typeof input.announcement.text === 'string' ? input.announcement.text : '',
          link: typeof input.announcement.link === 'string' ? input.announcement.link : undefined,
        }
      : initialProfileData.announcement,
    about: {
      heading: input.about?.heading || initialProfileData.about.heading,
      paragraphs: Array.isArray(input.about?.paragraphs)
        ? input.about.paragraphs
        : [input.about?.paragraphs || ''].filter(Boolean),
      quote: typeof input.about?.quote === 'string' ? input.about.quote : initialProfileData.about.quote,
    },
    interests: Array.isArray(input.interests) ? input.interests : initialProfileData.interests,
    skills: Array.isArray(input.skills) ? input.skills : initialProfileData.skills,
    currentlyDoing:
      typeof input.currentlyDoing === 'string' ? input.currentlyDoing : initialProfileData.currentlyDoing,
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
  // Wrap entire handler in top-level try/catch to absolutely prevent FUNCTION_INVOCATION_FAILED
  try {
    res.setHeader('Content-Type', 'application/json');

    // Anti-caching headers for real-time consistency across all devices
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Handle preflight OPTIONS
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).end();
    }

    // Diagnostic logging in Vercel Runtime Logs (safe, no secrets exposed)
    const token = extractToken(req);
    console.log(
      `[API Profile ${new Date().toISOString()}] ${req.method} ${req.url} - Auth Present: ${Boolean(token)}`
    );

    // GET: Public read profile
    if (req.method === 'GET') {
      try {
        const profile = await getStoredProfile();
        return res.status(200).json(profile);
      } catch (err: any) {
        console.error('[API Profile GET Warning]:', err?.message || err);
        return res.status(200).json(initialProfileData);
      }
    }

    // PUT or POST: Update Profile (Admin Only)
    if (req.method === 'PUT' || (req.method === 'POST' && req.query?.action !== 'reset')) {
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

        const formatted = normalizeProfileData(body);

        logStorageDiagnostics();
        await saveStoredProfile(formatted);

        console.log(`[API Profile] Save successful for "${formatted.name}"`);

        return res.status(200).json({
          success: true,
          message: 'Profil Rey berhasil diperbarui dan disimpan.',
          profile: formatted,
        });
      } catch (saveErr: any) {
        console.error('[API Profile Save Error]:', saveErr);
        return res.status(500).json({
          success: false,
          message: `Terjadi kendala saat menyimpan data: ${saveErr?.message || 'Kesalahan penyimpanan'}`,
        });
      }
    }

    // POST (with reset) or DELETE: Reset Profile (Admin Only)
    if (req.method === 'DELETE' || (req.method === 'POST' && req.query?.action === 'reset')) {
      if (!token || !verifyToken(token)) {
        return res.status(401).json({
          success: false,
          message: 'Akses ditolak. Token tidak valid atau sesi admin telah berakhir.',
        });
      }

      try {
        const profile = await resetStoredProfile();
        console.log('[API Profile] Reset to defaults successful');
        return res.status(200).json({
          success: true,
          message: 'Profil berhasil direset ke pengaturan awal.',
          profile,
        });
      } catch (resetErr: any) {
        console.error('[API Profile Reset Error]:', resetErr);
        return res.status(500).json({
          success: false,
          message: resetErr?.message || 'Gagal mereset profil.',
        });
      }
    }

    res.setHeader('Allow', 'GET, PUT, POST, DELETE, OPTIONS');
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Gunakan GET untuk melihat atau PUT/POST untuk menyimpan.',
    });
  } catch (fatalErr: any) {
    console.error('[CRITICAL UNCAUGHT SERVERLESS ERROR in api/profile]:', fatalErr);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: `Terjadi kendala server: ${fatalErr?.message || 'Internal Server Error'}`,
      });
    }
  }
}
