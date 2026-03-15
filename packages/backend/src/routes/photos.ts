import { Hono } from 'hono';
import type { Env } from '../index';

export const photosRoutes = new Hono<Env>();

// GET /api/photos/:key+ - R2 proxy: serve photo by key
photosRoutes.get('/*', async (c) => {
  const key = c.req.path.replace('/api/photos/', '');

  const object = await c.env.STORAGE.get(key);

  if (!object) {
    return c.json({ error: '사진을 찾을 수 없습니다' }, 404);
  }

  const headers = new Headers();
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType || 'image/jpeg'
  );
  headers.set('Cache-Control', 'public, max-age=31536000');

  return new Response(object.body, { headers });
});
