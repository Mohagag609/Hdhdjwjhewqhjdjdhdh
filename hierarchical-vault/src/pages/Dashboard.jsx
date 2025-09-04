import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Error from '../components/Error';
import Chart from '../components/Chart';
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
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // بيانات وهمية للعرض
      const mockData = {
        vaults: 3,
        projects: 5,
        totalIncome: 15000,
        totalExpense: 8000,
        netProfit: 7000,
        recentReports: [
          {
            id: 1,
            type: 'income',
            amount: 5000,
            description: 'مبيعات المنتج أ',
            report_date: '2024-01-15',
            vault_name: 'الخزينة الرئيسية'
          },
          {
            id: 2,
            type: 'expense',
            amount: 2000,
            description: 'مصاريف التسويق',
            report_date: '2024-01-14',
            vault_name: 'خزينة التسويق'
          },
          {
            id: 3,
            type: 'income',
            amount: 3000,
            description: 'مبيعات المنتج ب',
            report_date: '2024-01-13',
            vault_name: 'الخزينة الرئيسية'
          }
        ],
        chartData: [
          { name: 'الخزينة الرئيسية', balance: 10000 },
          { name: 'خزينة التسويق', balance: 5000 },
          { name: 'خزينة التطوير', balance: 3000 }
        ]
      };

      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        vaults: mockData.vaults,
        projects: mockData.projects,
        totalIncome: mockData.totalIncome,
        totalExpense: mockData.totalExpense,
        netProfit: mockData.netProfit,
      });

      setRecentReports(mockData.recentReports);
      setChartData(mockData.chartData);

    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
      setError('فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="جاري تحميل لوحة التحكم..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Error message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ترحيب */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          مرحباً، {user?.username || 'المدير'}
        </h1>
        <p className="text-gray-600">
          مرحباً بك في نظام إدارة الخزائن الهرمية
        </p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">الخزائن</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vaults}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">المشاريع</p>
              <p className="text-2xl font-bold text-gray-900">{stats.projects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalIncome.toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowDownIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.totalExpense.toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">أرصدة الخزائن</h3>
          <Chart data={chartData} type="bar" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">توزيع الإيرادات والمصروفات</h3>
          <Chart 
            data={[
              { name: 'الإيرادات', value: stats.totalIncome, color: '#10b981' },
              { name: 'المصروفات', value: stats.totalExpense, color: '#ef4444' }
            ]} 
            type="pie" 
          />
        </div>
      </div>

      {/* التقارير الأخيرة */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">التقارير الأخيرة</h3>
          <Link
            to="/reports"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            عرض الكل
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className={`w-2 h-2 rounded-full ${
                  report.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.description}</p>
                  <p className="text-xs text-gray-500">{report.vault_name} • {report.report_date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  report.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {report.type === 'income' ? '+' : '-'}{report.amount.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/vaults"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <FolderIcon className="h-6 w-6 text-blue-600 ml-3" />
            <div>
              <p className="font-medium text-gray-900">إدارة الخزائن</p>
              <p className="text-sm text-gray-500">عرض وإدارة الخزائن</p>
            </div>
          </div>
        </Link>

        <Link
          to="/projects"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-green-600 ml-3" />
            <div>
              <p className="font-medium text-gray-900">إدارة المشاريع</p>
              <p className="text-sm text-gray-500">عرض وإدارة المشاريع</p>
            </div>
          </div>
        </Link>

        <Link
          to="/reports"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-purple-600 ml-3" />
            <div>
              <p className="font-medium text-gray-900">التقارير المالية</p>
              <p className="text-sm text-gray-500">عرض التقارير المالية</p>
            </div>
          </div>
        </Link>

        <Link
          to="/users"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-orange-600 ml-3" />
            <div>
              <p className="font-medium text-gray-900">إدارة المستخدمين</p>
              <p className="text-sm text-gray-500">عرض وإدارة المستخدمين</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;