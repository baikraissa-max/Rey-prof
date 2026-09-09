import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface LinkItem {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'github' | 'x' | 'linkedin' | 'custom';
  label: string;
  url: string;
  username?: string;
  enabled: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  link: string;
  githubUrl?: string;
  imageUrl: string;
  featured?: boolean;
  year?: string;
}

export interface ProfileData {
  name: string;
  username: string;
  title: string;
  bio: string;
  avatarUrl: string;
  status: string;
  isAvailable: boolean;
  announcement?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  about: {
    heading: string;
    paragraphs: string[];
    quote?: string;
  };
  interests: string[];
  skills: string[];
  currentlyDoing: string;
  favoriteStack: string[];
  links: LinkItem[];
  projects: ProjectItem[];
  contact: {
    reyWhatsApp: string;
    parentWhatsApp: string;
    email: string;
    location?: string;
    note?: string;
  };
  lastUpdated?: string;
}

export const initialProfileData: ProfileData = {
  name: 'REY',
  username: '@rey',
  title: 'Digital Creator & Creative Engineer',
  bio: 'Crafting serene digital tools and tactile interfaces with high intentionality and fluid motion.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85',
  status: 'Available',
  isAvailable: true,
  announcement: {
    enabled: true,
    text: 'Building tactile web experiences & exploring liquid glass systems.',
    link: '#projects',
  },
  about: {
    heading: 'Designing with restraint & depth.',
    paragraphs: [
      'Halo, saya Rey. Seorang digital creator dan developer yang berfokus pada estetika digital modern, performa web yang cepat, dan antarmuka yang memberi rasa tenang.',
      'Saya percaya bahwa desain digital terbaik bukan yang paling berisik, melainkan yang paling presisi, fungsional, dan memiliki sentuhan humanis.'
    ],
    quote: 'Simplicity is the consequence of depth, not the absence of it.'
  },
  interests: [
    'Tactile Interfaces',
    'Motion & Physics',
    'Minimalist Architecture',
    'Ambient Soundscapes',
    'Typography Craft'
  ],
  skills: [
    'TypeScript',
    'React & Next.js',
    'Tailwind CSS',
    'Motion & Animation',
    'Figma UI/UX',
    'Node.js & APIs',
    'Design Systems'
  ],
  currentlyDoing: 'Eksplorasi antarmuka liquid glass generasi baru dan sistem micro-interaction yang responsif pada perangkat mobile.',
  favoriteStack: ['TypeScript', 'React', 'Motion', 'Tailwind', 'Vite'],
  links: [
    {
      id: 'l-yt',
      platform: 'youtube',
      label: 'YouTube',
      url: 'https://youtube.com/@rey',
      username: '@rey.creative',
      enabled: true,
    },
    {
      id: 'l-tt',
      platform: 'tiktok',
      label: 'TikTok',
      url: 'https://tiktok.com/@rey',
      username: '@rey_vibes',
      enabled: true,
    },
    {
      id: 'l-ig',
      platform: 'instagram',
      label: 'Instagram',
      url: 'https://instagram.com/rey',
      username: '@rey.lens',
      enabled: true,
    },
    {
      id: 'l-gh',
      platform: 'github',
      label: 'GitHub',
      url: 'https://github.com/rey',
      username: 'rey-dev',
      enabled: true,
    },
    {
      id: 'l-sub',
      platform: 'custom',
      label: 'Substack Notes',
      url: 'https://substack.com/@rey',
      username: 'rey.substack.com',
      enabled: true,
    }
  ],
  projects: [
    {
      id: 'p-1',
      title: 'Aether Canvas',
      tagline: 'Spatial Audio & Minimalist Sound Engine',
      description: 'Sebuah eksperimen web interaktif yang menggabungkan sintesis frekuensi ambient dengan kanvas visual berbasis fisika fluida.',
      category: 'Interactive & Audio',
      link: 'https://github.com',
      githubUrl: 'https://github.com',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      year: '2025'
    },
    {
      id: 'p-2',
      title: 'Vesper System',
      tagline: 'Liquid Glass Interface Architecture',
      description: 'Design system berbasis translucent dark surfaces, micro-interactions responsif, dan kurva motion natural.',
      category: 'Design Engineering',
      link: 'https://github.com',
      githubUrl: 'https://github.com',
      imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
      featured: false,
      year: '2024'
    },
    {
      id: 'p-3',
      title: 'Komorebi Journal',
      tagline: 'Calm Scratchpad for Creative Writers',
      description: 'Aplikasi catatan digital dengan fokus distractive-free, offline storage, dan tipografi editorial presisi.',
      category: 'Productivity Tool',
      link: 'https://github.com',
      githubUrl: 'https://github.com',
      imageUrl: 'https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=1000&q=80',
      featured: false,
      year: '2024'
    }
  ],
  contact: {
    reyWhatsApp: 'https://wa.me/6281234567890?text=Halo%20Rey,%20saya%20tertarik%20untuk%20berkolaborasi.',
    parentWhatsApp: 'https://wa.me/6281987654321?text=Halo,%20saya%20ingin%20berkomunikasi%20mengenai%20jadwal%20atau%20proyek%20Rey.',
    email: 'hello@reydigital.me',
    location: 'Jakarta, Indonesia',
    note: 'Untuk tawaran proyek, sponsorship, atau kolaborasi resmi, silakan hubungi kontak di atas.'
  },
  lastUpdated: '2025-05-15'
};

const KV_KEY = 'rey_profile_v1';

function getKvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && url.startsWith('http')) {
    return { url: url.replace(/\/$/, ''), token };
  }
  return null;
}

function getLocalFilePath(): string {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'profile.json');
  }
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {}
  }
  return path.join(dataDir, 'profile.json');
}

export async function getStoredProfile(): Promise<ProfileData> {
  const kv = getKvConfig();
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/${KV_KEY}`, {
        headers: { Authorization: `Bearer ${kv.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (parsed && parsed.name) return parsed as ProfileData;
        }
      }
    } catch (err) {
      console.error('[KV Store] Error reading from KV:', err);
    }
  }

  try {
    const filePath = getLocalFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.name) return data as ProfileData;
    }
  } catch (err) {
    console.warn('[File Store] Could not read local profile file:', err);
  }

  return initialProfileData;
}

export async function saveStoredProfile(data: ProfileData): Promise<void> {
  const kv = getKvConfig();
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/set/${KV_KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kv.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`KV set returned status ${res.status}`);
      return;
    } catch (err) {
      console.error('[KV Store] Error saving to KV:', err);
    }
  }

  try {
    const filePath = getLocalFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[File Store] Failed to save profile to disk:', err);
    throw new Error('Gagal menyimpan file profil ke disk.');
  }
}

function getAdminPassword(): string | null {
  const pwd =
    process.env.ADMIN_PASWORD_REY ||
    process.env.admin_pasword_rey;
  if (!pwd || typeof pwd !== 'string') return null;
  const trimmed = pwd.trim().replace(/^["'](.*)["']$/, '$1');
  return trimmed.length > 0 ? trimmed : null;
}

function getServerSecret(): string {
  if (process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.trim().length > 0) {
    return process.env.ADMIN_SECRET.trim().replace(/^["'](.*)["']$/, '$1');
  }
  const pwd = getAdminPassword();
  if (pwd) {
    return crypto
      .createHmac('sha256', 'rey-profil-auth-salt-stable-v1')
      .update(pwd)
      .digest('hex');
  }
  return 'fallback-rey-profil-secret-salt-2026';
}

function verifyToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const secret = getServerSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return false;
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

function extractToken(req: any): string | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers?.cookie;
  if (typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/rey_admin_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  return null;
}

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

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  // GET: Public read profile
  if (req.method === 'GET') {
    try {
      const profile = await getStoredProfile();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json(profile);
    } catch (err: any) {
      console.error('[API Profile GET Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Gagal memuat profil.',
        error: err?.message || 'Internal Server Error',
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

    try {
      const body = await parseRequestBody(req);
      if (!body || typeof body !== 'object' || !body.name) {
        return res.status(400).json({
          success: false,
          message: 'Format data profil tidak valid atau tidak lengkap.',
        });
      }

      const formatted: ProfileData = {
        ...body,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      await saveStoredProfile(formatted);

      return res.status(200).json({
        success: true,
        message: 'Profil Rey berhasil diperbarui.',
        profile: formatted,
      });
    } catch (err: any) {
      console.error('[API Profile PUT Error]:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Gagal menyimpan pembaruan profil.',
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
      const kv = getKvConfig();
      if (kv) {
        try {
          await fetch(`${kv.url}/del/${KV_KEY}`, {
            headers: { Authorization: `Bearer ${kv.token}` },
          });
        } catch (err) {
          console.error('[KV Store] Error deleting KV key:', err);
        }
      }

      try {
        const filePath = getLocalFilePath();
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('[File Store] Error deleting local file on reset:', err);
      }

      return res.status(200).json({
        success: true,
        message: 'Profil berhasil direset ke pengaturan awal.',
        profile: initialProfileData,
      });
    } catch (err: any) {
      console.error('[API Profile Reset Error]:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Gagal mereset profil.',
      });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE, POST');
  return res.status(405).json({
    success: false,
    message: 'Method Not Allowed. Gunakan GET atau PUT.',
  });
}
