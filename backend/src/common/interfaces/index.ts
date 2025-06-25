export interface Campaign {
  id: string;
  name: string;
  emails: string[];
  htmlTemplate: string;
  smtpConfig: SmtpConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  stats: CampaignStats;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export interface CampaignStats {
  totalEmails: number;
  sent: number;
  failed: number;
  opened: number;
  unsubscribed: number;
}

export interface EmailLog {
  id: string;
  campaignId: string;
  email: string;
  status: 'sent' | 'failed';
  error?: string;
  sentAt: Date;
  trackingId: string;
}

export interface TrackingPixel {
  id: string;
  campaignId: string;
  email: string;
  opened: boolean;
  openedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface UnsubscribeRecord {
  email: string;
  unsubscribedAt: Date;
  campaignId?: string;
  reason?: string;
}