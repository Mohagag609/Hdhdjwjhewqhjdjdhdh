import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TreasuryProvider } from './contexts/TreasuryContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Treasuries from './pages/Treasuries';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Activity from './pages/Activity';

function App() {
  return (
    <AuthProvider>
      <TreasuryProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="treasuries" element={<Treasuries />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="reports" element={<Reports />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="activity" element={<Activity />} />
              </Route>
              
              {/* Redirect to dashboard for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </TreasuryProvider>
    </AuthProvider>
  );
}

export default App;
