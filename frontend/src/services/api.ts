import axios from 'axios';
import { Campaign, CreateCampaignRequest, DashboardStats } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const campaignAPI = {
  // Create new campaign
  createCampaign: async (data: CreateCampaignRequest): Promise<Campaign> => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },

  // Update campaign
  updateCampaign: async (id: string, data: Partial<CreateCampaignRequest>): Promise<Campaign> => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  // Delete campaign
  deleteCampaign: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },

  // Send campaign
  sendCampaign: async (campaignId: string): Promise<void> => {
    await api.post(`/campaigns/${campaignId}/send`);
  },

  // Resend campaign
  resendCampaign: async (campaignId: string): Promise<void> => {
    await api.post(`/campaigns/${campaignId}/resend`);
  },

  // Get all campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await api.get('/campaigns');
    return response.data;
  },

  // Get campaign by ID
  getCampaign: async (campaignId: string): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${campaignId}`);
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/campaigns/dashboard');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};