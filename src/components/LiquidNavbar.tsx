import React from 'react';
import { motion } from 'motion/react';
import { Home, Link2, Briefcase, Mail } from 'lucide-react';

export type NavTabId = 'home' | 'links' | 'projects' | 'contact';

interface LiquidNavbarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  targetId: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, targetId: 'hero' },
  { id: 'links', label: 'Links', icon: Link2, targetId: 'links' },
  { id: 'projects', label: 'Projects', icon: Briefcase, targetId: 'projects' },
  { id: 'contact', label: 'Contact', icon: Mail, targetId: 'contact' },
];

export const LiquidNavbar: React.FC<LiquidNavbarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const handleClick = (item: NavItem) => {
    onSelectTab(item.id);
    const element = document.getElementById(item.targetId);
    if (element) {
      const yOffset = -24;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] pointer-events-auto">
      <nav 
        aria-label="Bottom Liquid Navigation"
        className="relative flex items-center gap-1 p-1.5 rounded-full liquid-glass-pill backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className="relative px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium transition-colors duration-200 select-none flex items-center gap-1.5 focus:outline-none"
            >
              {/* Smooth Liquid Highlight Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeNavHighlight"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] pointer-events-none"
                />
              )}

              <Icon className={`relative z-10 w-4 h-4 transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`} />

              <span className={`relative z-10 transition-colors duration-200 hidden sm:inline ${
                isActive ? 'text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
