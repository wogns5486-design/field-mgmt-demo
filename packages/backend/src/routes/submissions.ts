import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../index';
import { createSubmissionSchema } from '@field-mgmt/shared';

export const submissionsRoutes = new Hono<Env>();

// POST /api/submissions - Public: submit checklist from worker form
submissionsRoutes.post('/', zValidator('json', createSubmissionSchema), async (c) => {
  const { site_id, worker_id, checklist_data, text_note, photos } =
    c.req.valid('json');

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
