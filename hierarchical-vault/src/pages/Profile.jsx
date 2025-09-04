import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Error from '../components/Error';
import {
  UserCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // إزالة خطأ الحقل عند التعديل
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // إزالة رسالة النجاح/الخطأ
    if (passwordMessage) {
      setPasswordMessage('');
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور الجديدة وتأكيدها غير متطابقين';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage('');

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        setPasswordMessage('تم تغيير كلمة المرور بنجاح');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setPasswordMessage(result.message);
      }
    } catch (error) {
      setPasswordMessage('حدث خطأ في تغيير كلمة المرور');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleInfo = (role) => {
    if (role === 'admin') {
      return {
        icon: <ShieldCheckIcon className="w-5 h-5" />,
        text: 'مدير النظام',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      };
    }
    return {
      icon: <UserIcon className="w-5 h-5" />,
      text: 'مستخدم عادي',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    };
  };

  const roleInfo = getRoleInfo(user?.role);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-gray-600 mt-1">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
      </div>

      {/* التبويبات */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            المعلومات الشخصية
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            الأمان
          </button>
        </nav>
      </div>

      {/* تبويب المعلومات الشخصية */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">معلومات الحساب</h3>
          
          <div className="space-y-6">
            {/* صورة المستخدم */}
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">{user?.username}</h4>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* معلومات الحساب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">اسم المستخدم</p>
                    <p className="text-gray-900">{user?.username}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">البريد الإلكتروني</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  {roleInfo.icon}
                  <div>
                    <p className="text-sm font-medium text-gray-600">الدور</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
                      {roleInfo.text}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">تاريخ الانضمام</p>
                    <p className="text-gray-900">
                      {new Date(user?.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ملاحظة */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> لتغيير معلوماتك الشخصية، يرجى التواصل مع مدير النظام.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* تبويب الأمان */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">تغيير كلمة المرور</h3>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* كلمة المرور الحالية */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الحالية *
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={`input-field ${passwordErrors.currentPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="أدخل كلمة المرور الحالية"
                disabled={isChangingPassword}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* كلمة المرور الجديدة */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة *
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={`input-field ${passwordErrors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="أدخل كلمة المرور الجديدة"
                disabled={isChangingPassword}
                minLength={6}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
              )}
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور الجديدة *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`input-field ${passwordErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                disabled={isChangingPassword}
                minLength={6}
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            {/* رسالة النجاح/الخطأ */}
            {passwordMessage && (
              <div className={`p-4 rounded-lg ${
                passwordMessage.includes('نجاح') 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {passwordMessage}
              </div>
            )}

            {/* زر الحفظ */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2 space-x-reverse"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <Loading size="sm" text="" />
                ) : (
                  <>
                    <KeyIcon className="w-5 h-5" />
                    <span>تغيير كلمة المرور</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;