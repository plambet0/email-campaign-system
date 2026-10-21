import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Users, AlertCircle, TrendingUp, Eye, UserX, Edit, Trash2, RotateCcw, Send, FlaskConical } from 'lucide-react';
import { DashboardStats, Campaign } from '../types';
import { campaignAPI } from '../services/api';
import toast from 'react-hot-toast';

const PAGE_SIZE = 5;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [testEmails, setTestEmails] = useState<Record<string, string>>({});
  const [testLoading, setTestLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, campaignsData] = await Promise.all([
        campaignAPI.getDashboardStats(),
        campaignAPI.getCampaigns(),
      ]);
      setStats(statsData);
      setCampaigns(
        [...campaignsData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setCurrentPage(1);
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
      loadDashboardData();
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
      loadDashboardData();
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
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Грешка при изтриване на кампанията');
    } finally {
      setActionLoading(null);
    }
  };

  const sendTestEmail = async (campaignId: string) => {
    const email = (testEmails[campaignId] || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Въведете валиден имейл за тест');
      return;
    }

    setTestLoading(campaignId);
    try {
      await campaignAPI.sendTestEmail(campaignId, email);
      toast.success(`Тестов имейл изпратен до ${email}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Грешка при изпращане на тестов имейл');
    } finally {
      setTestLoading(null);
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

  const totalPages = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCampaigns = campaigns.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

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

      {/* Campaigns */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Кампании</h3>
          {campaigns.length > 0 && (
            <p className="text-sm text-gray-500">
              {campaigns.length} общо · страница {safePage} от {totalPages}
            </p>
          )}
        </div>

        {campaigns.length === 0 ? (
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
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Име
                    </th>
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
                      Тест имейл
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCampaigns.map((campaign) => (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 min-w-[260px]">
                          <input
                            type="email"
                            value={testEmails[campaign.id] || ''}
                            onChange={(e) =>
                              setTestEmails((prev) => ({
                                ...prev,
                                [campaign.id]: e.target.value,
                              }))
                            }
                            placeholder="test@email.com"
                            disabled={campaign.status === 'running' || testLoading === campaign.id}
                            className="form-input !py-1.5 !text-sm w-40"
                          />
                          <button
                            type="button"
                            onClick={() => sendTestEmail(campaign.id)}
                            disabled={
                              campaign.status === 'running' ||
                              testLoading === campaign.id ||
                              isActionDisabled(campaign.id)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Изпрати тестов имейл"
                          >
                            {testLoading === campaign.id ? (
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-amber-700"></div>
                            ) : (
                              <FlaskConical className="w-3.5 h-3.5" />
                            )}
                            Тест
                          </button>
                        </div>
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Предишна
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          page === safePage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safePage === totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следваща
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;