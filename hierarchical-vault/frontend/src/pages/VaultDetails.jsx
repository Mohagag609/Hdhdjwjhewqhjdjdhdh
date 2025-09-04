import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vaultService, projectService, reportService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import {
  FolderIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const VaultDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vault, setVault] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    reportsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchVaultDetails();
  }, [id]);

  const fetchVaultDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [vaultResponse, projectsResponse, reportsResponse, statsResponse] = await Promise.all([
        vaultService.getById(id),
        projectService.getByVault(id),
        reportService.getAll({ vault_id: id, limit: 10 }),
        reportService.getStats({ vault_id: id }),
      ]);

      setVault(vaultResponse.data.data);
      setProjects(projectsResponse.data.data);
      setReports(reportsResponse.data.data);
      setStats(statsResponse.data.data);
    } catch (err) {
      setError('فشل في تحميل تفاصيل الخزينة');
      console.error('خطأ في تحميل تفاصيل الخزينة:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!vault) return;

    try {
      await vaultService.delete(vault.id);
      navigate('/vaults');
    } catch (err) {
      console.error('خطأ في حذف الخزينة:', err);
      alert('فشل في حذف الخزينة');
    }
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
        <Loading size="lg" text="جاري تحميل تفاصيل الخزينة..." />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={fetchVaultDetails} />;
  }

  if (!vault) {
    return <Error message="الخزينة غير موجودة" />;
  }

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link
            to="/vaults"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← العودة للخزائن
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 space-x-reverse">
              <FolderIcon className="w-8 h-8 text-blue-600" />
              <span>{vault.name}</span>
            </h1>
            <p className="text-gray-600 mt-1">{vault.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          {user?.role === 'admin' && !vault.is_main && (
            <>
              <Link
                to={`/vaults/${vault.id}/edit`}
                className="btn-secondary flex items-center space-x-2 space-x-reverse"
              >
                <PencilIcon className="w-5 h-5" />
                <span>تعديل</span>
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger flex items-center space-x-2 space-x-reverse"
              >
                <TrashIcon className="w-5 h-5" />
                <span>حذف</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الرصيد الحالي</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(vault.balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
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
            <CurrencyDollarIcon className="w-8 h-8 text-red-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">عدد التقارير</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reportsCount}</p>
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

      {/* المشاريع المرتبطة */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">المشاريع المرتبطة</h3>
            {user?.role === 'admin' && (
              <Link
                to="/projects/new"
                state={{ vaultId: vault.id }}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <PlusIcon className="w-5 h-5" />
                <span>إضافة مشروع</span>
              </Link>
            )}
          </div>
        </div>
        <div className="p-6">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <span className={`badge ${
                      project.status === 'active' ? 'badge-success' :
                      project.status === 'completed' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {project.status === 'active' ? 'نشط' :
                       project.status === 'completed' ? 'مكتمل' : 'معلق'}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {project.reports_count} تقرير
                    </span>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">لا توجد مشاريع مرتبطة بهذه الخزينة</p>
              {user?.role === 'admin' && (
                <Link
                  to="/projects/new"
                  state={{ vaultId: vault.id }}
                  className="btn-primary"
                >
                  إضافة مشروع جديد
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* التقارير الأخيرة */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">التقارير الأخيرة</h3>
            <Link
              to="/reports/new"
              state={{ vaultId: vault.id }}
              className="btn-primary flex items-center space-x-2 space-x-reverse"
            >
              <PlusIcon className="w-5 h-5" />
              <span>إضافة تقرير</span>
            </Link>
          </div>
        </div>
        <div className="p-6">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
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
                        {report.project_name && `${report.project_name} • `}
                        {formatDate(report.report_date)} • {report.user_name}
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
              <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">لا توجد تقارير مالية لهذه الخزينة</p>
              <Link
                to="/reports/new"
                state={{ vaultId: vault.id }}
                className="btn-primary"
              >
                إضافة تقرير جديد
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف الخزينة "{vault.name}"؟ 
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
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

export default VaultDetails;