export interface Campaign {
  id: string;
  name: string;
  emails: string[];
  htmlTemplate: string;
  smtpConfig: SmtpConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
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

export interface DashboardStats {
  totalCampaigns: number;
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  openRate: number;
  totalUnsubscribed: number;
  recentCampaigns: Campaign[];
}

export interface CreateCampaignRequest {
  name: string;
  emails: string[];
  htmlTemplate: string;
  smtpConfig: SmtpConfig;
}