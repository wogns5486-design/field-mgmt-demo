import { Hono } from 'hono';
import type { Env } from '../index';

export const submissionsRoutes = new Hono<Env>();

// POST /api/submissions - Public: submit checklist from worker form
submissionsRoutes.post('/', async (c) => {
  const { site_id, worker_id, checklist_data, text_note, photos } =
    await c.req.json();

  const result = await c.env.DB.prepare(
    'INSERT INTO submissions (site_id, worker_id, checklist_data, text_note, photos) VALUES (?, ?, ?, ?, ?) RETURNING *'
  )
    .bind(
      site_id,
      worker_id,
      JSON.stringify(checklist_data),
      text_note || '',
      JSON.stringify(photos || [])
    )
    .first();

  return c.json(result, 201);
});
