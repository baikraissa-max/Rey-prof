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

// Helper to check for Vercel KV / Upstash Redis configuration
function getKvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && url.startsWith('http')) {
    return { url: url.replace(/\/$/, ''), token };
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
 * Checks Vercel KV first, then local filesystem, and falls back to initialProfileData.
 */
export async function getStoredProfile(): Promise<ProfileData> {
  const kv = getKvConfig();

  // 1. Try Vercel KV / Upstash Redis if configured
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/${KV_KEY}`, {
        headers: { Authorization: `Bearer ${kv.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (parsed && parsed.name) {
            return parsed as ProfileData;
          }
        }
      }
    } catch (err) {
      console.error('[KV Store] Error reading from KV:', err);
    }
  }

  // 2. Try Local File System
  try {
    const filePath = getLocalFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.name) {
        return data as ProfileData;
      }
    }
  } catch (err) {
    console.warn('[File Store] Could not read local profile file:', err);
  }

  // 3. Fallback to Initial Profile Data
  return initialProfileData;
}

/**
 * Save updated profile data.
 * Writes to Vercel KV if available, otherwise writes to local/ephemeral filesystem.
 */
export async function saveStoredProfile(data: ProfileData): Promise<void> {
  const kv = getKvConfig();

  // 1. If Vercel KV is configured, write permanently to KV
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

      if (!res.ok) {
        throw new Error(`KV set returned status ${res.status}`);
      }
      return;
    } catch (err) {
      console.error('[KV Store] Error saving to KV:', err);
    }
  }

  // 2. Write to local filesystem
  try {
    const filePath = getLocalFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[File Store] Failed to save profile to disk:', err);
    throw new Error('Gagal menyimpan file profil ke penyimpanan server.');
  }
}

/**
 * Reset profile back to initial defaults.
 */
export async function resetStoredProfile(): Promise<ProfileData> {
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
      fs.writeFileSync(filePath, JSON.stringify(initialProfileData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[File Store] Error resetting local file:', err);
  }

  return initialProfileData;
}
