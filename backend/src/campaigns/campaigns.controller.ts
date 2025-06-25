import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(createCampaignDto);
  }

  @Put(':id')
  async updateCampaign(@Param('id') id: string, @Body() updateData: Partial<CreateCampaignDto>) {
    return this.campaignsService.updateCampaign(id, updateData);
  }

  @Delete(':id')
  async deleteCampaign(@Param('id') id: string) {
    await this.campaignsService.deleteCampaign(id);
    return { message: 'Campaign deleted successfully' };
  }

  @Post(':id/send')
  async sendCampaign(@Param('id') id: string) {
    await this.campaignsService.sendCampaign(id);
    return { message: 'Campaign sending started' };
  }

  @Post(':id/resend')
  async resendCampaign(@Param('id') id: string) {
    await this.campaignsService.resendCampaign(id);
    return { message: 'Campaign resending started' };
  }

  @Get()
  async getCampaigns() {
    return this.campaignsService.getCampaigns();
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.campaignsService.getDashboardStats();
  }

  @Get(':id')
  async getCampaignById(@Param('id') id: string) {
    return this.campaignsService.getCampaignById(id);
  }
}