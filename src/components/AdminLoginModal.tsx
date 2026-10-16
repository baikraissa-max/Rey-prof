import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, X, Loader2, AlertCircle, Shield, Sparkles, Key } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent, directPassword?: string) => {
    if (e) e.preventDefault();
    const pwdToSubmit = (directPassword !== undefined ? directPassword : password).trim();
    if (!pwdToSubmit || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwdToSubmit }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = {};
        }
      }

      if (response.ok && data.token) {
        onLoginSuccess(data.token);
      } else {
        if (response.status === 401) {
          setErrorMessage(data.message || data.error || 'Password atau PIN admin salah.');
        } else if (response.status === 403) {
          setErrorMessage(data.message || 'Akses ditolak (403).');
        } else if (response.status === 404) {
          setErrorMessage('API endpoint login tidak ditemukan (404). Periksa deployment Vercel.');
        } else if (response.status >= 500) {
          setErrorMessage(data.message || data.error || 'Terjadi kesalahan pada server (500). Periksa log Vercel Functions.');
        } else {
          setErrorMessage(data.message || data.error || `Login gagal (Status ${response.status}).`);
        }
      }
    } catch (err) {
      setErrorMessage('Server atau API tidak dapat dihubungi (Network error).');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window in Liquid Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm rounded-3xl liquid-glass p-6 sm:p-7 border border-white/15 shadow-[0_24px_64px_rgba(0,0,0,0.85)] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10 text-neutral-300">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                Admin Authentication
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              aria-label="Cancel & close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
            Masukkan PIN atau password otentikasi admin untuk mengakses panel pengelolaan profil Rey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Password / Security PIN
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Ketik password atau klik di bawah"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-black/50 border border-white/15 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick 1-Tap Login & Hints */}
              <div className="mt-2.5 space-y-1.5">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setPassword('reyadmin');
                    handleSubmit(undefined, 'reyadmin');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 text-xs font-medium text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>⚡ Klik Disini untuk Masuk Langsung (<strong>reyadmin</strong>)</span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono px-0.5 pt-1">
                  <span>Alternatif PIN:</span>
                  <div className="flex items-center gap-1.5">
                    {['reyadmin', 'rey', 'admin'].map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        onClick={() => {
                          setPassword(alt);
                          handleSubmit(undefined, alt);
                        }}
                        className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer text-[10px]"
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Security Note */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
              <Shield className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
              <span>Otentikasi diverifikasi langsung di server.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl liquid-glass-subtle text-xs font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="flex-1 py-2.5 rounded-xl liquid-glass text-xs font-medium text-white border border-white/20 hover:border-white/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
