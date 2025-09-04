import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vaultService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import {
  FolderIcon,
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const VaultForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const parentVaultId = location.state?.parentVaultId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: parentVaultId || '',
  });
  const [vaults, setVaults] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchVault();
    }
    fetchVaults();
  }, [id]);

  const fetchVault = async () => {
    try {
      setIsLoading(true);
      const response = await vaultService.getById(id);
      const vault = response.data.data;
      setFormData({
        name: vault.name,
        description: vault.description || '',
        parent_id: vault.parent_id || '',
      });
    } catch (err) {
      setError('فشل في تحميل بيانات الخزينة');
      console.error('خطأ في تحميل الخزينة:', err);
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
      newErrors.name = 'اسم الخزينة مطلوب';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'اسم الخزينة يجب أن يكون حرفين على الأقل';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'الوصف يجب أن يكون أقل من 500 حرف';
    }

    // التحقق من عدم اختيار الخزينة نفسها كخزينة أب (في حالة التعديل)
    if (isEdit && formData.parent_id && parseInt(formData.parent_id) === parseInt(id)) {
      newErrors.parent_id = 'لا يمكن اختيار الخزينة نفسها كخزينة أب';
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
        parent_id: formData.parent_id || null,
      };

      if (isEdit) {
        await vaultService.update(id, data);
      } else {
        await vaultService.create(data);
      }

      navigate('/vaults');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في حفظ الخزينة');
      console.error('خطأ في حفظ الخزينة:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/vaults');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="جاري تحميل بيانات الخزينة..." />
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
            <FolderIcon className="w-8 h-8 text-blue-600" />
            <span>{isEdit ? 'تعديل الخزينة' : 'إضافة خزينة جديدة'}</span>
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'قم بتعديل بيانات الخزينة' : 'أدخل بيانات الخزينة الجديدة'}
          </p>
        </div>
      </div>

      {/* النموذج */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اسم الخزينة */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              اسم الخزينة *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="أدخل اسم الخزينة"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* وصف الخزينة */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              وصف الخزينة
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`input-field resize-none ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="أدخل وصف الخزينة (اختياري)"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 حرف
            </p>
          </div>

          {/* الخزينة الأب */}
          <div>
            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
              الخزينة الأب
            </label>
            <select
              id="parent_id"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className={`input-field ${errors.parent_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">بدون خزينة أب (خزينة رئيسية)</option>
              {vaults
                .filter(vault => !vault.is_main && (!isEdit || vault.id !== parseInt(id)))
                .map((vault) => (
                  <option key={vault.id} value={vault.id}>
                    {vault.name}
                  </option>
                ))}
            </select>
            {errors.parent_id && (
              <p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              اختر خزينة أب لإنشاء خزينة فرعية، أو اتركها فارغة لإنشاء خزينة رئيسية
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
                  <span>{isEdit ? 'حفظ التغييرات' : 'إنشاء الخزينة'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultForm;