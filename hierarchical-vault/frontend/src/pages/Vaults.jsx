import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vaultService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import EmptyState from '../components/EmptyState';
import {
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const Vaults = () => {
  const { user } = useAuth();
  const [vaults, setVaults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vaultToDelete, setVaultToDelete] = useState(null);

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await vaultService.getHierarchy();
      setVaults(response.data.data);
    } catch (err) {
      setError('فشل في تحميل الخزائن');
      console.error('خطأ في تحميل الخزائن:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (vault) => {
    setVaultToDelete(vault);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vaultToDelete) return;

    try {
      await vaultService.delete(vaultToDelete.id);
      setVaults(prev => prev.filter(v => v.id !== vaultToDelete.id));
      setShowDeleteModal(false);
      setVaultToDelete(null);
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

  const renderVaultTree = (vaults, level = 0) => {
    return vaults.map((vault) => (
      <div key={vault.id} className="space-y-2">
        <div
          className={`flex items-center justify-between p-4 rounded-lg border ${
            vault.is_main
              ? 'bg-primary-50 border-primary-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
          style={{ marginRight: `${level * 20}px` }}
        >
          <div className="flex items-center space-x-3 space-x-reverse">
            <FolderIcon className="w-6 h-6 text-gray-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{vault.name}</h3>
              {vault.description && (
                <p className="text-xs text-gray-500">{vault.description}</p>
              )}
              <div className="flex items-center space-x-4 space-x-reverse mt-1">
                <span className="text-sm font-medium text-gray-700">
                  الرصيد: {formatCurrency(vault.balance)}
                </span>
                {vault.children_count > 0 && (
                  <span className="text-xs text-gray-500">
                    {vault.children_count} خزينة فرعية
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Link
              to={`/vaults/${vault.id}`}
              className="p-2 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-100"
              title="عرض التفاصيل"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
            
            {user?.role === 'admin' && !vault.is_main && (
              <>
                <Link
                  to={`/vaults/${vault.id}/edit`}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                  title="تعديل"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(vault)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                  title="حذف"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* الخزائن الفرعية */}
        {vault.children && vault.children.length > 0 && (
          <div className="space-y-2">
            {renderVaultTree(vault.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="جاري تحميل الخزائن..." />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={fetchVaults} />;
  }

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الخزائن</h1>
          <p className="text-gray-600 mt-1">
            إدارة الخزائن الرئيسية والفرعية
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link
            to="/vaults/new"
            className="btn-primary flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="w-5 h-5" />
            <span>إضافة خزينة جديدة</span>
          </Link>
        )}
      </div>

      {/* قائمة الخزائن */}
      {vaults.length > 0 ? (
        <div className="space-y-4">
          {renderVaultTree(vaults)}
        </div>
      ) : (
        <EmptyState
          type="vaults"
          title="لا توجد خزائن"
          description="لم يتم إنشاء أي خزائن بعد"
          action={
            user?.role === 'admin' ? (
              <Link to="/vaults/new" className="btn-primary">
                إضافة خزينة جديدة
              </Link>
            ) : null
          }
        />
      )}

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && vaultToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف الخزينة "{vaultToDelete.name}"؟ 
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVaultToDelete(null);
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

export default Vaults;