import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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

interface IndicatorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const LiquidNavbar: React.FC<LiquidNavbarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<NavTabId, HTMLButtonElement | null>>({
    home: null,
    links: null,
    projects: null,
    contact: null,
  });

  const [hoveredTab, setHoveredTab] = useState<NavTabId | null>(null);
  const [indicatorRect, setIndicatorRect] = useState<IndicatorRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const isTouchingRef = useRef(false);

  // Target tab yang sedang disorot: jika cursor/jari ada di atas nav, ikuti hovered; jika tidak, kembali ke activeTab
  const currentTargetId = hoveredTab ?? activeTab;

  // Ukur posisi dan ukuran elemen item secara presisi & dinamis
  const updateIndicatorRect = useCallback(() => {
    const nav = navRef.current;
    const targetButton = itemRefs.current[currentTargetId];

    if (!nav || !targetButton) return;

    const navRect = nav.getBoundingClientRect();
    const btnRect = targetButton.getBoundingClientRect();

    setIndicatorRect({
      x: btnRect.left - navRect.left,
      y: btnRect.top - navRect.top,
      width: btnRect.width,
      height: btnRect.height,
    });
    setIsReady(true);
  }, [currentTargetId]);

  // Update rect saat target berubah
  useEffect(() => {
    updateIndicatorRect();
  }, [updateIndicatorRect]);

  // Update rect saat window resize atau orientasi HP berubah
  useEffect(() => {
    const handleResize = () => {
      updateIndicatorRect();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    // ResizeObserver untuk mendeteksi perubahan ukuran internal container
    let resizeObserver: ResizeObserver | null = null;
    if (navRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateIndicatorRect();
      });
      resizeObserver.observe(navRef.current);
    }

    // Delay singkat setelah mount untuk memastikan render font selesai
    const timer = setTimeout(updateIndicatorRect, 60);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [updateIndicatorRect]);

  // Handler klik menu
  const handleClick = (item: NavItem) => {
    onSelectTab(item.id);
    setHoveredTab(null);

    const element = document.getElementById(item.targetId);
    if (element) {
      const yOffset = -24;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Touch handlers untuk HP (magnetic touch-follow)
  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    isTouchingRef.current = true;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const navButton = el?.closest('[data-nav-id]') as HTMLButtonElement | null;
    if (navButton) {
      const tabId = navButton.getAttribute('data-nav-id') as NavTabId;
      if (tabId) setHoveredTab(tabId);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const navButton = el?.closest('[data-nav-id]') as HTMLButtonElement | null;
    if (navButton) {
      const tabId = navButton.getAttribute('data-nav-id') as NavTabId;
      if (tabId && tabId !== hoveredTab) {
        setHoveredTab(tabId);
      }
    }
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    if (hoveredTab) {
      const foundItem = NAV_ITEMS.find((item) => item.id === hoveredTab);
      if (foundItem) {
        handleClick(foundItem);
      }
    }
    // Kembalikan ke activeTab
    setTimeout(() => {
      setHoveredTab(null);
    }, 150);
  };

  return (
    <aside 
      aria-label="Floating Navigation Container"
      className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] pointer-events-auto select-none"
    >
      <nav
        ref={navRef}
        aria-label="Liquid Glass Navigation"
        onMouseLeave={() => setHoveredTab(null)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => setHoveredTab(null)}
        className="relative flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full liquid-glass-pill backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_0_20px_0_rgba(168,85,247,0.04)]"
      >
        {/* Dynamic Liquid Glass Indicator (Magnetic highlight that smoothly springs between tabs) */}
        {isReady && (
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{
              x: indicatorRect.x,
              y: indicatorRect.y,
              width: indicatorRect.width,
              height: indicatorRect.height,
              opacity: 1,
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 420,
                    damping: 32,
                    mass: 0.65,
                  }
            }
            className="absolute top-0 left-0 rounded-full pointer-events-none z-0 bg-gradient-to-b from-white/[0.2] via-white/[0.09] to-white/[0.04] border border-white/20 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.4),0_0_16px_rgba(168,85,247,0.12)] backdrop-blur-md"
          />
        )}

        {/* Navigation Items */}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isTargeted = currentTargetId === item.id;
          const isActuallyActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[item.id] = el;
              }}
              data-nav-id={item.id}
              type="button"
              onClick={() => handleClick(item)}
              onMouseEnter={() => setHoveredTab(item.id)}
              className="group relative z-10 min-h-[42px] px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 select-none flex items-center gap-1.5 focus:outline-none active:scale-95"
            >
              {/* Subtle hover scale on individual item content for iOS tactile feel */}
              <motion.div 
                className="flex items-center gap-1.5"
                animate={{
                  scale: isTargeted ? 1.04 : 1,
                }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 450, damping: 28 }
                }
              >
                <Icon
                  className={`w-4 h-4 transition-colors duration-200 shrink-0 ${
                    isTargeted || isActuallyActive
                      ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                      : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                />

                <span
                  className={`transition-colors duration-200 hidden sm:inline tracking-tight ${
                    isTargeted || isActuallyActive
                      ? 'text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                      : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>

              {/* Mini active dot indicator on mobile when label is hidden */}
              {isActuallyActive && (
                <span 
                  className="sm:hidden absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.8)]" 
                />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
