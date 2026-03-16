import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { SignJWT } from 'jose';
import type { Env } from '../index';
import { verifyPassword } from '../lib/crypto';
import { loginSchema } from '@field-mgmt/shared';

export const authRoutes = new Hono<Env>();

// POST /api/auth/login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json');

  const admin = await c.env.DB.prepare(
    'SELECT * FROM admins WHERE username = ?'
  )
    .bind(username)
    .first();

  if (!admin) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: '아이디 또는 비밀번호가 올바르지 않습니다' } }, 401);
  }

  const passwordValid = await verifyPassword(password, admin.password as string);
  if (!passwordValid) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: '아이디 또는 비밀번호가 올바르지 않습니다' } }, 401);
  }

  const secret = new TextEncoder().encode(c.env.JWT_SECRET);
  const token = await new SignJWT({ sub: admin.id, username: admin.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  return c.json({ token });
});

// POST /api/auth/logout
authRoutes.post('/logout', (c) => {
  return c.json({ success: true });
});
