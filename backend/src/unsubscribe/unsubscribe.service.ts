import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UnsubscribeRecord } from '../common/interfaces';

@Injectable()
export class UnsubscribeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async unsubscribeEmail(
    email: string,
    campaignId?: string,
    reason?: string,
  ): Promise<void> {
    if (!email || !this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email address');
    }

    const record: UnsubscribeRecord = {
      email: email.toLowerCase().trim(),
      unsubscribedAt: new Date(),
      campaignId,
      reason,
    };

    await this.databaseService.saveUnsubscribeRecord(record);

    // Update campaign stats if campaign ID provided
    if (campaignId) {
      const campaign = await this.databaseService.getCampaignById(campaignId);
      if (campaign) {
        campaign.stats.unsubscribed++;
        await this.databaseService.saveCampaign(campaign);
      }
    }
  }

  async isUnsubscribed(email: string): Promise<boolean> {
    return this.databaseService.isEmailUnsubscribed(email);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}