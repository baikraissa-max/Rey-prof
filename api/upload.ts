import { put } from '@vercel/blob';
import { verifyToken, extractToken } from '../src/server/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Megabytes
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
  const effectiveMime = ALLOWED_MIME_TYPES.includes(rawContentType) ? rawContentType : 'image/jpeg';

  // 3. Validasi Content-Length
  const declaredLength = parseInt(req.headers?.['content-length'] || '0', 10);
  if (declaredLength > MAX_FILE_SIZE) {
    return res.status(413).json({
      success: false,
      message: 'Ukuran file terlalu besar. Maksimal ukuran gambar adalah 15 MB.',
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
            message: 'Ukuran file melebihi batas maksimal 15 MB.',
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
  const safeFilename = sanitizeFileName(decodeURIComponent(rawFilename), effectiveMime);

  // 6. Penyimpanan Persistent Vercel Blob jika token ada
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken && blobToken.trim().length > 0) {
    try {
      const pathname = `rey-gallery/${Date.now()}-${safeFilename}`;
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: effectiveMime,
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
      console.warn('[Vercel Blob Upload Warning - falling back to data URL]:', blobErr?.message);
    }
  }

  // Fallback dev / offline / missing token: Base64 Data URL
  const base64Data = buffer.toString('base64');
  const dataUrl = `data:${effectiveMime};base64,${base64Data}`;

  return res.status(200).json({
    success: true,
    url: dataUrl,
    fileName: safeFilename,
    size: buffer.length,
    storage: 'data-url-fallback',
    message: 'Gambar berhasil diproses.',
  });
}
