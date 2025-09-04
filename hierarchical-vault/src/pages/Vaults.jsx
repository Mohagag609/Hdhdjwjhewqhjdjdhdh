import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Loading from '../components/Loading';
import Error from '../components/Error';
import EmptyState from '../components/EmptyState';
import {
  PlusIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const Vaults = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [vaults, setVaults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // بيانات وهمية للعرض
      const mockVaults = [
        {
          id: 1,
          name: 'الخزينة الرئيسية',
          description: 'الخزينة الرئيسية للنظام',
          balance: 10000,
          is_main: true,
          created_at: '2024-01-01T00:00:00Z',
          parent_name: null
        },
        {
          id: 2,
          name: 'خزينة التسويق',
          description: 'خزينة مخصصة لأنشطة التسويق',
          balance: 5000,
          is_main: false,
          created_at: '2024-01-02T00:00:00Z',
          parent_name: 'الخزينة الرئيسية'
        },
        {
          id: 3,
          name: 'خزينة التطوير',
          description: 'خزينة مخصصة لمشاريع التطوير',
          balance: 3000,
          is_main: false,
          created_at: '2024-01-03T00:00:00Z',
          parent_name: 'الخزينة الرئيسية'
        }
      ];

      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setVaults(mockVaults);

    } catch (error) {
      console.error('خطأ في تحميل الخزائن:', error);
      setError('فشل في تحميل الخزائن');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخزينة؟')) {
      try {
        // محاكاة حذف
        setVaults(vaults.filter(vault => vault.id !== id));
        showNotification('تم حذف الخزينة بنجاح', 'success');
      } catch (error) {
        showNotification('فشل في حذف الخزينة', 'error');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="جاري تحميل الخزائن..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Error message={error} onRetry={fetchVaults} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الخزائن</h1>
          <p className="text-gray-600">إدارة الخزائن الهرمية</p>
        </div>
        <Link
          to="/vaults/new"
          className="btn-primary flex items-center space-x-2 space-x-reverse"
        >
          <PlusIcon className="h-5 w-5" />
          <span>إضافة خزينة</span>
        </Link>
      </div>

      {/* قائمة الخزائن */}
      {vaults.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title="لا توجد خزائن"
          description="ابدأ بإنشاء خزينة جديدة"
          actionText="إضافة خزينة"
          actionLink="/vaults/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <div key={vault.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FolderIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{vault.name}</h3>
                    {vault.parent_name && (
                      <p className="text-sm text-gray-500">فرعية من: {vault.parent_name}</p>
                    )}
                  </div>
                </div>
                {vault.is_main && (
                  <span className="badge badge-info">رئيسية</span>
                )}
              </div>

              <p className="text-gray-600 mb-4">{vault.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">الرصيد</p>
                  <p className="text-xl font-bold text-gray-900">
                    {vault.balance.toLocaleString()} ر.س
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse">
                <Link
                  to={`/vaults/${vault.id}`}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>عرض</span>
                </Link>
                <Link
                  to={`/vaults/${vault.id}/edit`}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>تعديل</span>
                </Link>
                {!vault.is_main && (
                  <button
                    onClick={() => handleDelete(vault.id)}
                    className="btn-danger flex-1 flex items-center justify-center space-x-2 space-x-reverse"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>حذف</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vaults;