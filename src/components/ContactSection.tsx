import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Users2, Mail, Check, Copy, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { ContactInfo } from '../types';

interface ContactSectionProps {
  contact: ContactInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contact }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    if (!contact.email) return;
    navigator.clipboard.writeText(contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Ensure WhatsApp links format safely
  const getWhatsAppUrl = (val: string, message: string) => {
    if (!val) return '#';
    if (val.startsWith('http')) return val;
    const cleanNumber = val.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const reyWhatsAppUrl = getWhatsAppUrl(
    contact.reyWhatsApp,
    'Halo Rey, saya melihat profil digital Anda dan tertarik untuk terhubung.'
  );

  const parentWhatsAppUrl = getWhatsAppUrl(
    contact.parentWhatsApp,
    'Halo, saya ingin berkomunikasi mengenai kolaborasi atau jadwal resmi Rey.'
  );

  return (
    <section id="contact" className="py-12 px-4 max-w-2xl mx-auto pb-28">
      {/* Editorial Section Label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold font-heading">
          04 // Direct Inquiries
        </span>
        <div className="h-[1px] flex-1 bg-white/10" />
      </div>

      <div className="liquid-glass rounded-3xl p-6 sm:p-8 mb-6 border border-white/[0.1] relative overflow-hidden">
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading mb-1.5">
            Let's build something exceptional.
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            {contact.note || 'Untuk tawaran proyek, sponsorship, atau kolaborasi resmi, silakan hubungi kontak resmi di bawah ini.'}
          </p>
        </div>

        {/* Contact Actions Stack */}
        <div className="space-y-3">
          {/* 1. Hubungi Rey */}
          <motion.a
            href={reyWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            className="group flex items-center justify-between p-4 rounded-2xl liquid-glass-subtle border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Hubungi Rey
                </div>
                <div className="text-xs text-neutral-400">
                  Direct message via WhatsApp
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/[0.08] transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </motion.a>

          {/* 2. Hubungi Orang Tua */}
          <motion.a
            href={parentWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            className="group flex items-center justify-between p-4 rounded-2xl liquid-glass-subtle border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Hubungi Orang Tua
                </div>
                <div className="text-xs text-neutral-400">
                  Official inquiries & parental guidance
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/[0.08] transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </motion.a>

          {/* 3. Email */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-2xl liquid-glass-subtle border border-white/[0.08] gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  Email
                </div>
                <div className="text-xs text-neutral-400 font-mono truncate">
                  {contact.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-3 py-1.5 rounded-lg liquid-glass-subtle text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Copy email address"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${contact.email}`}
                className="px-3 py-1.5 rounded-lg liquid-glass text-xs font-medium text-white border border-white/10 hover:border-white/25 transition-colors"
              >
                Kirim Email
              </a>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span>Nomor pribadi dilindungi dan dialihkan secara aman melalui tautan resmi.</span>
        </div>
      </div>
    </section>
  );
};
