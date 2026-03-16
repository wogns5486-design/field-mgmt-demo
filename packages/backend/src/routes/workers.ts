import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { updateWorkerSchema } from '@field-mgmt/shared';
import { notFound, conflict } from '../lib/errors';

export const workersRoutes = new Hono<Env>();

// PUT /api/workers/:id - Update worker
workersRoutes.put('/:id', authMiddleware, zValidator('json', updateWorkerSchema), async (c) => {
  const id = c.req.param('id');
  const { name, phone } = c.req.valid('json');

  const result = await c.env.DB.prepare(
    'UPDATE workers SET name = ?, phone = ? WHERE id = ? RETURNING *'
  )
    .bind(name, phone || null, id)
    .first();

  if (!result) {
    throw notFound('작업자');
  }

  return c.json(result);
});

// DELETE /api/workers/:id - Remove worker (with submission guard)
workersRoutes.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');

  // Check if worker has submissions
  const submissions = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM submissions WHERE worker_id = ?'
  )
    .bind(id)
    .first();

  if (submissions && (submissions.count as number) > 0) {
    throw conflict('제출 이력이 있는 작업자는 삭제할 수 없습니다');
  }

  const result = await c.env.DB.prepare('DELETE FROM workers WHERE id = ? RETURNING id').bind(id).first();
  if (!result) {
    throw notFound('작업자');
  }

  return c.json({ success: true });
});
