import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { 
  getAdminPassword, 
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

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

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

    const configuredPassword = getAdminPassword();
    if (!configuredPassword) {
      console.error('[AUTH ERROR] ADMIN_PASWORD_REY belum diset di environment variables.');
      return res.status(500).json({
        success: false,
        message: 'ADMIN_PASWORD_REY belum dikonfigurasi di Environment Variables server.',
      });
    }

    const isMatch = timingSafeMatch(password.trim(), configuredPassword);

    if (!isMatch) {
      // Artificial delay to prevent brute-forcing
      await new Promise((resolve) => setTimeout(resolve, 350));
      return res.status(401).json({ success: false, message: 'Password atau PIN admin salah.' });
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
    express.raw({ type: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], limit: '6mb' }),
    async (req, res) => {
      const token = extractToken(req);
      if (!token || !verifyToken(token)) {
        return res.status(401).json({
          success: false,
          message: 'Akses ditolak. Sesi admin tidak valid atau telah berakhir.',
        });
      }

      const rawContentType = (req.headers['content-type'] || '').toLowerCase().split(';')[0].trim();
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(rawContentType)) {
        return res.status(400).json({
          success: false,
          message: 'Format file tidak didukung. Harap pilih gambar dengan format JPG, JPEG, PNG, atau WebP.',
        });
      }

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

      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (blobToken && blobToken.trim().length > 0) {
        try {
          const blob = await put(`rey-gallery/${Date.now()}-${safeName}`, buffer, {
            access: 'public',
            contentType: rawContentType,
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
          console.error('[Blob upload error]:', err);
          return res.status(500).json({ success: false, message: 'Gagal mengunggah ke Vercel Blob.' });
        }
      }

      // Fallback Data URL
      const dataUrl = `data:${rawContentType};base64,${buffer.toString('base64')}`;
      return res.json({
        success: true,
        url: dataUrl,
        fileName: safeName,
        storage: 'data-url-fallback',
        message: 'Gambar berhasil diproses.',
      });
    }
  );

  // Update profile (Admin only)
  app.put('/api/profile', async (req, res) => {
    const token = extractToken(req);

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ success: false, message: 'Akses tidak diizinkan. Token tidak valid.' });
    }

    const updatedData = req.body;
    if (!updatedData || !updatedData.name) {
      return res.status(400).json({ success: false, message: 'Data profil tidak valid.' });
    }

    try {
      const formatted: ProfileData = {
        ...updatedData,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      await saveStoredProfile(formatted);

      res.json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        profile: formatted,
      });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      res.status(500).json({ success: false, message: err?.message || 'Gagal menyimpan profil.' });
    }
  });

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Raisa Profil server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
