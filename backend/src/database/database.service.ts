import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Campaign, EmailLog, TrackingPixel, UnsubscribeRecord } from '../common/interfaces';

@Injectable()
export class DatabaseService {
  private readonly dataDir = join(process.cwd(), 'data');

  constructor() {
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  private async readJsonFile<T>(filename: string): Promise<T[]> {
    const filePath = join(this.dataDir, filename);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
    const filePath = join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return this.readJsonFile<Campaign>('campaigns.json');
  }

  async saveCampaign(campaign: Campaign): Promise<void> {
    const campaigns = await this.getCampaigns();
    const index = campaigns.findIndex(c => c.id === campaign.id);
    if (index >= 0) {
      campaigns[index] = campaign;
    } else {
      campaigns.push(campaign);
    }
    await this.writeJsonFile('campaigns.json', campaigns);
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    const campaigns = await this.getCampaigns();
    return campaigns.find(c => c.id === id) || null;
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaigns = await this.getCampaigns();
    const filteredCampaigns = campaigns.filter(c => c.id !== id);
    await this.writeJsonFile('campaigns.json', filteredCampaigns);
  }

  // Email logs
  async getEmailLogs(): Promise<EmailLog[]> {
    return this.readJsonFile<EmailLog>('email-logs.json');
  }

  async saveEmailLog(log: EmailLog): Promise<void> {
    const logs = await this.getEmailLogs();
    logs.push(log);
    await this.writeJsonFile('email-logs.json', logs);
  }

  async deleteEmailLogsByCampaign(campaignId: string): Promise<void> {
    const logs = await this.getEmailLogs();
    const filteredLogs = logs.filter(log => log.campaignId !== campaignId);
    await this.writeJsonFile('email-logs.json', filteredLogs);
  }

  // Tracking
  async getTrackingPixels(): Promise<TrackingPixel[]> {
    return this.readJsonFile<TrackingPixel>('tracking.json');
  }

  async saveTrackingPixel(pixel: TrackingPixel): Promise<void> {
    const pixels = await this.getTrackingPixels();
    const index = pixels.findIndex(p => p.id === pixel.id);
    if (index >= 0) {
      pixels[index] = pixel;
    } else {
      pixels.push(pixel);
    }
    await this.writeJsonFile('tracking.json', pixels);
  }

  async getTrackingPixelById(id: string): Promise<TrackingPixel | null> {
    const pixels = await this.getTrackingPixels();
    return pixels.find(p => p.id === id) || null;
  }

  async deleteTrackingPixelsByCampaign(campaignId: string): Promise<void> {
    const pixels = await this.getTrackingPixels();
    const filteredPixels = pixels.filter(pixel => pixel.campaignId !== campaignId);
    await this.writeJsonFile('tracking.json', filteredPixels);
  }

  // Unsubscribe
  async getUnsubscribeRecords(): Promise<UnsubscribeRecord[]> {
    return this.readJsonFile<UnsubscribeRecord>('unsubscribed.json');
  }

  async saveUnsubscribeRecord(record: UnsubscribeRecord): Promise<void> {
    const records = await this.getUnsubscribeRecords();
    const existingIndex = records.findIndex(r => r.email === record.email);
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    await this.writeJsonFile('unsubscribed.json', records);
  }

  async isEmailUnsubscribed(email: string): Promise<boolean> {
    const records = await this.getUnsubscribeRecords();
    return records.some(r => r.email === email);
  }
}