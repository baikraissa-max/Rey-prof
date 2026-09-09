import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-cache, no-store');
  return res.status(200).json({
    status: 'ok',
    environment: process.env.VERCEL ? 'vercel' : 'node',
    timestamp: new Date().toISOString(),
  });
}
