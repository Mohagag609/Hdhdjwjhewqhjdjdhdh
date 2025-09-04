import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import EmptyState from '../components/EmptyState';
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getAll();
      setUsers(response.data.data);
    } catch (err) {
      setError('فشل في تحميل المستخدمين');
      console.error('خطأ في تحميل المستخدمين:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await userService.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('خطأ في تحميل الإحصائيات:', err);
    }
  };

  const handleDelete = async (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await userService.delete(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchStats(); // تحديث الإحصائيات
    } catch (err) {
      console.error('خطأ في حذف المستخدم:', err);
      alert('فشل في حذف المستخدم');
    }
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const confirmChangePassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      await userService.changePassword(selectedUser.id, { newPassword });
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('تم تغيير كلمة المرور بنجاح');
    } catch (err) {
      console.error('خطأ في تغيير كلمة المرور:', err);
      alert('فشل في تغيير كلمة المرور');
    }
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <span className="badge badge-info flex items-center space-x-1 space-x-reverse">
        <ShieldCheckIcon className="w-3 h-3" />
        <span>أدمن</span>
      </span>
    ) : (
      <span className="badge badge-success flex items-center space-x-1 space-x-reverse">
        <UserIcon className="w-3 h-3" />
        <span>مستخدم</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="جاري تحميل المستخدمين..." />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="space-y-6">
      {/* العنوان والإحصائيات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-600 mt-1">
            إدارة المستخدمين والأدوار والصلاحيات
          </p>
        </div>
        <div className="btn-primary flex items-center space-x-2 space-x-reverse">
          <PlusIcon className="w-5 h-5" />
          <span>إضافة مستخدم جديد</span>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المديرين</p>
              <p className="text-2xl font-bold text-purple-600">{stats.adminCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <UserIcon className="w-8 h-8 text-green-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المستخدمين العاديين</p>
              <p className="text-2xl font-bold text-green-600">{stats.userCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة المستخدمين */}
      {users.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الدور</th>
                  <th>تاريخ الإنشاء</th>
                  <th>آخر تحديث</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-blue-600">(أنت)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      <p className="text-sm text-gray-500">{formatDate(user.created_at)}</p>
                    </td>
                    <td>
                      <p className="text-sm text-gray-500">{formatDate(user.updated_at)}</p>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleChangePassword(user)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="تغيير كلمة المرور"
                        >
                          <KeyIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                          title="تعديل"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="حذف"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          type="users"
          title="لا يوجد مستخدمين"
          description="لم يتم إنشاء أي مستخدمين بعد"
          action={
            <div className="btn-primary">
              إضافة مستخدم جديد
            </div>
          }
        />
      )}

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف المستخدم "{selectedUser.username}"؟ 
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
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

      {/* نافذة تغيير كلمة المرور */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              تغيير كلمة المرور
            </h3>
            <p className="text-gray-600 mb-4">
              كلمة المرور الجديدة للمستخدم "{selectedUser.username}"
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="أدخل كلمة المرور الجديدة"
                minLength={6}
              />
            </div>
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                }}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={confirmChangePassword}
                disabled={!newPassword || newPassword.length < 6}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تغيير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;