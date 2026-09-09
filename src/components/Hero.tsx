import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Sparkles } from 'lucide-react';
import { ProfileData } from '../types';

interface HeroProps {
  profile: ProfileData;
  onSecretAdminTrigger: () => void;
  onNavigateToContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  profile,
  onSecretAdminTrigger,
  onNavigateToContact,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [isSecretTriggered, setIsSecretTriggered] = useState(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNameTap = () => {
    // Reset timer on each tap
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (nextCount >= 5) {
      // 5 taps achieved!
      setIsSecretTriggered(true);
      setTapCount(0);
      setTimeout(() => {
        setIsSecretTriggered(false);
        onSecretAdminTrigger();
      }, 400);
    } else {
      // Reset if no subsequent tap within 1800ms
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 1800);
    }
  };

  return (
    <section id="hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 flex flex-col items-center text-center px-4">
      {/* Optional Announcement Pill */}
      {profile.announcement?.enabled && profile.announcement.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-subtle text-xs text-neutral-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-pulse" />
            <span>{profile.announcement.text}</span>
          </div>
        </motion.div>
      )}

      {/* Circular Liquid Glass Avatar Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6"
      >
        {/* Outer subtle reflection ring */}
        <div className="relative p-1.5 rounded-full liquid-glass shadow-2xl">
          {/* Inner bezel */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-white/15 bg-neutral-900/60">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter saturate-[1.05] contrast-[1.02]"
              onError={(e) => {
                // Graceful fallback to a stylish minimal abstract portrait
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85';
              }}
            />
            {/* Soft lens light sheen overlay */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.3) 100%)'
              }}
            />
          </div>
        </div>

        {/* Status indicator pill positioned subtly at avatar bottom */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill text-[11px] font-medium tracking-wide text-neutral-200">
          <span className="relative flex h-2 w-2">
            {profile.isAvailable && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${profile.isAvailable ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
          </span>
          <span>{profile.status || (profile.isAvailable ? 'Available' : 'Busy')}</span>
        </div>
      </motion.div>

      {/* Main Profile Name REY - 5-Tap Secret Admin Access */}
      <div className="relative mt-3 mb-2 flex flex-col items-center">
        <motion.button
          type="button"
          onClick={handleNameTap}
          whileTap={{ scale: 0.98 }}
          animate={isSecretTriggered ? { scale: [1, 1.06, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] } : {}}
          transition={{ duration: 0.35 }}
          className="select-none cursor-pointer focus:outline-none group relative px-4 py-1"
          aria-label={profile.name}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-heading transition-colors">
            {profile.name}
          </h1>

          {/* Invisible micro feedback on tap */}
          {tapCount > 0 && tapCount < 5 && (
            <span className="absolute -top-1 right-2 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse pointer-events-none" />
          )}
        </motion.button>

        {profile.username && (
          <p className="text-sm text-neutral-400 font-medium tracking-wide">
            {profile.username}
          </p>
        )}
      </div>

      {/* Profile Title / Tagline */}
      {profile.title && (
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-neutral-400/90 font-semibold mt-1 mb-4">
          {profile.title}
        </p>
      )}

      {/* Short Bio */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-md text-sm sm:text-base text-neutral-300 leading-relaxed font-normal mb-8 px-4"
      >
        {profile.bio}
      </motion.p>

      {/* Primary Hero Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="flex items-center gap-3"
      >
        <button
          id="hero-contact-btn"
          type="button"
          onClick={onNavigateToContact}
          className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full liquid-glass text-sm font-medium text-white shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/15 hover:border-white/25"
        >
          <span className="relative z-10 font-medium tracking-tight">Contact Me</span>
          <ArrowDown className="w-4 h-4 text-neutral-300 group-hover:translate-y-0.5 transition-transform duration-200" />
          
          {/* Subtle button reflection sheen */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)'
            }}
          />
        </button>

        <a
          href="#projects"
          className="inline-flex items-center justify-center px-5 py-3 rounded-full text-sm font-medium text-neutral-300 hover:text-white transition-colors duration-200"
        >
          View Work
        </a>
      </motion.div>
    </section>
  );
};
