import { Hono } from 'hono';
import type { Env } from '../index';

const DEMO_TOKEN = 'demo-token-2026';

export const authRoutes = new Hono<Env>();

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  const { username, password } = await c.req.json();

  const admin = await c.env.DB.prepare(
    'SELECT * FROM admins WHERE username = ? AND password = ?'
  )
    .bind(username, password)
    .first();

  if (!admin) {
    return c.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다' }, 401);
  }

  return c.json({ token: DEMO_TOKEN });
});

// POST /api/auth/logout
authRoutes.post('/logout', (c) => {
  return c.json({ success: true });
});
