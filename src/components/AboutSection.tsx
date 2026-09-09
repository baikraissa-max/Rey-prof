import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Terminal, Compass, Flame } from 'lucide-react';
import { ProfileData } from '../types';

interface AboutSectionProps {
  profile: ProfileData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  return (
    <section id="about" className="py-12 px-4 max-w-2xl mx-auto">
      {/* Editorial Section Label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold font-heading">
          01 // About & Ethos
        </span>
        <div className="h-[1px] flex-1 bg-white/10" />
      </div>

      {/* Main Narrative Card in Liquid Glass */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="liquid-glass rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
          {profile.about.heading || 'Designing with restraint & depth.'}
        </h2>

        <div className="space-y-3.5 text-sm sm:text-base text-neutral-300 leading-relaxed">
          {profile.about.paragraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {profile.about.quote && (
          <div className="mt-6 pt-5 border-t border-white/8 flex items-start gap-3">
            <span className="text-neutral-500 font-serif text-2xl leading-none">“</span>
            <p className="text-xs sm:text-sm italic text-neutral-400 font-light">
              {profile.about.quote}
            </p>
          </div>
        )}
      </motion.div>

      {/* Compact Profile Info Grid (Interests, Skills, Currently Doing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Currently Doing Card */}
        {profile.currentlyDoing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 liquid-glass-subtle rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Currently Doing</span>
            </div>
            <p className="text-sm text-neutral-200 leading-relaxed font-normal">
              {profile.currentlyDoing}
            </p>
          </motion.div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="liquid-glass-subtle rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-cyan-400/80" />
              <span>Core Stack & Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.04] text-neutral-300 border border-white/[0.06]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="liquid-glass-subtle rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-violet-400/80" />
              <span>Interests & Exploration</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.04] text-neutral-300 border border-white/[0.06]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
