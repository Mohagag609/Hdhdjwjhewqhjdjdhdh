import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService, vaultService, projectService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import EmptyState from '../components/EmptyState';
import ExportButton from '../components/ExportButton';
import {
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    vault_id: '',
    project_id: '',
    start_date: '',
    end_date: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [reportsResponse, vaultsResponse, projectsResponse] = await Promise.all([
        reportService.getAll({
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
        }),
        vaultService.getAll(),
        projectService.getAll(),
      ]);

      setReports(reportsResponse.data.data);
      setPagination(reportsResponse.data.pagination);
      setVaults(vaultsResponse.data.data);
      setProjects(projectsResponse.data.data);
    } catch (err) {
      setError('فشل في تحميل التقارير');
      console.error('خطأ في تحميل التقارير:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      await reportService.delete(reportToDelete.id);
      setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (err) {
      console.error('خطأ في حذف التقرير:', err);
      alert('فشل في حذف التقرير');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      vault_id: '',
      project_id: '',
      start_date: '',
      end_date: '',
    });
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const getTypeBadge = (type) => {
    return type === 'income' ? (
      <span className="badge badge-success">إيراد</span>
    ) : (
      <span className="badge badge-danger">مصروف</span>
    );
  };

  const canEditReport = (report) => {
    return user?.role === 'admin' || report.user_id === user?.id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="جاري تحميل التقارير..." />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
          <p className="text-gray-600 mt-1">
            إدارة التقارير المالية والإيرادات والمصروفات
          </p>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <ExportButton
            data={reports}
            filename="financial-reports"
            title="التقارير المالية"
            columns={[
              { key: 'type', label: 'النوع', type: 'text' },
              { key: 'amount', label: 'المبلغ', type: 'currency' },
              { key: 'description', label: 'الوصف', type: 'text' },
              { key: 'vault_name', label: 'الخزينة', type: 'text' },
              { key: 'project_name', label: 'المشروع', type: 'text' },
              { key: 'report_date', label: 'التاريخ', type: 'date' },
              { key: 'user_name', label: 'المستخدم', type: 'text' },
            ]}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2 space-x-reverse"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>تصفية</span>
          </button>
          <Link
            to="/reports/new"
            className="btn-primary flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="w-5 h-5" />
            <span>إضافة تقرير جديد</span>
          </Link>
        </div>
      </div>

      {/* فلاتر البحث */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                النوع
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input-field"
              >
                <option value="">جميع الأنواع</option>
                <option value="income">إيراد</option>
                <option value="expense">مصروف</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الخزينة
              </label>
              <select
                value={filters.vault_id}
                onChange={(e) => handleFilterChange('vault_id', e.target.value)}
                className="input-field"
              >
                <option value="">جميع الخزائن</option>
                {vaults.map((vault) => (
                  <option key={vault.id} value={vault.id}>
                    {vault.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المشروع
              </label>
              <select
                value={filters.project_id}
                onChange={(e) => handleFilterChange('project_id', e.target.value)}
                className="input-field"
              >
                <option value="">جميع المشاريع</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 space-x-reverse mt-4">
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center space-x-2 space-x-reverse"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>مسح الفلاتر</span>
            </button>
          </div>
        </div>
      )}

      {/* قائمة التقارير */}
      {reports.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>النوع</th>
                  <th>المبلغ</th>
                  <th>الوصف</th>
                  <th>الخزينة</th>
                  <th>المشروع</th>
                  <th>التاريخ</th>
                  <th>المستخدم</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td>{getTypeBadge(report.type)}</td>
                    <td className="font-medium">
                      <span
                        className={
                          report.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {report.type === 'income' ? '+' : '-'}
                        {formatCurrency(report.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="max-w-xs truncate">
                        {report.description || 'بدون وصف'}
                      </div>
                    </td>
                    <td>{report.vault_name}</td>
                    <td>{report.project_name || '-'}</td>
                    <td>{formatDate(report.report_date)}</td>
                    <td>{report.user_name}</td>
                    <td>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Link
                          to={`/reports/${report.id}`}
                          className="p-1 text-gray-400 hover:text-primary-600 rounded"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        {canEditReport(report) && (
                          <>
                            <Link
                              to={`/reports/${report.id}/edit`}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                              title="تعديل"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(report)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="حذف"
                            >
                              <TrashIcon className="w-4 h-4" />
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
                  {pagination.total} تقرير
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <span className="px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-md">
                    {pagination.page} من {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          type="reports"
          title="لا توجد تقارير"
          description="لم يتم إنشاء أي تقارير مالية بعد"
          action={
            <Link to="/reports/new" className="btn-primary">
              إضافة تقرير جديد
            </Link>
          }
        />
      )}

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && reportToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذا التقرير المالي؟ 
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReportToDelete(null);
                }}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="btn-danger"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;