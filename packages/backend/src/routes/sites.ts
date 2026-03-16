import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { createSiteSchema, updateSiteSchema, addWorkersSchema, paginationSchema } from '@field-mgmt/shared';

export const sitesRoutes = new Hono<Env>();

// GET /api/sites - List all sites with stats
sitesRoutes.get('/', authMiddleware, async (c) => {
  const sites = await c.env.DB.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM workers w WHERE w.site_id = s.id) as worker_count,
      (SELECT COUNT(*) FROM submissions sub WHERE sub.site_id = s.id) as submission_count
    FROM sites s
    ORDER BY s.created_at DESC
  `).all();

  return c.json(sites.results);
});

// POST /api/sites - Create site with workers
sitesRoutes.post('/', authMiddleware, zValidator('json', createSiteSchema), async (c) => {
  const { name, address, checklist_items, workers } = c.req.valid('json');
  const shortUrl = nanoid(8).toLowerCase();

  const siteResult = await c.env.DB.prepare(
    'INSERT INTO sites (name, address, short_url, checklist_items) VALUES (?, ?, ?, ?) RETURNING *'
  )
    .bind(name, address, shortUrl, JSON.stringify(checklist_items))
    .first();

  if (siteResult && workers && workers.length > 0) {
    const stmt = c.env.DB.prepare(
      'INSERT INTO workers (name, phone, site_id) VALUES (?, ?, ?)'
    );
    const batch = workers.map((w: { name: string; phone?: string }) =>
      stmt.bind(w.name, w.phone || null, siteResult.id)
    );
    await c.env.DB.batch(batch);
  }

  return c.json(siteResult, 201);
});

// GET /api/sites/by-url/:shortUrl - Public: get site for worker form
sitesRoutes.get('/by-url/:shortUrl', async (c) => {
  const shortUrl = c.req.param('shortUrl');

  const site = await c.env.DB.prepare(
    'SELECT * FROM sites WHERE short_url = ?'
  )
    .bind(shortUrl)
    .first();

  if (!site) {
    return c.json({ error: '현장을 찾을 수 없습니다' }, 404);
  }

  const workers = await c.env.DB.prepare(
    'SELECT id, name FROM workers WHERE site_id = ?'
  )
    .bind(site.id)
    .all();

  return c.json({
    ...site,
    checklist_items: JSON.parse(site.checklist_items as string),
    workers: workers.results,
  });
});

// GET /api/sites/:id - Get site detail
sitesRoutes.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');

  const site = await c.env.DB.prepare('SELECT * FROM sites WHERE id = ?')
    .bind(id)
    .first();

  if (!site) {
    return c.json({ error: '현장을 찾을 수 없습니다' }, 404);
  }

  const workers = await c.env.DB.prepare(
    'SELECT * FROM workers WHERE site_id = ?'
  )
    .bind(id)
    .all();

  const submissions = await c.env.DB.prepare(`
    SELECT sub.*, w.name as worker_name
    FROM submissions sub
    JOIN workers w ON sub.worker_id = w.id
    WHERE sub.site_id = ?
    ORDER BY sub.submitted_at DESC
    LIMIT 20
  `)
    .bind(id)
    .all();

  const submissionCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM submissions WHERE site_id = ?'
  ).bind(id).first();

  return c.json({
    ...site,
    checklist_items: JSON.parse(site.checklist_items as string),
    workers: workers.results,
    submissions: submissions.results,
    submission_total: (submissionCount?.count as number) || 0,
  });
});

// PUT /api/sites/:id - Update site
sitesRoutes.put('/:id', authMiddleware, zValidator('json', updateSiteSchema), async (c) => {
  const id = c.req.param('id');
  const { name, address, checklist_items } = c.req.valid('json');

  const result = await c.env.DB.prepare(
    'UPDATE sites SET name = ?, address = ?, checklist_items = ? WHERE id = ? RETURNING *'
  )
    .bind(name, address, JSON.stringify(checklist_items), id)
    .first();

  return c.json(result);
});

// DELETE /api/sites/:id - Delete site
sitesRoutes.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// GET /api/sites/:id/workers - List workers
sitesRoutes.get('/:id/workers', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const workers = await c.env.DB.prepare(
    'SELECT * FROM workers WHERE site_id = ?'
  )
    .bind(id)
    .all();
  return c.json(workers.results);
});

// POST /api/sites/:id/workers - Add workers
sitesRoutes.post('/:id/workers', authMiddleware, zValidator('json', addWorkersSchema), async (c) => {
  const siteId = c.req.param('id');
  const { workers } = c.req.valid('json');

  const stmt = c.env.DB.prepare(
    'INSERT INTO workers (name, phone, site_id) VALUES (?, ?, ?)'
  );
  const batch = workers.map((w: { name: string; phone?: string }) =>
    stmt.bind(w.name, w.phone || null, siteId)
  );
  await c.env.DB.batch(batch);

  return c.json({ success: true }, 201);
});

// GET /api/sites/:id/submissions - List submissions (paginated)
sitesRoutes.get('/:id/submissions', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const [submissions, countResult] = await Promise.all([
    c.env.DB.prepare(`
      SELECT sub.*, w.name as worker_name
      FROM submissions sub
      JOIN workers w ON sub.worker_id = w.id
      WHERE sub.site_id = ?
      ORDER BY sub.submitted_at DESC
      LIMIT ? OFFSET ?
    `)
      .bind(id, limit, offset)
      .all(),
    c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE site_id = ?'
    )
      .bind(id)
      .first(),
  ]);

  const total = (countResult?.count as number) || 0;

  return c.json({
    data: submissions.results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});
