import { Hono } from 'hono';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

export const workersRoutes = new Hono<Env>();

// DELETE /api/workers/:id - Remove worker
workersRoutes.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM workers WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});
