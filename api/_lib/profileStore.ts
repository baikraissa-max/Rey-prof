import fs from 'fs';
import path from 'path';
import { initialProfileData } from '../../src/data/initialProfile.ts';
import { ProfileData } from '../../src/types.ts';

const KV_KEY = 'rey_profile_v1';

// Helper to check for Vercel KV / Upstash Redis configuration
function getKvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && url.startsWith('http')) {
    return { url: url.replace(/\/$/, ''), token };
  }
  return null;
}

// Local filesystem paths
function getLocalFilePath(): string {
  // In Vercel serverless functions, the root is read-only.
  // If running in Vercel (process.env.VERCEL is set), fallback to /tmp
  if (process.env.VERCEL) {
    return path.join('/tmp', 'profile.json');
  }

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // Ignore if cannot create
    }
  }
  return path.join(dataDir, 'profile.json');
}

/**
 * Retrieve current profile data.
 * Checks Vercel KV first, then local filesystem, and falls back to initialProfileData.
 */
export async function getStoredProfile(): Promise<ProfileData> {
  const kv = getKvConfig();

  // 1. Try Vercel KV / Upstash Redis if configured
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/${KV_KEY}`, {
        headers: { Authorization: `Bearer ${kv.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (parsed && parsed.name) {
            return parsed as ProfileData;
          }
        }
      }
    } catch (err) {
      console.error('[KV Store] Error reading from KV:', err);
    }
  }

  // 2. Try Local File System
  try {
    const filePath = getLocalFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.name) {
        return data as ProfileData;
      }
    }
  } catch (err) {
    console.warn('[File Store] Could not read local profile file:', err);
  }

  // 3. Fallback to Initial Profile Data
  return initialProfileData;
}

/**
 * Save updated profile data.
 * Writes to Vercel KV if available, otherwise writes to local/ephemeral filesystem.
 */
export async function saveStoredProfile(data: ProfileData): Promise<void> {
  const kv = getKvConfig();

  // 1. If Vercel KV is configured, write permanently to KV
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/set/${KV_KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kv.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`KV set returned status ${res.status}`);
      }
      return;
    } catch (err) {
      console.error('[KV Store] Error saving to KV:', err);
      // Continue to local file fallback
    }
  } else if (process.env.VERCEL) {
    console.warn(
      '[NOTICE] Vercel KV / Upstash Redis belum dikonfigurasi. Data profil disimpan sementara di /tmp. Hubungkan Vercel KV di dashboard Vercel untuk penyimpanan permanen.',
    );
  }

  // 2. Write to local filesystem
  try {
    const filePath = getLocalFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[File Store] Failed to save profile to disk:', err);
    throw new Error('Gagal menyimpan file profil ke penyimpanan server.');
  }
}

/**
 * Reset profile back to initial defaults.
 */
export async function resetStoredProfile(): Promise<ProfileData> {
  const kv = getKvConfig();

  if (kv) {
    try {
      await fetch(`${kv.url}/del/${KV_KEY}`, {
        headers: { Authorization: `Bearer ${kv.token}` },
      });
    } catch (err) {
      console.error('[KV Store] Error deleting KV key:', err);
    }
  }

  try {
    const filePath = getLocalFilePath();
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(initialProfileData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[File Store] Error resetting local file:', err);
  }

  return initialProfileData;
}
