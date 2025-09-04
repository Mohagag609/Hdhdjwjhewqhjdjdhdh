import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vaults from './pages/Vaults';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Loading from './components/Loading';

// مكون للحماية من الوصول غير المصرح به
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="جاري التحميل..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// مكون للصفحات التي تتطلب تسجيل دخول
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="جاري التحميل..." />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* الصفحات العامة */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* الصفحات المحمية */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="vaults" element={<Vaults />} />
              <Route path="projects" element={<Projects />} />
              <Route path="reports" element={<Reports />} />
              
              {/* صفحات إضافية يمكن إضافتها لاحقاً */}
              <Route path="vaults/:id" element={<div>تفاصيل الخزينة</div>} />
              <Route path="vaults/new" element={<div>إضافة خزينة جديدة</div>} />
              <Route path="vaults/:id/edit" element={<div>تعديل الخزينة</div>} />
              
              <Route path="projects/:id" element={<div>تفاصيل المشروع</div>} />
              <Route path="projects/new" element={<div>إضافة مشروع جديد</div>} />
              <Route path="projects/:id/edit" element={<div>تعديل المشروع</div>} />
              
              <Route path="reports/:id" element={<div>تفاصيل التقرير</div>} />
              <Route path="reports/new" element={<div>إضافة تقرير جديد</div>} />
              <Route path="reports/:id/edit" element={<div>تعديل التقرير</div>} />
              
              <Route path="profile" element={<div>الملف الشخصي</div>} />
              
              {/* صفحة 404 */}
              <Route path="*" element={<div>الصفحة غير موجودة</div>} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;