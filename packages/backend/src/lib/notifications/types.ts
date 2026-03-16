export interface NotificationPayload {
  siteId: number;
  siteName: string;
  message: string;
  recipients: { name: string; phone?: string | null }[];
}

export interface NotificationResult {
  success: boolean;
  provider: string;
  logId?: number;
  error?: string;
}

export interface NotificationAdapter {
  send(payload: NotificationPayload, db: D1Database): Promise<NotificationResult>;
  getName(): string;
}
