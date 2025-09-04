import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService, reportService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import {
  DocumentTextIcon,
  FolderIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    reportsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await projectService.getById(id);
      const projectData = response.data.data;
      
      setProject(projectData);
      setReports(projectData.reports || []);
      setSummary(projectData.summary || {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        reportsCount: 0,
      });
    } catch (err) {
      setError('فشل في تحميل تفاصيل المشروع');
      console.error('خطأ في تحميل تفاصيل المشروع:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    try {
      await projectService.delete(project.id);
      navigate('/projects');
    } catch (err) {
      console.error('خطأ في حذف المشروع:', err);
      alert('فشل في حذف المشروع');
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'badge-success', text: 'نشط' },
      completed: { class: 'badge-info', text: 'مكتمل' },
      suspended: { class: 'badge-warning', text: 'معلق' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
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
        <Loading size="lg" text="جاري تحميل تفاصيل المشروع..." />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={fetchProjectDetails} />;
  }

  if (!project) {
    return <Error message="المشروع غير موجود" />;
  }

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link
            to="/projects"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← العودة للمشاريع
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 space-x-reverse">
              <DocumentTextIcon className="w-8 h-8 text-green-600" />
              <span>{project.name}</span>
              {getStatusBadge(project.status)}
            </h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          {user?.role === 'admin' && (
            <>
              <Link
                to={`/projects/${project.id}/edit`}
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

      {/* معلومات المشروع */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات المشروع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <FolderIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">الخزينة المرتبطة</p>
                <p className="text-gray-900">{project.vault_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">رصيد الخزينة</p>
                <p className="text-gray-900">{formatCurrency(project.vault_balance)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">عدد التقارير</p>
                <p className="text-gray-900">{summary.reportsCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">تاريخ الإنشاء</p>
                <p className="text-gray-900">{formatDate(project.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الإحصائيات المالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
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
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">صافي الربح</p>
              <div className="flex items-center space-x-2 space-x-reverse">
                {getProfitIcon(summary.netProfit)}
                <span className={`text-2xl font-bold ${getProfitColor(summary.netProfit)}`}>
                  {formatCurrency(summary.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* التقارير المالية */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">التقارير المالية</h3>
            <Link
              to="/reports/new"
              state={{ projectId: project.id, vaultId: project.vault_id }}
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
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                        {formatDate(report.report_date)} • {report.user_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <p
                      className={`text-sm font-medium ${
                        report.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {report.type === 'income' ? '+' : '-'}{formatCurrency(report.amount)}
                    </p>
                    <Link
                      to={`/reports/${report.id}`}
                      className="p-1 text-gray-400 hover:text-primary-600 rounded"
                      title="عرض التفاصيل"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">لا توجد تقارير مالية لهذا المشروع</p>
              <Link
                to="/reports/new"
                state={{ projectId: project.id, vaultId: project.vault_id }}
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
              هل أنت متأكد من حذف المشروع "{project.name}"؟ 
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

export default ProjectDetails;