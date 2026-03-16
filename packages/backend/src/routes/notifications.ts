import { Hono } from 'hono';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { MockNotificationAdapter } from '../lib/notifications';
import { notFound } from '../lib/errors';

export const notificationsRoutes = new Hono<Env>();

const adapter = new MockNotificationAdapter();

// POST /api/notifications/send - Send notification to site workers
notificationsRoutes.post('/send', authMiddleware, async (c) => {
  const { siteId, message } = await c.req.json();

  const site = await c.env.DB.prepare('SELECT * FROM sites WHERE id = ?')
    .bind(siteId)
    .first();

  if (!site) throw notFound('현장');

  const workers = await c.env.DB.prepare(
    'SELECT name, phone FROM workers WHERE site_id = ?'
  )
    .bind(siteId)
    .all();

  const result = await adapter.send(
    {
      siteId,
      siteName: site.name as string,
      message,
      recipients: workers.results as { name: string; phone?: string | null }[],
    },
    c.env.DB
  );

  return c.json(result, 201);
});

// GET /api/notifications/:siteId/logs - Get notification logs for a site
notificationsRoutes.get('/:siteId/logs', authMiddleware, async (c) => {
  const siteId = c.req.param('siteId');

  const logs = await c.env.DB.prepare(
    'SELECT * FROM notification_logs WHERE site_id = ? ORDER BY sent_at DESC LIMIT 50'
  )
    .bind(siteId)
    .all();

  return c.json(logs.results);
});
