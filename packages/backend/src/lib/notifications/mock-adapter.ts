import type { NotificationAdapter, NotificationPayload, NotificationResult } from './types';

export class MockNotificationAdapter implements NotificationAdapter {
  getName(): string {
    return 'mock';
  }

  async send(payload: NotificationPayload, db: D1Database): Promise<NotificationResult> {
    console.log(`[NOTIFICATION][mock] site=${payload.siteName} recipients=${payload.recipients.length} msg=${payload.message}`);

    const result = await db.prepare(
      'INSERT INTO notification_logs (site_id, message, recipient_count, provider, status) VALUES (?, ?, ?, ?, ?) RETURNING id'
    )
      .bind(payload.siteId, payload.message, payload.recipients.length, 'mock', 'sent')
      .first();

    return {
      success: true,
      provider: 'mock',
      logId: result?.id as number,
    };
  }
}
