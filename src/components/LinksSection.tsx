import React from 'react';
import { motion } from 'motion/react';
import { 
  Youtube, 
  Instagram, 
  Github, 
  ArrowUpRight, 
  Globe, 
  Music2, 
  ExternalLink,
  Share2
} from 'lucide-react';
import { SocialLink } from '../types';

interface LinksSectionProps {
  links: SocialLink[];
}

export const LinksSection: React.FC<LinksSectionProps> = ({ links }) => {
  const enabledLinks = links.filter((l) => l.enabled !== false);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-400" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-400" />;
      case 'tiktok':
        return <Music2 className="w-5 h-5 text-cyan-400" />;
      case 'github':
        return <Github className="w-5 h-5 text-neutral-200" />;
      case 'x':
      case 'twitter':
        return <Share2 className="w-5 h-5 text-sky-400" />;
      default:
        return <Globe className="w-5 h-5 text-neutral-300" />;
    }
  };

  return (
    <section id="links" className="py-12 px-4 max-w-2xl mx-auto">
      {/* Editorial Section Label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold font-heading">
          02 // Verified Channels & Links
        </span>
        <div className="h-[1px] flex-1 bg-white/10" />
      </div>

      <div className="space-y-3">
        {enabledLinks.map((link, index) => (
          <motion.a
            key={link.id || index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.985 }}
            className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl liquid-glass overflow-hidden transition-all duration-300 border border-white/[0.08] hover:border-white/20"
          >
            {/* Soft liquid light reflection at top */}
            <div 
              className="absolute inset-x-0 top-0 h-[1px] opacity-30 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)'
              }}
            />

            <div className="flex items-center gap-4 min-w-0">
              {/* Icon Container with frosted glass */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.08] group-hover:border-white/20 group-hover:bg-white/[0.08] transition-colors shrink-0">
                {getPlatformIcon(link.platform)}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight group-hover:text-neutral-100 truncate">
                  {link.label}
                </h3>
                {link.username && (
                  <p className="text-xs text-neutral-400 font-mono tracking-tight truncate">
                    {link.username}
                  </p>
                )}
              </div>
            </div>

            {/* External arrow trigger with fluid motion */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/[0.08] transition-all duration-200 shrink-0 ml-3">
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};
