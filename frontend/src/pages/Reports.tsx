import React, { useState, useEffect } from 'react';
import { FinancialSummary, TreasuryPerformance, TrendData } from 'types';
import apiService from 'services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports: React.FC = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [treasuryPerformance, setTreasuryPerformance] = useState<TreasuryPerformance[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  const loadReports = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [summaryRes, performanceRes, trendsRes] = await Promise.all([
        apiService.getFinancialSummary(dateRange),
        apiService.getTreasuryPerformance(dateRange),
        apiService.getTrends({ period: 'daily', ...dateRange })
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data.summary);
      }

      if (performanceRes.success && performanceRes.data) {
        setTreasuryPerformance(performanceRes.data);
      }

      if (trendsRes.success && trendsRes.data) {
        setTrends(trendsRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في جلب التقارير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    loadReports();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  // Chart data for trends
  const trendsChartData = {
    labels: trends.map(trend => formatDate(trend.period)),
    datasets: [
      {
        label: 'الإيداعات',
        data: trends.map(trend => trend.total_deposits),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
      {
        label: 'السحوبات',
        data: trends.map(trend => trend.total_withdrawals),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
      {
        label: 'التحويلات',
        data: trends.map(trend => trend.total_transfers),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  // Chart data for treasury performance
  const treasuryChartData = {
    labels: treasuryPerformance.map(t => t.name),
    datasets: [
      {
        label: 'الإيداعات',
        data: treasuryPerformance.map(t => t.total_deposits),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'السحوبات',
        data: treasuryPerformance.map(t => t.total_withdrawals),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  // Chart data for balance distribution
  const balanceChartData = {
    labels: treasuryPerformance.map(t => t.name),
    datasets: [
      {
        data: treasuryPerformance.map(t => t.balance),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'التقارير المالية',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
          <p className="text-gray-600">تحليل شامل للأداء المالي</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className={`h-5 w-5 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button className="btn btn-primary flex items-center">
            <Download className="h-5 w-5 ml-2" />
            تصدير
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 ml-2" />
            نطاق التاريخ
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                من تاريخ
              </label>
              <input
                type="date"
                name="start_date"
                value={dateRange.start_date}
                onChange={handleDateRangeChange}
                className="mt-1 input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                إلى تاريخ
              </label>
              <input
                type="date"
                name="end_date"
                value={dateRange.end_date}
                onChange={handleDateRangeChange}
                className="mt-1 input"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadReports}
                className="btn btn-primary w-full"
              >
                تطبيق الفلتر
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">إجمالي الرصيد</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.total_balance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-success-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">إجمالي الإيداعات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.total_deposits)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-danger-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">إجمالي السحوبات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.total_withdrawals)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-warning-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">إجمالي المعاملات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.total_transactions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              اتجاهات المعاملات
            </h3>
          </div>
          <div className="card-body">
            {trends.length > 0 ? (
              <Line data={trendsChartData} options={chartOptions} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد بيانات للعرض
              </div>
            )}
          </div>
        </div>

        {/* Treasury Performance Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              أداء الخزائن
            </h3>
          </div>
          <div className="card-body">
            {treasuryPerformance.length > 0 ? (
              <Bar data={treasuryChartData} options={chartOptions} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد بيانات للعرض
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              توزيع الأرصدة
            </h3>
          </div>
          <div className="card-body">
            {treasuryPerformance.length > 0 ? (
              <Doughnut data={balanceChartData} options={chartOptions} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد بيانات للعرض
              </div>
            )}
          </div>
        </div>

        {/* Treasury Performance Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              تفاصيل أداء الخزائن
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">الخزينة</th>
                  <th className="table-header-cell">الرصيد</th>
                  <th className="table-header-cell">المعاملات</th>
                  <th className="table-header-cell">التدفق الصافي</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {treasuryPerformance.map((treasury) => (
                  <tr key={treasury.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">
                        {treasury.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {treasury.type === 'main' ? 'رئيسية' : 'فرعية'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(treasury.balance)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {treasury.transaction_count}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className={`font-semibold ${
                        treasury.net_flow >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {treasury.net_flow >= 0 ? '+' : ''}{formatCurrency(treasury.net_flow)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;