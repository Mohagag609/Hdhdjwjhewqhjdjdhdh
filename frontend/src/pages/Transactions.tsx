import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import apiService from '../services/api';
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Search,
  Calendar,
  Download
} from 'lucide-react';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    treasury_id: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getTransactions(filters);
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setError(response.message || 'فشل في جلب المعاملات');
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في جلب المعاملات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filters.page]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadTransactions();
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      treasury_id: '',
      start_date: '',
      end_date: '',
      page: 1,
      limit: 20
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-5 w-5 text-success-600" />;
      case 'withdrawal':
        return <TrendingDown className="h-5 w-5 text-danger-600" />;
      case 'transfer':
        return <ArrowUpDown className="h-5 w-5 text-primary-600" />;
      default:
        return <ArrowUpDown className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'إيداع';
      case 'withdrawal':
        return 'سحب';
      case 'transfer':
        return 'تحويل';
      default:
        return type;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <span className="badge badge-success">إيداع</span>;
      case 'withdrawal':
        return <span className="badge badge-danger">سحب</span>;
      case 'transfer':
        return <span className="badge badge-info">تحويل</span>;
      default:
        return <span className="badge badge-secondary">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المعاملات المالية</h1>
          <p className="text-gray-600">عرض وإدارة جميع المعاملات المالية</p>
        </div>
        <button className="btn btn-primary flex items-center">
          <Download className="h-5 w-5 ml-2" />
          تصدير التقرير
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 ml-2" />
            فلاتر البحث
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                نوع المعاملة
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="mt-1 input"
              >
                <option value="">جميع الأنواع</option>
                <option value="deposit">إيداع</option>
                <option value="withdrawal">سحب</option>
                <option value="transfer">تحويل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                من تاريخ
              </label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
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
                value={filters.end_date}
                onChange={handleFilterChange}
                className="mt-1 input"
              />
            </div>

            <div className="flex items-end space-x-2 space-x-reverse">
              <button
                onClick={handleSearch}
                className="btn btn-primary flex items-center"
              >
                <Search className="h-4 w-4 ml-2" />
                بحث
              </button>
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary"
              >
                مسح
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

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            قائمة المعاملات ({pagination.total})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">نوع المعاملة</th>
                <th className="table-header-cell">الخزينة</th>
                <th className="table-header-cell">المبلغ</th>
                <th className="table-header-cell">الوصف</th>
                <th className="table-header-cell">المستخدم</th>
                <th className="table-header-cell">التاريخ</th>
                <th className="table-header-cell">رقم المرجع</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 ml-2"></div>
                      جاري التحميل...
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8 text-gray-500">
                    لا توجد معاملات
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <div className="mr-2">
                          {getTransactionTypeBadge(transaction.type)}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.treasury_name}
                        </div>
                        {transaction.from_treasury_name && (
                          <div className="text-sm text-gray-500">
                            من: {transaction.from_treasury_name}
                          </div>
                        )}
                        {transaction.to_treasury_name && (
                          <div className="text-sm text-gray-500">
                            إلى: {transaction.to_treasury_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className={`font-semibold ${
                        transaction.type === 'deposit' ? 'text-success-600' :
                        transaction.type === 'withdrawal' ? 'text-danger-600' :
                        'text-primary-600'
                      }`}>
                        {transaction.type === 'withdrawal' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="max-w-xs truncate">
                        {transaction.description || '-'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {transaction.user_name}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {formatDate(transaction.created_at)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-500">
                        {transaction.reference_number || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
                {pagination.total} نتيجة
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                  صفحة {pagination.page} من {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;