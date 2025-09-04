import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService, vaultService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

const ProjectForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const vaultId = location.state?.vaultId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vault_id: vaultId || '',
    status: 'active',
  });
  const [vaults, setVaults] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    }
    fetchVaults();
  }, [id]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getById(id);
      const project = response.data.data;
      setFormData({
        name: project.name,
        description: project.description || '',
        vault_id: project.vault_id,
        status: project.status,
      });
    } catch (err) {
      setError('فشل في تحميل بيانات المشروع');
      console.error('خطأ في تحميل المشروع:', err);
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

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المشروع مطلوب';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'اسم المشروع يجب أن يكون حرفين على الأقل';
    }

    if (!formData.vault_id) {
      newErrors.vault_id = 'الخزينة مطلوبة';
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
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        vault_id: parseInt(formData.vault_id),
      };

      if (isEdit) {
        await projectService.update(id, data);
      } else {
        await projectService.create(data);
      }

      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في حفظ المشروع');
      console.error('خطأ في حفظ المشروع:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="جاري تحميل بيانات المشروع..." />
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
            <DocumentTextIcon className="w-8 h-8 text-green-600" />
            <span>{isEdit ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</span>
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'قم بتعديل بيانات المشروع' : 'أدخل بيانات المشروع الجديد'}
          </p>
        </div>
      </div>

      {/* النموذج */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اسم المشروع */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              اسم المشروع *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="أدخل اسم المشروع"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* وصف المشروع */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              وصف المشروع
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`input-field resize-none ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="أدخل وصف المشروع (اختياري)"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 حرف
            </p>
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
            <p className="mt-1 text-xs text-gray-500">
              اختر الخزينة التي سيرتبط بها هذا المشروع
            </p>
          </div>

          {/* حالة المشروع */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              حالة المشروع
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
              disabled={isSubmitting}
            >
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="suspended">معلق</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              حدد الحالة الحالية للمشروع
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
                  <span>{isEdit ? 'حفظ التغييرات' : 'إنشاء المشروع'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;