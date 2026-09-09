import React, { useState, useEffect } from 'react';
import { BackgroundGradients } from './components/BackgroundGradients';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { LinksSection } from './components/LinksSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ContactSection } from './components/ContactSection';
import { LiquidNavbar, NavTabId } from './components/LiquidNavbar';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminEditPanel } from './components/AdminEditPanel';
import { initialProfileData } from './data/initialProfile';
import { ProfileData } from './types';
import { Sliders, ShieldCheck } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<ProfileData>(initialProfileData);
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Fetch initial profile data from backend
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) {
            setProfile(data);
          }
        }
      } catch (err) {
        console.warn('Using local profile data fallback:', err);
      }
    }
    loadProfile();

    // Check if previous valid admin session exists in sessionStorage
    const savedToken = sessionStorage.getItem('rey_admin_token');
    if (savedToken) {
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then((res) => {
          if (res.ok) {
            setAdminToken(savedToken);
          } else {
            sessionStorage.removeItem('rey_admin_token');
          }
        })
        .catch(() => {
          sessionStorage.removeItem('rey_admin_token');
        });
    }
  }, []);

  // Scroll spy to update active navbar item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      const heroEl = document.getElementById('hero');
      const linksEl = document.getElementById('links');
      const projectsEl = document.getElementById('projects');
      const contactEl = document.getElementById('contact');

      if (contactEl && scrollPosition >= contactEl.offsetTop) {
        setActiveTab('contact');
      } else if (projectsEl && scrollPosition >= projectsEl.offsetTop) {
        setActiveTab('projects');
      } else if (linksEl && scrollPosition >= linksEl.offsetTop) {
        setActiveTab('links');
      } else if (heroEl) {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle secret 5-tap trigger
  const handleSecretTrigger = () => {
    if (adminToken) {
      // If already authenticated, directly open the edit panel
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // On successful login
  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    sessionStorage.setItem('rey_admin_token', token);
    setIsAdminLoginOpen(false);
    setIsAdminPanelOpen(true);
  };

  // On logout
  const handleLogout = () => {
    setAdminToken(null);
    sessionStorage.removeItem('rey_admin_token');
    setIsAdminPanelOpen(false);
  };

  // Scroll to contact section
  const handleNavigateToContact = () => {
    setActiveTab('contact');
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070709] text-[#e4e5eb] selection:bg-white/15 selection:text-white font-sans antialiased">
      {/* Organic Subtle Liquid Background */}
      <BackgroundGradients />

      {/* Top Subtle Minimal Header */}
      <header className="relative z-20 w-full max-w-2xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
            Raisa Profil
          </span>
          <span className="text-neutral-500 font-mono text-xs">/</span>
          <span className="text-[11px] font-mono text-neutral-400">
            {profile.username || '@rey'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin badge if already logged in */}
          {adminToken && (
            <button
              type="button"
              onClick={() => setIsAdminPanelOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full liquid-glass text-[11px] font-mono text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
            >
              <Sliders className="w-3 h-3" />
              <span>Edit Mode</span>
            </button>
          )}

          {/* Discreet status indicator */}
          <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
            <span className={`w-1.5 h-1.5 rounded-full ${profile.isAvailable ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
            <span className="text-[11px] tracking-wide text-neutral-400 font-light">
              {profile.status}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="relative z-10 w-full max-w-2xl mx-auto px-2 sm:px-4 pb-28 sm:pb-32">
        {/* 1. Hero Profile (with 5-tap secret access on REY) */}
        <Hero
          profile={profile}
          onSecretAdminTrigger={handleSecretTrigger}
          onNavigateToContact={handleNavigateToContact}
        />

        {/* 2. About & Profile Info */}
        <AboutSection profile={profile} />

        {/* 3. Links Section */}
        <LinksSection links={profile.links} />

        {/* 4. Projects Editorial Showcase */}
        <ProjectsSection projects={profile.projects} />

        {/* 5. Contact Direct Section */}
        <ContactSection contact={profile.contact} />

        {/* Minimal Footer */}
        <footer className="pt-8 pb-16 text-center border-t border-white/[0.06] text-xs text-neutral-400">
          <div className="flex items-center justify-center gap-2 mb-2 text-neutral-400 font-mono tracking-widest text-[11px] uppercase">
            <span>Raisa Profil</span>
            <span>•</span>
            <span>{profile.name}</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Crafted with Dark Liquid Glass architecture & minimal restraint.
          </p>
        </footer>
      </main>

      {/* Floating Bottom Liquid Glass Navigation */}
      <LiquidNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Hidden Secret Admin Login Modal (Triggered by tapping REY 5 times) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Edit Panel (Available once authenticated) */}
      {isAdminPanelOpen && adminToken && (
        <AdminEditPanel
          initialProfile={profile}
          token={adminToken}
          onSaveSuccess={(updated) => {
            setProfile(updated);
          }}
          onClose={() => setIsAdminPanelOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
