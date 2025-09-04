import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
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

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* جميع الصفحات متاحة بدون تسجيل دخول */}
              <Route path="/" element={<Layout />}>
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