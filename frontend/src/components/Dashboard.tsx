import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Users, AlertCircle, TrendingUp, Eye, UserX, Edit, Trash2, RotateCcw, Send } from 'lucide-react';
import { DashboardStats, Campaign } from '../types';
import { campaignAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await campaignAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Грешка при зареждане на статистиките');
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    setActionLoading(campaignId);
    try {
      await campaignAPI.sendCampaign(campaignId);
      toast.success('Кампанията беше стартирана успешно');
      loadDashboardStats();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Грешка при стартиране на кампанията');
    } finally {
      setActionLoading(null);
    }
  };

  const resendCampaign = async (campaignId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изпратите отново тази кампания?')) {
      return;
    }

    setActionLoading(campaignId);
    try {
      await campaignAPI.resendCampaign(campaignId);
      toast.success('Кампанията се изпраща отново');
      loadDashboardStats();
    } catch (error) {
      console.error('Error resending campaign:', error);
      toast.error('Грешка при повторно изпращане');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteCampaign = async (campaignId: string, campaignName: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете кампанията "${campaignName}"? Това действие е необратимо.`)) {
      return;
    }

    setActionLoading(campaignId);
    try {
      await campaignAPI.deleteCampaign(campaignId);
      toast.success('Кампанията беше изтрита успешно');
      loadDashboardStats();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Грешка при изтриване на кампанията');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: 'Чака', className: 'bg-yellow-100 text-yellow-800' },
      running: { text: 'Изпълнява се', className: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Завършена', className: 'bg-green-100 text-green-800' },
      failed: { text: 'Неуспешна', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isActionDisabled = (campaignId: string) => {
    return actionLoading === campaignId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Няма данни</h3>
        <p className="text-gray-500">Не могат да се заредят статистиките.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Табло</h2>
        <p className="text-gray-600">Преглед на вашите имейл кампании и статистики</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Кампании</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Изпратени</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Неуспешни</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFailed}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Отворени</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOpened}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Отваряемост</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserX className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Отписани</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUnsubscribed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Последни кампании</h3>
        </div>

        {stats.recentCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900">Няма кампании</h4>
            <p className="text-gray-500 mb-4">Започнете, като създадете вашата първа кампания.</p>
            <Link
              to="/campaigns/new"
              className="btn btn-primary"
            >
              Създай кампания
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имейли
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Изпратени
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Отворени
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.stats.totalEmails}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.stats.sent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.stats.opened}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(campaign.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'pending' && (
                          <button
                            onClick={() => sendCampaign(campaign.id)}
                            disabled={isActionDisabled(campaign.id)}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Изпрати кампанията"
                          >
                            {actionLoading === campaign.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {(campaign.status === 'completed' || campaign.status === 'failed') && (
                          <button
                            onClick={() => resendCampaign(campaign.id)}
                            disabled={isActionDisabled(campaign.id)}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Изпрати отново"
                          >
                            {actionLoading === campaign.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {campaign.status !== 'running' && (
                          <>
                            <Link
                              to={`/campaigns/${campaign.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Редактирай"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            
                            <button
                              onClick={() => deleteCampaign(campaign.id, campaign.name)}
                              disabled={isActionDisabled(campaign.id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Изтрий"
                            >
                              {actionLoading === campaign.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;