import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import type { Env } from '../index';

export async function authMiddleware(c: Context<Env>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    c.set('admin', { sub: payload.sub as number, username: payload.username as string });
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: '유효하지 않은 토큰입니다' } }, 401);
  }

  await next();
}
