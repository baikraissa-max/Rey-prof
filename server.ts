import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initialProfileData } from './src/data/initialProfile.ts';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'profile.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure initial profile data exists on disk
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialProfileData, null, 2), 'utf-8');
}

// Read current profile data
function getStoredProfile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading profile file:', err);
  }
  return initialProfileData;
}

// Save profile data
function saveStoredProfile(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// In-memory or HMAC session secret
const SERVER_SECRET = process.env.ADMIN_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rey2025';

function createToken(payload: { role: string; exp: number }) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SERVER_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SERVER_SECRET).update(data).digest('base64url');
  if (signature !== expectedSig) return false;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) return false;
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get current profile
  app.get('/api/profile', (req, res) => {
    const profile = getStoredProfile();
    res.json(profile);
  });

  // Admin login (password verified strictly on server)
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body || {};

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password wajib diisi.' });
    }

    // Compare with timingSafeEqual to prevent timing attacks
    const passwordBuffer = Buffer.from(password.trim());
    const targetBuffer = Buffer.from(ADMIN_PASSWORD.trim());

    const isMatch = passwordBuffer.length === targetBuffer.length &&
      crypto.timingSafeEqual(passwordBuffer, targetBuffer);

    if (!isMatch) {
      // Artificial delay to prevent brute-forcing
      setTimeout(() => {
        return res.status(401).json({ error: 'Password atau PIN admin salah.' });
      }, 350);
      return;
    }

    const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const token = createToken({ role: 'admin', exp });

    res.json({
      success: true,
      token,
      expiresAt: exp,
      message: 'Login berhasil sebagai Admin Rey.'
    });
  });

  // Verify token
  app.get('/api/auth/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token && verifyToken(token)) {
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false });
  });

  // Update profile (Admin only)
  app.put('/api/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Akses tidak diizinkan. Token tidak valid.' });
    }

    const updatedData = req.body;
    if (!updatedData || !updatedData.name) {
      return res.status(400).json({ error: 'Data profil tidak valid.' });
    }

    updatedData.lastUpdated = new Date().toISOString().split('T')[0];
    saveStoredProfile(updatedData);

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      profile: updatedData
    });
  });

  // Reset profile to defaults (Admin only)
  app.post('/api/profile/reset', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Akses tidak diizinkan.' });
    }

    saveStoredProfile(initialProfileData);
    res.json({
      success: true,
      message: 'Profil berhasil direset ke pengaturan awal.',
      profile: initialProfileData
    });
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
