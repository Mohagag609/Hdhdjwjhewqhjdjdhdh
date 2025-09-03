import React, { useState, useEffect } from 'react';
import { Treasury, TreasuryFormData } from '../../types';
import apiService from '../../services/api';
import { useTreasury } from '../contexts/TreasuryContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wallet, 
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Treasuries: React.FC = () => {
  const { treasuries, refreshTreasuries } = useTreasury();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTreasury, setEditingTreasury] = useState<Treasury | null>(null);
  const [formData, setFormData] = useState<TreasuryFormData>({
    name: '',
    type: 'sub',
    parent_id: undefined,
    description: '',
    balance: 0,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (editingTreasury) {
        response = await apiService.updateTreasury(editingTreasury.id, formData);
      } else {
        response = await apiService.createTreasury(formData);
      }

      if (response.success) {
        setSuccess(editingTreasury ? 'تم تحديث الخزينة بنجاح' : 'تم إنشاء الخزينة بنجاح');
        await refreshTreasuries();
        setShowCreateModal(false);
        setEditingTreasury(null);
        setFormData({
          name: '',
          type: 'sub',
          parent_id: undefined,
          description: '',
          balance: 0,
        });
      } else {
        setError(response.message || 'حدث خطأ في العملية');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في العملية');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (treasury: Treasury) => {
    setEditingTreasury(treasury);
    setFormData({
      name: treasury.name,
      type: treasury.type,
      parent_id: treasury.parent_id,
      description: treasury.description || '',
      balance: treasury.balance,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (treasury: Treasury) => {
    if (window.confirm(`هل أنت متأكد من حذف الخزينة "${treasury.name}"؟`)) {
      try {
        const response = await apiService.updateTreasury(treasury.id, { 
          ...treasury, 
          is_active: false 
        });
        
        if (response.success) {
          setSuccess('تم حذف الخزينة بنجاح');
          await refreshTreasuries();
        } else {
          setError(response.message || 'حدث خطأ في حذف الخزينة');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ في حذف الخزينة');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingTreasury(null);
    setFormData({
      name: '',
      type: 'sub',
      parent_id: undefined,
      description: '',
      balance: 0,
    });
    setError('');
  };

  const mainTreasuries = treasuries.filter(t => t.type === 'main');
  const subTreasuries = treasuries.filter(t => t.type === 'sub');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الخزائن</h1>
          <p className="text-gray-600">إدارة الخزائن الرئيسية والفرعية</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة خزينة جديدة
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="mr-3">
              <h3 className="text-sm font-medium text-red-800">خطأ</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="mr-3">
              <h3 className="text-sm font-medium text-green-800">نجح</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Treasuries */}
      {mainTreasuries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">الخزائن الرئيسية</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mainTreasuries.map((treasury) => (
              <div key={treasury.id} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="h-8 w-8 text-primary-600" />
                      <div className="mr-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {treasury.name}
                        </h3>
                        <span className="badge badge-info">خزينة رئيسية</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(treasury.balance)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {treasury.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {treasury.description}
                    </p>
                  )}
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit(treasury)}
                      className="btn btn-secondary flex items-center"
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </button>
                    <button
                      onClick={() => window.location.href = `/treasuries/${treasury.id}`}
                      className="btn btn-primary flex items-center"
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Treasuries */}
      {subTreasuries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">الخزائن الفرعية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subTreasuries.map((treasury) => (
              <div key={treasury.id} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="h-8 w-8 text-gray-600" />
                      <div className="mr-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {treasury.name}
                        </h3>
                        <span className="badge badge-secondary">خزينة فرعية</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(treasury.balance)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {treasury.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {treasury.description}
                    </p>
                  )}
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit(treasury)}
                      className="btn btn-secondary flex items-center"
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </button>
                    <button
                      onClick={() => window.location.href = `/treasuries/${treasury.id}`}
                      className="btn btn-primary flex items-center"
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      عرض
                    </button>
                    <button
                      onClick={() => handleDelete(treasury)}
                      className="btn btn-danger flex items-center"
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingTreasury ? 'تعديل الخزينة' : 'إضافة خزينة جديدة'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        اسم الخزينة
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 input"
                        placeholder="أدخل اسم الخزينة"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        نوع الخزينة
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="mt-1 input"
                        required
                      >
                        <option value="sub">خزينة فرعية</option>
                        <option value="main">خزينة رئيسية</option>
                      </select>
                    </div>

                    {formData.type === 'sub' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          الخزينة الرئيسية
                        </label>
                        <select
                          name="parent_id"
                          value={formData.parent_id || ''}
                          onChange={handleInputChange}
                          className="mt-1 input"
                        >
                          <option value="">اختر الخزينة الرئيسية</option>
                          {mainTreasuries.map(treasury => (
                            <option key={treasury.id} value={treasury.id}>
                              {treasury.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        الرصيد الابتدائي
                      </label>
                      <input
                        type="number"
                        name="balance"
                        value={formData.balance}
                        onChange={handleInputChange}
                        className="mt-1 input"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        الوصف
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 input"
                        rows={3}
                        placeholder="أدخل وصف للخزينة"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'جاري الحفظ...' : (editingTreasury ? 'تحديث' : 'إنشاء')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Treasuries;