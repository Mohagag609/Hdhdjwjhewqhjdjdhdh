import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService, vaultService, projectService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import {
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CheckIcon,
  FolderIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const ReportForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const vaultId = location.state?.vaultId;
  const projectId = location.state?.projectId;

  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    vault_id: vaultId || '',
    project_id: projectId || '',
    report_date: new Date().toISOString().split('T')[0],
  });
  const [vaults, setVaults] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchReport();
    }
    fetchVaults();
  }, [id]);

  useEffect(() => {
    if (formData.vault_id) {
      fetchProjectsByVault(formData.vault_id);
    } else {
      setFilteredProjects([]);
      setFormData(prev => ({ ...prev, project_id: '' }));
    }
  }, [formData.vault_id]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await reportService.getById(id);
      const report = response.data.data;
      setFormData({
        type: report.type,
        amount: report.amount.toString(),
        description: report.description || '',
        vault_id: report.vault_id.toString(),
        project_id: report.project_id ? report.project_id.toString() : '',
        report_date: report.report_date,
      });
    } catch (err) {
      setError('فشل في تحميل بيانات التقرير');
      console.error('خطأ في تحميل التقرير:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVaults = async () => {
    try {
      const response = await vaultService.getAll();
      setVaults(response.data.data);
    } catch (err) {
      console.error('خطأ في تحميل الخزائن:', err);
    }
  };

  const fetchProjectsByVault = async (vaultId) => {
    try {
      const response = await projectService.getByVault(vaultId);
      setFilteredProjects(response.data.data);
    } catch (err) {
      console.error('خطأ في تحميل مشاريع الخزينة:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // إزالة خطأ الحقل عند التعديل
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // إزالة رسالة الخطأ العامة
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'نوع التقرير مطلوب';
    }

    if (!formData.amount) {
      newErrors.amount = 'المبلغ مطلوب';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون رقماً أكبر من صفر';
    }

    if (!formData.vault_id) {
      newErrors.vault_id = 'الخزينة مطلوبة';
    }

    if (!formData.report_date) {
      newErrors.report_date = 'تاريخ التقرير مطلوب';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'الوصف يجب أن يكون أقل من 500 حرف';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || null,
        vault_id: parseInt(formData.vault_id),
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
      };

      if (isEdit) {
        await reportService.update(id, data);
      } else {
        await reportService.create(data);
      }

      navigate('/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في حفظ التقرير');
      console.error('خطأ في حفظ التقرير:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/reports');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="جاري تحميل بيانات التقرير..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* العنوان */}
      <div className="flex items-center space-x-4 space-x-reverse">
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 space-x-reverse">
            <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
            <span>{isEdit ? 'تعديل التقرير المالي' : 'إضافة تقرير مالي جديد'}</span>
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'قم بتعديل بيانات التقرير المالي' : 'أدخل بيانات التقرير المالي الجديد'}
          </p>
        </div>
      </div>

      {/* النموذج */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* نوع التقرير */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التقرير *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer ${
                formData.type === 'income' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center">
                    {formData.type === 'income' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">إيراد</p>
                    <p className="text-xs text-gray-500">دخول أموال</p>
                  </div>
                </div>
              </label>

              <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer ${
                formData.type === 'expense' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center">
                    {formData.type === 'expense' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">مصروف</p>
                    <p className="text-xs text-gray-500">خروج أموال</p>
                  </div>
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {/* المبلغ */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ *
            </label>
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                className={`input-field pr-10 ${errors.amount ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">ر.س</span>
              </div>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* الخزينة */}
          <div>
            <label htmlFor="vault_id" className="block text-sm font-medium text-gray-700 mb-2">
              الخزينة *
            </label>
            <select
              id="vault_id"
              name="vault_id"
              value={formData.vault_id}
              onChange={handleChange}
              className={`input-field ${errors.vault_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">اختر الخزينة</option>
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.name} {vault.is_main && '(رئيسية)'}
                </option>
              ))}
            </select>
            {errors.vault_id && (
              <p className="mt-1 text-sm text-red-600">{errors.vault_id}</p>
            )}
          </div>

          {/* المشروع */}
          <div>
            <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-2">
              المشروع
            </label>
            <select
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              className="input-field"
              disabled={isSubmitting || !formData.vault_id}
            >
              <option value="">بدون مشروع</option>
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              اختر مشروعاً مرتبطاً بهذا التقرير (اختياري)
            </p>
          </div>

          {/* تاريخ التقرير */}
          <div>
            <label htmlFor="report_date" className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ التقرير *
            </label>
            <input
              id="report_date"
              name="report_date"
              type="date"
              value={formData.report_date}
              onChange={handleChange}
              className={`input-field ${errors.report_date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.report_date && (
              <p className="mt-1 text-sm text-red-600">{errors.report_date}</p>
            )}
          </div>

          {/* وصف التقرير */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              وصف التقرير
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`input-field resize-none ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="أدخل وصف للتقرير (اختياري)"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 حرف
            </p>
          </div>

          {/* رسالة الخطأ العامة */}
          {error && (
            <Error message={error} className="p-4" />
          )}

          {/* أزرار التحكم */}
          <div className="flex items-center justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2 space-x-reverse"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading size="sm" text="" />
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>{isEdit ? 'حفظ التغييرات' : 'إنشاء التقرير'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;