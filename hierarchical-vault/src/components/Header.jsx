import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // تخطي تسجيل الخروج - المستخدم يبقى مسجل دخول
    console.log('تسجيل الخروج معطل - المستخدم يبقى مسجل دخول');
  };

  const navigation = [
    { name: 'الرئيسية', href: '/', current: true },
    { name: 'الخزائن', href: '/vaults', current: false },
    { name: 'المشاريع', href: '/projects', current: false },
    { name: 'التقارير', href: '/reports', current: false },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'المستخدمين', href: '/users', current: false });
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الشعار */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">خ</span>
              </div>
              <span className="text-xl font-bold text-gray-900">خزينة هرمية</span>
            </Link>
          </div>

          {/* القائمة الرئيسية - للشاشات الكبيرة */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-8 space-x-reverse">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* منطقة المستخدم */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* قائمة المستخدم */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 space-x-reverse text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-2"
                >
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">{user?.username}</span>
                </button>

                {/* قائمة منسدلة للمستخدم */}
                {isProfileOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                        {user?.role === 'admin' ? 'أدمن' : 'مستخدم'}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Cog6ToothIcon className="w-4 h-4 ml-2" />
                      الإعدادات
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>

              {/* زر القائمة المتنقلة */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>

        {/* القائمة المتنقلة */}
        {isAuthenticated && isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;