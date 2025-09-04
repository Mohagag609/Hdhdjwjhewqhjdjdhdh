import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vaultService, projectService, reportService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import {
  FolderIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vaults: 0,
    projects: 0,
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [vaultsResponse, projectsResponse, reportsResponse, statsResponse] = await Promise.all([
        vaultService.getAll(),
        projectService.getAll(),
        reportService.getAll({ limit: 5 }),
        reportService.getStats(),
      ]);

      setStats({
        vaults: vaultsResponse.data.data.length,
        projects: projectsResponse.data.data.length,
        totalIncome: statsResponse.data.data.totalIncome,
        totalExpense: statsResponse.data.data.totalExpense,
        netProfit: statsResponse.data.data.netProfit,
      });

      setRecentReports(reportsResponse.data.data);
    } catch (err) {
      setError('فشل في تحميل بيانات لوحة التحكم');
      console.error('خطأ في تحميل بيانات لوحة التحكم:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const getProfitColor = (profit) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProfitIcon = (profit) => {
    if (profit > 0) return <ArrowUpIcon className="w-5 h-5" />;
    if (profit < 0) return <ArrowDownIcon className="w-5 h-5" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="جاري تحميل لوحة التحكم..." />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* ترحيب */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          مرحباً، {user?.username}!
        </h1>
        <p className="text-gray-600 mt-1">
          مرحباً بك في نظام خزينة هرمية لإدارة مواردك المالية
        </p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الخزائن</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vaults}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/vaults"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              عرض الخزائن →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المشاريع</p>
              <p className="text-2xl font-bold text-gray-900">{stats.projects}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/projects"
              className="text-sm text-green-600 hover:text-green-500 font-medium"
            >
              عرض المشاريع →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="w-8 h-8 text-red-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* صافي الربح */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">صافي الربح</h3>
            <p className="text-sm text-gray-600">الفرق بين الإيرادات والمصروفات</p>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            {getProfitIcon(stats.netProfit)}
            <span className={`text-3xl font-bold ${getProfitColor(stats.netProfit)}`}>
              {formatCurrency(stats.netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* التقارير الأخيرة */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">التقارير الأخيرة</h3>
            <Link
              to="/reports"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              عرض جميع التقارير
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentReports.length > 0 ? (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        report.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {report.description || 'بدون وصف'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.vault_name} • {new Date(report.report_date).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-medium ${
                        report.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {report.type === 'income' ? '+' : '-'}{formatCurrency(report.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد تقارير مالية بعد</p>
              <Link
                to="/reports"
                className="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                إضافة تقرير جديد
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;