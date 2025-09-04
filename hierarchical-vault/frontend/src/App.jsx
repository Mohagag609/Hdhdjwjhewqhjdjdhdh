import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vaults from './pages/Vaults';
import VaultDetails from './pages/VaultDetails';
import VaultForm from './pages/VaultForm';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectForm from './pages/ProjectForm';
import Reports from './pages/Reports';
import ReportForm from './pages/ReportForm';
import Users from './pages/Users';
import Profile from './pages/Profile';
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
      <NotificationProvider>
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
              <Route path="vaults/:id" element={<VaultDetails />} />
              <Route path="vaults/new" element={<VaultForm />} />
              <Route path="vaults/:id/edit" element={<VaultForm />} />
              
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="projects/new" element={<ProjectForm />} />
              <Route path="projects/:id/edit" element={<ProjectForm />} />
              
              <Route path="reports" element={<Reports />} />
              <Route path="reports/new" element={<ReportForm />} />
              <Route path="reports/:id/edit" element={<ReportForm />} />
              
              <Route path="users" element={<Users />} />
              <Route path="profile" element={<Profile />} />
              
              {/* صفحة 404 */}
              <Route path="*" element={<div>الصفحة غير موجودة</div>} />
            </Route>
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;