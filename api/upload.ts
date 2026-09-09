import crypto from 'crypto';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Megabytes
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function getAdminPassword(): string | null {
  const pwd =
    process.env.ADMIN_PASWORD_REY ||
    process.env.admin_pasword_rey;
  if (!pwd || typeof pwd !== 'string') return null;
  const trimmed = pwd.trim().replace(/^["'](.*)["']$/, '$1');
  return trimmed.length > 0 ? trimmed : null;
}

function getServerSecret(): string {
  if (process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.trim().length > 0) {
    return process.env.ADMIN_SECRET.trim().replace(/^["'](.*)["']$/, '$1');
  }
  const pwd = getAdminPassword();
  if (pwd) {
    return crypto
      .createHmac('sha256', 'rey-profil-auth-salt-stable-v1')
      .update(pwd)
      .digest('hex');
  }
  return 'fallback-rey-profil-secret-salt-2026';
}

function verifyToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const secret = getServerSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return false;
    }
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

function extractToken(req: any): string | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers?.cookie;
  if (typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/rey_admin_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  return null;
}

function sanitizeFileName(rawName: string, mimeType: string): string {
  const extensionMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };

  const defaultExt = extensionMap[mimeType] || '.jpg';
  let cleanName = rawName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 60);

  if (!cleanName || cleanName === '_') {
    cleanName = `asset_${Date.now()}`;
  }

  if (!/\.(jpg|jpeg|png|webp)$/i.test(cleanName)) {
    cleanName += defaultExt;
  }

  return cleanName;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Gunakan POST untuk upload gambar.',
    });
  }

  // 1. Keamanan: Pastikan hanya admin terautentikasi yang dapat upload
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Sesi admin tidak valid atau telah berakhir.',
    });
  }

  // 2. Validasi MIME Type dari header
  const rawContentType = (req.headers?.['content-type'] || '').toLowerCase().split(';')[0].trim();
  if (!ALLOWED_MIME_TYPES.includes(rawContentType)) {
    return res.status(400).json({
      success: false,
      message: `Tipe file '${rawContentType || 'tidak diketahui'}' tidak didukung. Harap pilih gambar dengan format JPG, JPEG, PNG, atau WebP.`,
    });
  }

  // 3. Validasi Content-Length
  const declaredLength = parseInt(req.headers?.['content-length'] || '0', 10);
  if (declaredLength > MAX_FILE_SIZE) {
    return res.status(413).json({
      success: false,
      message: 'Ukuran file terlalu besar. Maksimal ukuran gambar adalah 5 MB.',
    });
  }

  // 4. Baca Binary Body
  let buffer: Buffer;
  try {
    if (Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else if (req.body && typeof req.body === 'string') {
      buffer = Buffer.from(req.body, 'binary');
    } else {
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      for await (const chunk of req) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        totalBytes += buf.length;
        if (totalBytes > MAX_FILE_SIZE) {
          return res.status(413).json({
            success: false,
            message: 'Ukuran file melebihi batas maksimal 5 MB.',
          });
        }
        chunks.push(buf);
      }
      buffer = Buffer.concat(chunks);
    }
  } catch (err: any) {
    console.error('[Upload Stream Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses data file gambar dari stream upload.',
    });
  }

  if (!buffer || buffer.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'File gambar kosong atau tidak terbaca.',
    });
  }

  // 5. Nama file yang aman
  const queryFilename = typeof req.query?.filename === 'string' ? req.query.filename : '';
  const headerFilename = typeof req.headers?.['x-file-name'] === 'string' ? req.headers['x-file-name'] : '';
  const rawFilename = queryFilename || headerFilename || `upload-${Date.now()}`;
  const safeFilename = sanitizeFileName(decodeURIComponent(rawFilename), rawContentType);

  // 6. Penyimpanan Persistent Vercel Blob
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken && blobToken.trim().length > 0) {
    try {
      const pathname = `rey-gallery/${Date.now()}-${safeFilename}`;
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: rawContentType,
        token: blobToken.trim(),
      });

      return res.status(200).json({
        success: true,
        url: blob.url,
        fileName: safeFilename,
        size: buffer.length,
        storage: 'vercel-blob',
        message: 'Gambar berhasil diupload ke Vercel Blob Storage.',
      });
    } catch (blobErr: any) {
      console.error('[Vercel Blob Upload Error]:', blobErr);
      return res.status(500).json({
        success: false,
        message: `Gagal mengunggah ke Vercel Blob: ${blobErr?.message || 'Terjadi kesalahan storage'}`,
      });
    }
  }

  // Fallback dev / offline: Base64 Data URL
  // Jika BLOB_READ_WRITE_TOKEN belum dipasang di Vercel, tetap hasilkan data URL yang valid
  // sehingga gambar langsung tampil tanpa error.
  const base64Data = buffer.toString('base64');
  const dataUrl = `data:${rawContentType};base64,${base64Data}`;

  return res.status(200).json({
    success: true,
    url: dataUrl,
    fileName: safeFilename,
    size: buffer.length,
    storage: 'data-url-fallback',
    message: 'Gambar berhasil diproses (Data URL). Tambahkan BLOB_READ_WRITE_TOKEN di Vercel untuk penyimpanan Vercel Blob otomatis.',
  });
}
