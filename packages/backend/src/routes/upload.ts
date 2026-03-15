import { Hono } from 'hono';
import type { Env } from '../index';

export const uploadRoutes = new Hono<Env>();

// POST /api/upload - Upload photo to R2
uploadRoutes.post('/', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json({ error: '파일이 없습니다' }, 400);
  }

  const key = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${file.name.split('.').pop() || 'jpg'}`;

  await c.env.STORAGE.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || 'image/jpeg',
    },
  });

  // Return proxy URL instead of direct R2 URL
  return c.json({ url: `/api/photos/${key}` });
});
