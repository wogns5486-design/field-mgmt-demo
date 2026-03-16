import { Hono } from 'hono';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

export const statsRoutes = new Hono<Env>();

// GET /api/stats/daily-submissions?days=30
statsRoutes.get('/daily-submissions', authMiddleware, async (c) => {
  const days = Number(c.req.query('days') || '30');

  const results = await c.env.DB.prepare(`
    SELECT DATE(submitted_at) as date, COUNT(*) as count
    FROM submissions
    WHERE submitted_at >= datetime('now', ? || ' days')
    GROUP BY DATE(submitted_at)
    ORDER BY date
  `).bind(`-${days}`).all();

  return c.json(results.results);
});

// GET /api/stats/site-comparison
statsRoutes.get('/site-comparison', authMiddleware, async (c) => {
  const results = await c.env.DB.prepare(`
    SELECT s.id, s.name,
      COUNT(DISTINCT w.id) as worker_count,
      COUNT(DISTINCT sub.id) as submission_count
    FROM sites s
    LEFT JOIN workers w ON s.id = w.site_id
    LEFT JOIN submissions sub ON s.id = sub.site_id
    GROUP BY s.id
    ORDER BY submission_count DESC
    LIMIT 10
  `).all();

  return c.json(results.results);
});

// GET /api/stats/compliance-rate
statsRoutes.get('/compliance-rate', authMiddleware, async (c) => {
  const sites = await c.env.DB.prepare(`
    SELECT s.id, s.name, s.checklist_items
    FROM sites s
    ORDER BY s.name
  `).all();

  const result = [];

  for (const site of sites.results) {
    const submissions = await c.env.DB.prepare(
      'SELECT checklist_data FROM submissions WHERE site_id = ?'
    ).bind(site.id).all();

    if (submissions.results.length === 0) {
      result.push({ id: site.id, name: site.name, rate: 0, total: 0 });
      continue;
    }

    const items: string[] = JSON.parse(site.checklist_items as string);
    let totalChecks = 0;
    let totalPossible = 0;

    for (const sub of submissions.results) {
      const data: Record<string, boolean> = JSON.parse(sub.checklist_data as string);
      totalChecks += Object.values(data).filter(Boolean).length;
      totalPossible += items.length;
    }

    const rate = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0;
    result.push({ id: site.id, name: site.name, rate, total: submissions.results.length });
  }

  return c.json(result);
});
