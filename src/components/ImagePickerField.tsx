import React, { useRef, useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  Check, 
  Link as LinkIcon 
} from 'lucide-react';

interface ImagePickerFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  token: string;
  aspectRatio?: 'square' | 'wide' | 'auto';
  helperText?: string;
  id?: string;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

async function compressImageFile(file: File): Promise<{ blob: Blob; mimeType: string }> {
  if (file.size < 250 * 1024 || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return { blob: file, mimeType: file.type };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ blob: file, mimeType: file.type });

        const isPng = file.type === 'image/png' && file.size < 1.5 * 1024 * 1024;
        const targetMime = isPng ? 'image/png' : 'image/jpeg';
        const quality = 0.85;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve({ blob, mimeType: targetMime });
            } else {
              resolve({ blob: file, mimeType: file.type });
            }
          },
          targetMime,
          quality
        );
      };
      img.onerror = () => resolve({ blob: file, mimeType: file.type });
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ blob: file, mimeType: file.type });
    reader.readAsDataURL(file);
  });
}

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  label,
  value,
  onChange,
  token,
  aspectRatio = 'auto',
  helperText,
  id,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Trigger file selection dialog (Galeri di HP / File picker di PC)
  const handleTriggerPicker = () => {
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  // Handle file chosen by user
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input agar bisa memilih file yang sama lagi jika diinginkan
    e.target.value = '';

    setErrorMessage(null);

    // 1. Validasi Tipe File (JPG, JPEG, PNG, WEBP)
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Format file tidak didukung. Harap pilih gambar JPG, JPEG, PNG, atau WebP.');
      return;
    }

    // 2. Validasi Ukuran File (Maks 15MB)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`Ukuran file terlalu besar (${sizeMB} MB). Maksimal ukuran file adalah 15 MB.`);
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress('Mengoptimalkan & mengunggah gambar...');

    try {
      // Optimasi gambar di browser terlebih dahulu
      const { blob, mimeType } = await compressImageFile(file);

      // 3. Upload file ke endpoint backend /api/upload
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType,
          'X-File-Name': encodeURIComponent(file.name),
        },
        body: blob,
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengunggah gambar ke storage.');
      }

      // Berhasil: simpan URL yang dikembalikan ke state form
      onChange(data.url);
      setUploadProgress('Selesai');
      setTimeout(() => setUploadProgress(null), 2500);
    } catch (err: any) {
      console.error('[Upload Error]:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengunggah file.');
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Hapus gambar
  const handleRemoveImage = () => {
    onChange('');
    setFileName(null);
    setErrorMessage(null);
    setUploadProgress(null);
  };

  const hasImage = Boolean(value && value.trim().length > 0);

  // Aspect ratio class mapping for preview
  const aspectClass =
    aspectRatio === 'square'
      ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl'
      : aspectRatio === 'wide'
      ? 'w-full h-36 sm:h-44 rounded-xl'
      : 'w-24 h-24 sm:w-32 sm:h-32 rounded-xl';

  return (
    <div id={id} className="space-y-2.5">
      {/* Label & Secondary Manual Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-neutral-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          {showManualUrl ? 'Sembunyikan URL' : 'Opsi URL Manual'}
        </button>
      </div>

      {/* Hidden native input file with accept for gallery / mobile support */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Dark Liquid Glass Card Container */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/20">
        {hasImage ? (
          /* Preview State */
          <div className="space-y-3">
            <div className={`flex ${aspectRatio === 'wide' ? 'flex-col' : 'items-center'} gap-3.5`}>
              {/* Image Preview */}
              <div className={`relative overflow-hidden ${aspectClass} bg-neutral-900 border border-white/15 shrink-0 shadow-lg`}>
                <img
                  src={value}
                  alt={label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback visual if image fails to load
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {isUploading && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin mb-1" />
                    <span className="text-[10px] text-white font-medium">Mengunggah...</span>
                  </div>
                )}
              </div>

              {/* Info & Action Controls */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-white truncate">
                      {fileName || 'Gambar Terpasang'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate max-w-xs sm:max-w-md font-mono">
                    {value.startsWith('data:') ? 'Data URL (Tersimpan)' : value}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTriggerPicker}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-xs text-white font-medium transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                    Ganti Gambar
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 border border-red-500/20 text-xs text-red-300 font-medium transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2">
            <div className="flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-300 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">Belum ada gambar</p>
                <p className="text-[11px] text-neutral-400">
                  Format JPG, JPEG, PNG, WebP (maks. 5 MB)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerPicker}
              disabled={isUploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 active:scale-95 text-xs font-medium transition-all shadow-md shrink-0"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Pilih dari Galeri
                </>
              )}
            </button>
          </div>
        )}

        {/* Status indicator */}
        {uploadProgress && (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <Check className="w-3.5 h-3.5" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-2.5 flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manual URL Input (Optional / Collapsible fallback) */}
        {showManualUrl && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
            <label className="block text-[11px] text-neutral-400">
              Input URL Gambar Manual (Opsional)
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-white/35"
            />
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-400 pl-1">{helperText}</p>
      )}
    </div>
  );
};
