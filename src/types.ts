export interface SocialLink {
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

export interface ContactInfo {
  reyWhatsApp: string; // e.g. "https://wa.me/6281234567890" or wa number
  parentWhatsApp: string; // e.g. "https://wa.me/6281987654321"
  email: string;
  location?: string;
  note?: string;
}

export interface ProfileData {
  name: string;
  username: string;
  title: string;
  bio: string;
  avatarUrl: string;
  status: string; // e.g. "Available for projects"
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
  links: SocialLink[];
  projects: ProjectItem[];
  contact: ContactInfo;
  lastUpdated?: string;
}
