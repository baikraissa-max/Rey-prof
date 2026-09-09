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
      className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-[430px] sm:w-auto sm:max-w-none pointer-events-auto select-none"
    >
      <nav
        ref={navRef}
        aria-label="Liquid Glass Navigation"
        onMouseLeave={() => setHoveredTab(null)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => setHoveredTab(null)}
        className="relative flex items-center justify-between sm:justify-center gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-full liquid-glass-pill backdrop-blur-2xl border border-white/[0.15] shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.25),inset_0_0_24px_0_rgba(168,85,247,0.06)] h-[68px] sm:h-[62px] w-full sm:w-auto"
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
                    stiffness: 400,
                    damping: 32,
                    mass: 0.65,
                  }
            }
            className="absolute top-0 left-0 rounded-full pointer-events-none z-0 bg-gradient-to-b from-white/[0.22] via-white/[0.1] to-white/[0.04] border border-white/25 shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.45),0_6px_20px_rgba(0,0,0,0.45),0_0_20px_rgba(168,85,247,0.14)] backdrop-blur-md"
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
              className="group relative z-10 flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 px-3 sm:px-5 py-1.5 sm:py-2 h-full rounded-full transition-all duration-200 select-none focus:outline-none active:scale-95"
            >
              {/* Subtle hover scale on individual item content for iOS tactile feel */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5"
                animate={{
                  scale: isTargeted ? 1.05 : 1,
                }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 450, damping: 28 }
                }
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 shrink-0 ${
                    isTargeted || isActuallyActive
                      ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                      : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                />

                <span
                  className={`transition-colors duration-200 text-[11px] sm:text-xs md:text-sm font-medium tracking-tight whitespace-nowrap ${
                    isTargeted || isActuallyActive
                      ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
                      : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
