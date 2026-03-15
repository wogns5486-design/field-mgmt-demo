import { Context, Next } from 'hono';
import type { Env } from '../index';

const DEMO_TOKEN = 'demo-token-2026';

export async function authMiddleware(c: Context<Env>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }

  const token = authHeader.slice(7);
  if (token !== DEMO_TOKEN) {
    return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
  }

  await next();
}
