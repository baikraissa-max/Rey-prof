import { ProfileData } from '../types';

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

/**
 * Normalizes any partial or legacy profile object to guarantee that
 * every nested field (about, contact, announcement, arrays, etc.) is fully populated
 * with default fallbacks, preventing undefined errors.
 */
export function normalizeProfileData(input: any): ProfileData {
  if (!input || typeof input !== 'object') {
    return { ...initialProfileData };
  }

  const aboutRaw = input.about || {};
  let paragraphs: string[] = [];
  if (Array.isArray(aboutRaw.paragraphs) && aboutRaw.paragraphs.length > 0) {
    paragraphs = aboutRaw.paragraphs.map((p: any) => String(p ?? '').trim()).filter(Boolean);
  }
  if (paragraphs.length === 0) {
    paragraphs = [...initialProfileData.about.paragraphs];
  }

  const contactRaw = input.contact || {};
  const announcementRaw = input.announcement || {};

  return {
    ...initialProfileData,
    ...input,
    name: typeof input.name === 'string' && input.name.trim() ? input.name.trim() : initialProfileData.name,
    username: typeof input.username === 'string' && input.username.trim() ? input.username.trim() : initialProfileData.username,
    title: typeof input.title === 'string' && input.title.trim() ? input.title.trim() : initialProfileData.title,
    bio: typeof input.bio === 'string' ? input.bio : initialProfileData.bio,
    avatarUrl: typeof input.avatarUrl === 'string' && input.avatarUrl.trim() ? input.avatarUrl.trim() : initialProfileData.avatarUrl,
    status: typeof input.status === 'string' && input.status.trim() ? input.status.trim() : initialProfileData.status,
    isAvailable: typeof input.isAvailable === 'boolean' ? input.isAvailable : Boolean(input.isAvailable ?? true),
    announcement: {
      enabled: Boolean(announcementRaw.enabled ?? initialProfileData.announcement?.enabled),
      text: typeof announcementRaw.text === 'string' ? announcementRaw.text : (initialProfileData.announcement?.text || ''),
      link: typeof announcementRaw.link === 'string' ? announcementRaw.link : initialProfileData.announcement?.link,
    },
    about: {
      heading: typeof aboutRaw.heading === 'string' && aboutRaw.heading.trim() 
        ? aboutRaw.heading.trim() 
        : initialProfileData.about.heading,
      paragraphs,
      quote: typeof aboutRaw.quote === 'string' ? aboutRaw.quote : initialProfileData.about.quote,
    },
    interests: Array.isArray(input.interests) && input.interests.length > 0 ? input.interests : initialProfileData.interests,
    skills: Array.isArray(input.skills) && input.skills.length > 0 ? input.skills : initialProfileData.skills,
    currentlyDoing: typeof input.currentlyDoing === 'string' && input.currentlyDoing.trim() 
      ? input.currentlyDoing.trim() 
      : initialProfileData.currentlyDoing,
    favoriteStack: Array.isArray(input.favoriteStack) && input.favoriteStack.length > 0 ? input.favoriteStack : initialProfileData.favoriteStack,
    links: Array.isArray(input.links) && input.links.length > 0 ? input.links : initialProfileData.links,
    projects: Array.isArray(input.projects) && input.projects.length > 0 ? input.projects : initialProfileData.projects,
    contact: {
      reyWhatsApp: typeof contactRaw.reyWhatsApp === 'string' && contactRaw.reyWhatsApp.trim() 
        ? contactRaw.reyWhatsApp.trim() 
        : initialProfileData.contact.reyWhatsApp,
      parentWhatsApp: typeof contactRaw.parentWhatsApp === 'string' && contactRaw.parentWhatsApp.trim() 
        ? contactRaw.parentWhatsApp.trim() 
        : initialProfileData.contact.parentWhatsApp,
      email: typeof contactRaw.email === 'string' && contactRaw.email.trim() 
        ? contactRaw.email.trim() 
        : initialProfileData.contact.email,
      location: typeof contactRaw.location === 'string' ? contactRaw.location : initialProfileData.contact.location,
      note: typeof contactRaw.note === 'string' ? contactRaw.note : initialProfileData.contact.note,
    },
    lastUpdated: typeof input.lastUpdated === 'string' ? input.lastUpdated : new Date().toISOString().split('T')[0],
  };
}

