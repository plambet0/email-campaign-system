import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign, EmailLog, TrackingPixel } from '../common/interfaces';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import { emailUtils } from '../common/utils/email.utils';

@Injectable()
export class CampaignsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createCampaign(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    // Validate and clean emails
    const uniqueEmails = [...new Set(createCampaignDto.emails.map(email => email.trim().toLowerCase()))];
    
    // Filter out unsubscribed emails
    const validEmails = [];
    for (const email of uniqueEmails) {
      const isUnsubscribed = await this.databaseService.isEmailUnsubscribed(email);
      if (!isUnsubscribed) {
        validEmails.push(email);
      }
    }

    if (validEmails.length === 0) {
      throw new BadRequestException('No valid emails found (all may be unsubscribed)');
    }

    const campaign: Campaign = {
      id: uuidv4(),
      name: createCampaignDto.name,
      emails: validEmails,
      htmlTemplate: createCampaignDto.htmlTemplate,
      smtpConfig: createCampaignDto.smtpConfig,
      status: 'pending',
      createdAt: new Date(),
      stats: {
        totalEmails: validEmails.length,
        sent: 0,
        failed: 0,
        opened: 0,
        unsubscribed: 0,
      },
    };

    await this.databaseService.saveCampaign(campaign);
    return campaign;
  }

  async updateCampaign(id: string, updateData: Partial<CreateCampaignDto>): Promise<Campaign> {
    const campaign = await this.databaseService.getCampaignById(id);
    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    if (campaign.status === 'running') {
      throw new BadRequestException('Cannot edit campaign while it is running');
    }

    // Update campaign data
    if (updateData.name) {
      campaign.name = updateData.name;
    }

    if (updateData.htmlTemplate) {
      campaign.htmlTemplate = updateData.htmlTemplate;
    }

    if (updateData.smtpConfig) {
      campaign.smtpConfig = updateData.smtpConfig;
    }

    if (updateData.emails) {
      // Reprocess emails
      const uniqueEmails = [...new Set(updateData.emails.map(email => email.trim().toLowerCase()))];
      
      const validEmails = [];
      for (const email of uniqueEmails) {
        const isUnsubscribed = await this.databaseService.isEmailUnsubscribed(email);
        if (!isUnsubscribed) {
          validEmails.push(email);
        }
      }

      if (validEmails.length === 0) {
        throw new BadRequestException('No valid emails found (all may be unsubscribed)');
      }

      campaign.emails = validEmails;
      campaign.stats.totalEmails = validEmails.length;
    }

    // Reset stats for pending campaigns
    if (campaign.status === 'pending') {
      campaign.stats.sent = 0;
      campaign.stats.failed = 0;
      campaign.stats.opened = 0;
    }

    await this.databaseService.saveCampaign(campaign);
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaign = await this.databaseService.getCampaignById(id);
    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    if (campaign.status === 'running') {
      throw new BadRequestException('Cannot delete campaign while it is running');
    }

    // Delete campaign from database
    await this.databaseService.deleteCampaign(id);

    // Clean up related data
    await this.databaseService.deleteEmailLogsByCampaign(id);
    await this.databaseService.deleteTrackingPixelsByCampaign(id);
  }

  async resendCampaign(id: string): Promise<void> {
    const campaign = await this.databaseService.getCampaignById(id);
    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    if (campaign.status === 'running') {
      throw new BadRequestException('Campaign is already running');
    }

    // Reset campaign status and stats
    campaign.status = 'pending';
    campaign.stats.sent = 0;
    campaign.stats.failed = 0;
    campaign.stats.opened = 0;
    delete campaign.completedAt;

    await this.databaseService.saveCampaign(campaign);

    // Send the campaign
    await this.sendCampaign(id);
  }

  async sendCampaign(campaignId: string): Promise<void> {
    console.log('🚀 Starting campaign send process...');
    console.log('Campaign ID:', campaignId);

    const campaign = await this.databaseService.getCampaignById(campaignId);
    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    if (campaign.status !== 'pending') {
      throw new BadRequestException('Campaign is not in pending status');
    }

    console.log('📋 Campaign details:', {
      name: campaign.name,
      totalEmails: campaign.emails.length,
      emails: campaign.emails
    });

    // Update status to running
    campaign.status = 'running';
    await this.databaseService.saveCampaign(campaign);

    try {
      console.log('🔧 Creating SMTP transporter...');
      console.log('SMTP Config:', {
        host: campaign.smtpConfig.host,
        port: campaign.smtpConfig.port,
        user: campaign.smtpConfig.user,
        passLength: campaign.smtpConfig.pass?.length || 0
      });

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: campaign.smtpConfig.host,
        port: campaign.smtpConfig.port,
        secure: campaign.smtpConfig.port === 465,
        auth: {
          user: campaign.smtpConfig.user,
          pass: campaign.smtpConfig.pass,
        },
      });

      console.log('✉️ Starting to send emails...');

      // Send emails
      for (const email of campaign.emails) {
        try {
          console.log(`📧 Attempting to send to: ${email}`);
          
          const trackingId = uuidv4();
          const unsubscribeToken = uuidv4();
          
          // Create tracking pixel record
          const trackingPixel: TrackingPixel = {
            id: trackingId,
            campaignId: campaign.id,
            email,
            opened: false,
          };
          await this.databaseService.saveTrackingPixel(trackingPixel);

          // Process HTML template
          const processedHtml = emailUtils.processEmailTemplate(
            campaign.htmlTemplate,
            email,
            trackingId,
            unsubscribeToken,
            process.env.BACKEND_URL || 'http://localhost:3001'
          );

          // Send email
          const result = await transporter.sendMail({
            from: campaign.smtpConfig.user,
            to: email,
            subject: emailUtils.extractSubjectFromTemplate(campaign.htmlTemplate) || 'Email Campaign',
            html: processedHtml,
          });

          console.log(`✅ Successfully sent to: ${email}`, result.messageId);

          // Log success
          const log: EmailLog = {
            id: uuidv4(),
            campaignId: campaign.id,
            email,
            status: 'sent',
            sentAt: new Date(),
            trackingId,
          };
          await this.databaseService.saveEmailLog(log);
          campaign.stats.sent++;

        } catch (error) {
          console.error(`❌ Failed to send to ${email}:`, error.message);
          console.error('Full error:', error);
          
          // Log failure
          const log: EmailLog = {
            id: uuidv4(),
            campaignId: campaign.id,
            email,
            status: 'failed',
            error: error.message,
            sentAt: new Date(),
            trackingId: '',
          };
          await this.databaseService.saveEmailLog(log);
          campaign.stats.failed++;
        }
      }

      campaign.status = 'completed';
      campaign.completedAt = new Date();
      console.log('✅ Campaign completed successfully');
      
    } catch (error) {
      console.error('❌ Campaign failed with error:', error.message);
      console.error('Full error:', error);
      campaign.status = 'failed';
    }

    await this.databaseService.saveCampaign(campaign);
    console.log('💾 Campaign status saved');
  }

  async getCampaigns(): Promise<Campaign[]> {
    return this.databaseService.getCampaigns();
  }

  async getCampaignById(id: string): Promise<Campaign> {
    const campaign = await this.databaseService.getCampaignById(id);
    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }
    return campaign;
  }

  async getDashboardStats() {
    const campaigns = await this.databaseService.getCampaigns();
    const tracking = await this.databaseService.getTrackingPixels();
    const unsubscribed = await this.databaseService.getUnsubscribeRecords();

    const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0);
    const totalFailed = campaigns.reduce((sum, c) => sum + c.stats.failed, 0);
    const totalOpened = tracking.filter(t => t.opened).length;
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

    return {
      totalCampaigns: campaigns.length,
      totalSent,
      totalFailed,
      totalOpened,
      openRate: Math.round(openRate * 100) / 100,
      totalUnsubscribed: unsubscribed.length,
      recentCampaigns: campaigns
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };
  }
}