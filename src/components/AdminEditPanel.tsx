import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  Eye, 
  LogOut, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  User, 
  Link2, 
  Briefcase, 
  Mail, 
  Sliders,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ProfileData, ProjectItem, SocialLink } from '../types';

interface AdminEditPanelProps {
  initialProfile: ProfileData;
  token: string;
  onSaveSuccess: (updated: ProfileData) => void;
  onClose: () => void;
  onLogout: () => void;
}

type TabType = 'profile' | 'links' | 'projects' | 'contact' | 'other';

export const AdminEditPanel: React.FC<AdminEditPanelProps> = ({
  initialProfile,
  token,
  onSaveSuccess,
  onClose,
  onLogout,
}) => {
  const [formData, setFormData] = useState<ProfileData>(JSON.parse(JSON.stringify(initialProfile)));
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Profile fields update
  const handleBasicChange = (field: keyof ProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // About update
  const handleAboutChange = (field: 'heading' | 'paragraphs' | 'quote', value: any) => {
    setFormData((prev) => ({
      ...prev,
      about: { ...prev.about, [field]: value }
    }));
  };

  // Contact update
  const handleContactChange = (field: keyof typeof formData.contact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  // Links management
  const handleAddLink = () => {
    const newLink: SocialLink = {
      id: `l-${Date.now()}`,
      platform: 'custom',
      label: 'New Link',
      url: 'https://',
      username: '',
      enabled: true,
    };
    setFormData((prev) => ({ ...prev, links: [...prev.links, newLink] }));
  };

  const handleUpdateLink = (id: string, updates: Partial<SocialLink>) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === id ? { ...l, ...updates } : l))
    }));
  };

  const handleDeleteLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id)
    }));
  };

  // Projects management
  const handleAddProject = () => {
    const newProject: ProjectItem = {
      id: `p-${Date.now()}`,
      title: 'New Project Title',
      tagline: 'Brief editorial tagline',
      description: 'Deskripsi lengkap tentang konsep dan implementasi proyek.',
      category: 'Web App',
      link: 'https://',
      githubUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      featured: false,
      year: new Date().getFullYear().toString(),
    };
    setFormData((prev) => ({ ...prev, projects: [newProject, ...prev.projects] }));
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectItem>) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));
  };

  const handleDeleteProject = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id)
    }));
  };

  // Save to backend
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSaveStatus('success');
        onSaveSuccess(formData);
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('error');
        setErrorMessage(resData.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage('Terjadi kendala saat menghubungi server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!window.confirm('Kembalikan semua profil ke pengaturan bawaan?')) return;
    setIsSaving(true);

    try {
      const response = await fetch('/api/profile/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (response.ok && resData.profile) {
        setFormData(resData.profile);
        onSaveSuccess(resData.profile);
        setSaveStatus('success');
      }
    } catch {
      alert('Gagal mereset profil.');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview Mode minimized banner
  if (isPreviewMode) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full liquid-glass-pill border border-cyan-400/30 shadow-2xl">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
        </span>
        <span className="text-xs font-medium text-white">Preview Mode</span>
        <button
          type="button"
          onClick={() => setIsPreviewMode(false)}
          className="px-3 py-1 rounded-full liquid-glass text-xs font-semibold text-white hover:bg-white/10"
        >
          Kembali ke Editor
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Dark overlay backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
      />

      {/* Main Glass Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl liquid-glass border border-white/20 shadow-[0_32px_80px_rgba(0,0,0,0.9)] z-10 overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Admin Edit Panel — Rey
              </h2>
              <p className="text-[11px] text-neutral-400">
                Perubahan langsung diperbarui secara aman di backend.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewMode(true)}
              className="px-3 py-1.5 rounded-xl liquid-glass-subtle text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5"
              title="Preview Website"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl liquid-glass-subtle text-xs font-medium text-neutral-400 hover:text-red-300 hover:border-red-500/30 flex items-center gap-1.5"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.08]"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-white/8 overflow-x-auto no-scrollbar bg-black/20">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'links', label: 'Social Links', icon: Link2 },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'contact', label: 'Contact', icon: Mail },
            { id: 'other', label: 'Other & Skills', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nama Utama
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleBasicChange('name', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white/35"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleBasicChange('username', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white/35"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Sub-headline / Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleBasicChange('title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white/35"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Bio Singkat
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleBasicChange('bio', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white/35"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    URL Foto Profil
                  </label>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) => handleBasicChange('avatarUrl', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white/35"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Status Teks
                  </label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => handleBasicChange('status', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white/35"
                    placeholder="e.g. Available"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => handleBasicChange('isAvailable', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-neutral-900 border-white/20"
                />
                <label htmlFor="isAvailable" className="text-xs text-neutral-200 cursor-pointer">
                  Tampilkan status ketersediaan aktif (Green indicator pulse)
                </label>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  About Ethos Heading
                </label>
                <input
                  type="text"
                  value={formData.about.heading}
                  onChange={(e) => handleAboutChange('heading', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white/35"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  About Ethos Quote
                </label>
                <input
                  type="text"
                  value={formData.about.quote || ''}
                  onChange={(e) => handleAboutChange('quote', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white/35"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL LINKS */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  Daftar tautan publik Rey yang tampil pada bagian Links.
                </span>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass text-xs font-medium text-white border border-white/15 hover:border-white/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Link</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-xl liquid-glass-subtle border border-white/10 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Platform</label>
                        <select
                          value={link.platform}
                          onChange={(e) => handleUpdateLink(link.id, { platform: e.target.value as any })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                        >
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="instagram">Instagram</option>
                          <option value="github">GitHub</option>
                          <option value="x">X / Twitter</option>
                          <option value="custom">Custom Link</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Label</label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateLink(link.id, { label: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Username / Handle</label>
                        <input
                          type="text"
                          value={link.username || ''}
                          onChange={(e) => handleUpdateLink(link.id, { username: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] text-neutral-400 mb-1">URL Target</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono"
                        />
                      </div>

                      <div className="pt-5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateLink(link.id, { enabled: !link.enabled })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                            link.enabled
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          }`}
                        >
                          {link.enabled ? 'Aktif' : 'Nonaktif'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Hapus Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  Kelola portfolio karya Rey dalam layout editorial modern.
                </span>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass text-xs font-medium text-white border border-white/15 hover:border-white/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Project</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 sm:p-5 rounded-2xl liquid-glass-subtle border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {proj.title || 'Untitled Project'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateProject(proj.id, { featured: !proj.featured })}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                            proj.featured
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-white/[0.04] text-neutral-400 border-white/10'
                          }`}
                        >
                          {proj.featured ? 'Featured Highlight' : 'Set Featured'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Judul Project</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleUpdateProject(proj.id, { title: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Kategori</label>
                        <input
                          type="text"
                          value={proj.category}
                          onChange={(e) => handleUpdateProject(proj.id, { category: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Tahun</label>
                        <input
                          type="text"
                          value={proj.year || ''}
                          onChange={(e) => handleUpdateProject(proj.id, { year: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={proj.tagline}
                        onChange={(e) => handleUpdateProject(proj.id, { tagline: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Deskripsi Editorial</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">URL Project</label>
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e) => handleUpdateProject(proj.id, { link: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">GitHub URL (Opsional)</label>
                        <input
                          type="text"
                          value={proj.githubUrl || ''}
                          onChange={(e) => handleUpdateProject(proj.id, { githubUrl: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">URL Gambar</label>
                        <input
                          type="text"
                          value={proj.imageUrl}
                          onChange={(e) => handleUpdateProject(proj.id, { imageUrl: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Kontak langsung yang akan dialihkan ke WhatsApp atau Email tanpa membuka nomor secara mentah ke publik.
              </p>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Link / Nomor WhatsApp Rey
                </label>
                <input
                  type="text"
                  value={formData.contact.reyWhatsApp}
                  onChange={(e) => handleContactChange('reyWhatsApp', e.target.value)}
                  placeholder="https://wa.me/6281234567890"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Link / Nomor WhatsApp Orang Tua
                </label>
                <input
                  type="text"
                  value={formData.contact.parentWhatsApp}
                  onChange={(e) => handleContactChange('parentWhatsApp', e.target.value)}
                  placeholder="https://wa.me/6281987654321"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Email Resmi
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="hello@reydigital.me"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Catatan Privasi / Kolaborasi
                </label>
                <textarea
                  rows={2}
                  value={formData.contact.note || ''}
                  onChange={(e) => handleContactChange('note', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 5: OTHER (Announcement, Interests, Skills, Currently Doing) */}
          {activeTab === 'other' && (
            <div className="space-y-4">
              {/* Announcement Banner */}
              <div className="p-4 rounded-xl liquid-glass-subtle border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Announcement Banner</span>
                  <input
                    type="checkbox"
                    checked={formData.announcement?.enabled || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        announcement: {
                          enabled: e.target.checked,
                          text: prev.announcement?.text || '',
                          link: prev.announcement?.link || '',
                        }
                      }))
                    }
                    className="w-4 h-4 rounded text-cyan-500 bg-neutral-900 border-white/20"
                  />
                </div>

                <input
                  type="text"
                  value={formData.announcement?.text || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      announcement: {
                        enabled: prev.announcement?.enabled || false,
                        text: e.target.value,
                        link: prev.announcement?.link || '',
                      }
                    }))
                  }
                  placeholder="Teks pengumuman singkat..."
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                />
              </div>

              {/* Currently Doing */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Currently Doing
                </label>
                <textarea
                  rows={2}
                  value={formData.currentlyDoing}
                  onChange={(e) => handleBasicChange('currentlyDoing', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                />
              </div>

              {/* Skills comma separated */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Skills (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.skills.join(', ')}
                  onChange={(e) =>
                    handleBasicChange(
                      'skills',
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                />
              </div>

              {/* Interests comma separated */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Interests (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.interests.join(', ')}
                  onChange={(e) =>
                    handleBasicChange(
                      'interests',
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/50">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-red-300 hover:bg-white/[0.04] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            {saveStatus === 'success' && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Tersimpan!</span>
              </span>
            )}

            {saveStatus === 'error' && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage || 'Error'}</span>
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl liquid-glass-subtle text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl liquid-glass text-xs font-semibold text-white border border-white/25 hover:border-white/40 shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
