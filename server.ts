import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  getAdminPassword, 
  verifyAdminPassword,
  timingSafeMatch, 
  createToken, 
  verifyToken, 
  extractToken 
} from './src/server/auth';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  resetStoredProfile 
} from './src/server/profileStore';
import { ProfileData } from './src/types';
import { put } from '@vercel/blob';

const PORT = 3000;

async function startServer() {
  const app = express();

  // High payload limits to accommodate profile updates with images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Ensure public/uploads directory exists and is statically served
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch {}
  app.use('/uploads', express.static(uploadsDir));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get current profile (Public)
  app.get('/api/profile', async (req, res) => {
    try {
      const profile = await getStoredProfile();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      res.status(500).json({ success: false, message: 'Gagal memuat data profil.' });
    }
  });

  // Admin login (password verified strictly on server)
  app.post('/api/auth/login', async (req, res) => {
    const { password } = req.body || {};

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Password atau PIN admin wajib diisi.' });
    }

    const isMatch = verifyAdminPassword(password);

    if (!isMatch) {
      // Artificial delay to prevent brute-forcing
      await new Promise((resolve) => setTimeout(resolve, 250));
      return res.status(401).json({ 
        success: false, 
        message: 'Password atau PIN admin salah. Gunakan password default: reyadmin' 
      });
    }

    const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const token = createToken({ role: 'admin', exp });

    res.json({
      success: true,
      token,
      expiresAt: exp,
      message: 'Login berhasil sebagai Admin Rey.',
    });
  });

  // Verify token
  app.get('/api/auth/verify', (req, res) => {
    const token = extractToken(req);

    if (token && verifyToken(token)) {
      return res.json({ valid: true, success: true, message: 'Sesi admin valid.' });
    }
    return res.status(401).json({ valid: false, success: false, message: 'Sesi admin tidak valid atau telah berakhir.' });
  });

  // Upload image (Admin only)
  app.post(
    '/api/upload',
    express.raw({ type: (req) => true, limit: '20mb' }),
    async (req, res) => {
      const token = extractToken(req);
      if (!token || !verifyToken(token)) {
        return res.status(401).json({
          success: false,
          message: 'Akses ditolak. Sesi admin tidak valid atau telah berakhir.',
        });
      }

      const rawContentType = (req.headers['content-type'] || '').toLowerCase().split(';')[0].trim();
      const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File gambar kosong atau tidak terbaca.',
        });
      }

      const queryFilename = typeof req.query?.filename === 'string' ? req.query.filename : '';
      const headerFilename = typeof req.headers?.['x-file-name'] === 'string' ? req.headers['x-file-name'] : '';
      const rawFilename = queryFilename || headerFilename || `upload-${Date.now()}`;
      const ext = rawContentType === 'image/png' ? '.png' : rawContentType === 'image/webp' ? '.webp' : '.jpg';
      let safeName = decodeURIComponent(rawFilename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 50);
      if (!/\.(jpg|jpeg|png|webp)$/i.test(safeName)) safeName += ext;

      // 1. If Vercel Blob Token configured, use Vercel Blob
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (blobToken && blobToken.trim().length > 0) {
        try {
          const blob = await put(`rey-gallery/${Date.now()}-${safeName}`, buffer, {
            access: 'public',
            contentType: rawContentType || 'image/jpeg',
            token: blobToken.trim(),
          });
          return res.json({
            success: true,
            url: blob.url,
            fileName: safeName,
            storage: 'vercel-blob',
            message: 'Gambar berhasil diupload ke Vercel Blob.',
          });
        } catch (err: any) {
          console.warn('[Blob upload warning, falling back to local storage]:', err?.message);
        }
      }

      // 2. Try saving to public/uploads directory for fast static serving without large payloads
      try {
        const filePath = path.join(uploadsDir, safeName);
        fs.writeFileSync(filePath, buffer);
        return res.json({
          success: true,
          url: `/uploads/${safeName}`,
          fileName: safeName,
          storage: 'local-filesystem',
          message: 'Gambar berhasil disimpan ke media lokal.',
        });
      } catch (err: any) {
        console.warn('[Local disk save warning, falling back to data URL]:', err?.message);
      }

      // 3. Fallback Data URL
      const mime = rawContentType && rawContentType.startsWith('image/') ? rawContentType : 'image/jpeg';
      const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
      return res.json({
        success: true,
        url: dataUrl,
        fileName: safeName,
        storage: 'data-url-fallback',
        message: 'Gambar berhasil diproses.',
      });
    }
  );

  // Update profile (Admin only) - support both PUT and POST
  const handleUpdateProfile = async (req: express.Request, res: express.Response) => {
    const token = extractToken(req);

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ success: false, message: 'Akses tidak diizinkan. Token tidak valid atau telah berakhir.' });
    }

    const updatedData = req.body;
    if (!updatedData || typeof updatedData !== 'object' || !updatedData.name) {
      return res.status(400).json({ success: false, message: 'Data profil tidak valid atau nama kosong.' });
    }

    try {
      const formatted: ProfileData = {
        ...updatedData,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      await saveStoredProfile(formatted);

      return res.json({
        success: true,
        message: 'Profil Rey berhasil diperbarui.',
        profile: formatted,
      });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      return res.status(500).json({ success: false, message: err?.message || 'Gagal menyimpan profil.' });
    }
  };

  app.put('/api/profile', handleUpdateProfile);
  app.post('/api/profile', handleUpdateProfile);

  // Reset profile to defaults (Admin only)
  app.post(['/api/profile/reset', '/api/reset'], async (req, res) => {
    const token = extractToken(req);

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ success: false, message: 'Akses tidak diizinkan.' });
    }

    try {
      const profile = await resetStoredProfile();
      res.json({
        success: true,
        message: 'Profil berhasil direset ke pengaturan awal.',
        profile,
      });
    } catch (err: any) {
      console.error('Error resetting profile:', err);
      res.status(500).json({ success: false, message: err?.message || 'Gagal mereset profil.' });
    }
  });

  // Vite middleware for dev or static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Express error handler to guarantee JSON responses
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Server Error Handler]:', err);
    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        message: 'Ukuran file atau data terlalu besar. Maksimal 50 MB.',
      });
    }
    return res.status(500).json({
      success: false,
      message: err?.message || 'Terjadi kesalahan pada server saat memproses data.',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Raisa Profil server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
