import { Hono } from 'hono';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import * as XLSX from 'xlsx';

export const exportRoutes = new Hono<Env>();

// GET /api/export/:siteId/csv - Download submissions as CSV
exportRoutes.get('/:siteId/csv', authMiddleware, async (c) => {
  const siteId = c.req.param('siteId');

  const site = await c.env.DB.prepare('SELECT * FROM sites WHERE id = ?')
    .bind(siteId)
    .first();

  if (!site) {
    return c.json({ error: '현장을 찾을 수 없습니다' }, 404);
  }

  const checklistItems: string[] = JSON.parse(site.checklist_items as string);

  const submissions = await c.env.DB.prepare(`
    SELECT sub.*, w.name as worker_name
    FROM submissions sub
    JOIN workers w ON sub.worker_id = w.id
    WHERE sub.site_id = ?
    ORDER BY sub.submitted_at DESC
  `)
    .bind(siteId)
    .all();

  // Build CSV header
  const headers = ['작업자명', '제출일시', ...checklistItems, '비고', '사진수'];
  const csvRows = [headers.map(escapeCsv).join(',')];

  // Build CSV rows
  for (const sub of submissions.results) {
    const checklist: Record<string, boolean> = JSON.parse(
      sub.checklist_data as string
    );
    const photos: string[] = JSON.parse(sub.photos as string);

    const row = [
      sub.worker_name as string,
      sub.submitted_at as string,
      ...checklistItems.map((item) => (checklist[item] ? 'O' : 'X')),
      sub.text_note as string,
      photos.length.toString(),
    ];
    csvRows.push(row.map(escapeCsv).join(','));
  }

  // BOM + CSV content for Excel compatibility
  const bom = '\uFEFF';
  const csvContent = bom + csvRows.join('\n');

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="submissions-${siteId}.csv"`,
    },
  });
});

// GET /api/export/:siteId/xlsx - Download submissions as XLSX
exportRoutes.get('/:siteId/xlsx', authMiddleware, async (c) => {
  const siteId = c.req.param('siteId');

  const site = await c.env.DB.prepare('SELECT * FROM sites WHERE id = ?')
    .bind(siteId)
    .first();

  if (!site) {
    return c.json({ error: { code: 'NOT_FOUND', message: '현장을 찾을 수 없습니다' } }, 404);
  }

  const checklistItems: string[] = JSON.parse(site.checklist_items as string);

  const submissions = await c.env.DB.prepare(`
    SELECT sub.*, w.name as worker_name
    FROM submissions sub
    JOIN workers w ON sub.worker_id = w.id
    WHERE sub.site_id = ?
    ORDER BY sub.submitted_at DESC
  `)
    .bind(siteId)
    .all();

  // Build worksheet data
  const headers = ['작업자명', '제출일시', ...checklistItems, '비고', '사진수'];
  const rows = submissions.results.map((sub) => {
    const checklist: Record<string, boolean> = JSON.parse(sub.checklist_data as string);
    const photos: string[] = JSON.parse(sub.photos as string);
    return [
      sub.worker_name as string,
      sub.submitted_at as string,
      ...checklistItems.map((item) => (checklist[item] ? 'O' : 'X')),
      sub.text_note as string,
      photos.length,
    ];
  });

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-fit column widths
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length * 2, 12) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '제출내역');

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="submissions-${siteId}.xlsx"`,
    },
  });
});

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
