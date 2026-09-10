import fs from 'fs';
import path from 'path';
import { put, list, del } from '@vercel/blob';

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
const BLOB_PATHNAME = 'rey-profile/profile.json';

// In-memory cache to guarantee fast response within execution lifecycle
let memoryCache: ProfileData | null = null;

// Helper to check for Supabase configuration
function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && typeof url === 'string' && url.startsWith('http')) {
    return { url: url.replace(/\/$/, ''), key: key.trim() };
  }
  return null;
}

// Helper to check for Vercel Blob configuration
function getBlobConfig(): { token: string } | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token && typeof token === 'string' && token.trim().length > 0) {
    return { token: token.trim() };
  }
  return null;
}

// Helper to check for Vercel KV / Upstash Redis configuration
function getKvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && typeof url === 'string' && url.startsWith('http')) {
    return { url: url.replace(/\/$/, ''), token: token.trim() };
  }
  return null;
}

// Local filesystem paths
function getLocalFilePath(): string {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'profile.json');
  }

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // Ignore if cannot create
    }
  }
  return path.join(dataDir, 'profile.json');
}

/**
 * Retrieve current profile data.
 * Checks in order:
 * 1. Supabase (if configured)
 * 2. Vercel Blob Storage (if configured)
 * 3. Vercel KV / Upstash Redis (if configured)
 * 4. Local File System
 * 5. In-memory cache
 * 6. Default initialProfileData
 */
export async function getStoredProfile(): Promise<ProfileData> {
  // 1. Try Supabase PostgREST
  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      const res = await fetch(
        `${supabase.url}/rest/v1/site_profile?id=eq.${KV_KEY}&select=data`,
        {
          headers: {
            apikey: supabase.key,
            Authorization: `Bearer ${supabase.key}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0]?.data?.name) {
          const profile = rows[0].data as ProfileData;
          memoryCache = profile;
          return profile;
        }
      }
    } catch (err) {
      console.warn('[Storage] Error reading from Supabase:', err);
    }
  }

  // 2. Try Vercel Blob Storage
  const blob = getBlobConfig();
  if (blob) {
    try {
      const { blobs } = await list({
        prefix: BLOB_PATHNAME,
        token: blob.token,
        limit: 1,
      });

      if (blobs && blobs.length > 0 && blobs[0].url) {
        const downloadUrl = `${blobs[0].url}${blobs[0].url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
        const blobRes = await fetch(downloadUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });

        if (blobRes.ok) {
          const json = await blobRes.json();
          if (json && json.name) {
            memoryCache = json as ProfileData;
            return json as ProfileData;
          }
        }
      }
    } catch (err) {
      console.warn('[Storage] Error reading from Vercel Blob:', err);
    }
  }

  // 3. Try Vercel KV / Upstash Redis
  const kv = getKvConfig();
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/${KV_KEY}`, {
        headers: {
          Authorization: `Bearer ${kv.token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (parsed && parsed.name) {
            memoryCache = parsed as ProfileData;
            return parsed as ProfileData;
          }
        }
      }
    } catch (err) {
      console.warn('[Storage] Error reading from Vercel KV:', err);
    }
  }

  // 4. Try Local File System
  try {
    const filePath = getLocalFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.name) {
        memoryCache = data as ProfileData;
        return data as ProfileData;
      }
    }
  } catch (err) {
    console.warn('[Storage] Could not read local profile file:', err);
  }

  // 5. In-memory cache
  if (memoryCache && memoryCache.name) {
    return memoryCache;
  }

  // 6. Fallback to Initial Profile Data
  return initialProfileData;
}

/**
 * Save updated profile data permanently.
 * Replicates across all configured storages to ensure zero-loss persistence.
 */
export async function saveStoredProfile(data: ProfileData): Promise<void> {
  memoryCache = data;
  let hasSavedPersistent = false;
  let saveErrors: string[] = [];

  // 1. Save to Supabase (if configured)
  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      const res = await fetch(`${supabase.url}/rest/v1/site_profile`, {
        method: 'POST',
        headers: {
          apikey: supabase.key,
          Authorization: `Bearer ${supabase.key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: KV_KEY,
          data: data,
          updated_at: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        hasSavedPersistent = true;
      } else {
        const errText = await res.text().catch(() => '');
        saveErrors.push(`Supabase error: ${res.status} ${errText}`);
      }
    } catch (err: any) {
      saveErrors.push(`Supabase exception: ${err?.message}`);
    }
  }

  // 2. Save to Vercel Blob Storage (if configured)
  const blob = getBlobConfig();
  if (blob) {
    try {
      await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token: blob.token,
        cacheControlMaxAge: 0,
      });
      hasSavedPersistent = true;
    } catch (err: any) {
      saveErrors.push(`Vercel Blob exception: ${err?.message}`);
    }
  }

  // 3. Save to Vercel KV / Upstash Redis (if configured)
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

      if (res.ok) {
        hasSavedPersistent = true;
      } else {
        saveErrors.push(`Vercel KV error: ${res.status}`);
      }
    } catch (err: any) {
      saveErrors.push(`Vercel KV exception: ${err?.message}`);
    }
  }

  // 4. Always update local filesystem if accessible
  try {
    const filePath = getLocalFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    hasSavedPersistent = true;
  } catch (err: any) {
    saveErrors.push(`Local filesystem write error: ${err?.message}`);
  }

  if (!hasSavedPersistent && saveErrors.length > 0) {
    console.error('[Storage Save Error]', saveErrors);
    throw new Error(`Gagal menyimpan ke penyimpanan server: ${saveErrors.join(', ')}`);
  }
}

/**
 * Reset profile back to initial defaults across all storages.
 */
export async function resetStoredProfile(): Promise<ProfileData> {
  memoryCache = initialProfileData;

  // 1. Reset Supabase
  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      await fetch(`${supabase.url}/rest/v1/site_profile?id=eq.${KV_KEY}`, {
        method: 'DELETE',
        headers: {
          apikey: supabase.key,
          Authorization: `Bearer ${supabase.key}`,
        },
      });
    } catch (err) {
      console.warn('[Storage] Error deleting Supabase row:', err);
    }
  }

  // 2. Reset Vercel Blob
  const blob = getBlobConfig();
  if (blob) {
    try {
      const { blobs } = await list({
        prefix: BLOB_PATHNAME,
        token: blob.token,
        limit: 1,
      });
      if (blobs && blobs.length > 0 && blobs[0].url) {
        await del(blobs[0].url, { token: blob.token });
      }
    } catch (err) {
      console.warn('[Storage] Error deleting Vercel Blob file:', err);
    }
  }

  // 3. Reset Vercel KV
  const kv = getKvConfig();
  if (kv) {
    try {
      await fetch(`${kv.url}/del/${KV_KEY}`, {
        headers: { Authorization: `Bearer ${kv.token}` },
      });
    } catch (err) {
      console.warn('[Storage] Error deleting Vercel KV key:', err);
    }
  }

  // 4. Reset Local File
  try {
    const filePath = getLocalFilePath();
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(initialProfileData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[Storage] Error resetting local file:', err);
  }

  return initialProfileData;
}
