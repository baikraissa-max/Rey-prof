import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstalled, canInstall, isIOS, hasNativePrompt, triggerInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed in standalone mode, hide the button
  if (isInstalled) {
    return null;
  }

  // If browser doesn't allow install yet and not on iOS, hide
  if (!canInstall && !isIOS) {
    return null;
  }

  const handleClick = async () => {
    if (hasNativePrompt) {
      const accepted = await triggerInstall();
      if (accepted) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        id="pwa-install-button"
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-[11px] font-mono tracking-wide text-neutral-200 border border-purple-500/30 hover:border-purple-500/60 hover:text-white transition-all duration-200 shadow-lg shadow-purple-950/20"
        title="Pasang aplikasi ke layar utama perangkat Anda"
      >
        {justInstalled ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300">Terpasang</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Install App</span>
          </>
        )}
      </motion.button>

      {/* iOS Safari / Browser Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-sm rounded-3xl liquid-glass border border-white/15 p-6 shadow-2xl z-10 text-center"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Tutup panduan install"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl liquid-glass border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
                <Smartphone className="w-7 h-7" />
              </div>

              <h3 className="text-base font-semibold text-white mb-1.5 tracking-tight font-sans">
                Pasang ke Layar Utama
              </h3>
              <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                Nikmati pengalaman Dark Liquid Glass layar penuh tanpa address bar browser di perangkat Anda.
              </p>

              {/* Steps */}
              <div className="space-y-2.5 text-left mb-6">
                <div className="flex items-center gap-3 p-2.5 rounded-xl liquid-glass-subtle border border-white/5">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-purple-400">
                    <Share className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs text-neutral-300">
                    1. Tekan tombol <span className="text-white font-medium">Share</span> di menu browser.
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl liquid-glass-subtle border border-white/5">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-purple-400">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs text-neutral-300">
                    2. Gulir dan pilih <span className="text-white font-medium">Tambahkan ke Layar Utama</span> (Add to Home Screen).
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 px-4 rounded-xl liquid-glass text-xs font-semibold text-white hover:bg-white/15 border border-white/10 transition-colors"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
