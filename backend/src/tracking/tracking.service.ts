import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TrackingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async trackOpen(trackingId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const pixel = await this.databaseService.getTrackingPixelById(trackingId);
    if (pixel && !pixel.opened) {
      pixel.opened = true;
      pixel.openedAt = new Date();
      pixel.ipAddress = ipAddress;
      pixel.userAgent = userAgent;
      await this.databaseService.saveTrackingPixel(pixel);

      // Update campaign stats
      const campaign = await this.databaseService.getCampaignById(pixel.campaignId);
      if (campaign) {
        campaign.stats.opened++;
        await this.databaseService.saveCampaign(campaign);
      }
    }
  }

  async getTrackingPixel(): Promise<Buffer> {
    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    return pixel;
  }
}