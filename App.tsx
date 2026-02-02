
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { AppLoader } from '@/components/AppLoader';
import { OmniSearch } from '@/components/layout/OmniSearch';
import { RealtimeNotificationHandler } from '@/components/RealtimeNotificationHandler';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import AdminLayout from '@/layouts/AdminLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Lazy components
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const ProfileSelector = lazy(() => import('@/pages/ProfileSelector'));
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'));
const ProfessorDashboard = lazy(() => import('@/pages/ProfessorDashboard'));

// SaaS Admin Pages
const SaaSAdminDashboard = lazy(() => import('@/pages/admin/SaaSAdminDashboard'));
const FinanceManager = lazy(() => import('@/pages/admin/FinanceManager'));
const StaffDirectory = lazy(() => import('@/pages/admin/StaffDirectory'));
const TenantManager = lazy(() => import('@/pages/admin/TenantManager'));

// God Mode Pages
const GodModeDashboard = lazy(() => import('@/pages/admin/GodModeDashboard'));
const GodConsole = lazy(() => import('@/pages/admin/GodConsole'));
const SecurityAudit = lazy(() => import('@/pages/admin/SecurityAudit'));
const SystemExplorer = lazy(() => import('@/pages/admin/SystemExplorer'));

const RootHandler = () => {
  const { user, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user && user.email === 'serparenan@gmail.com') return <ProfileSelector />;
  if (user) return <Navigate to={role === 'professor' ? '/teacher' : '/student'} replace />;
  return <LandingPage />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppLoader>
          <Suspense fallback={<LoadingScreen />}>
            <OmniSearch />
            <RealtimeNotificationHandler />
            <Routes>
              <Route path="/" element={<RootHandler />} />
              <Route path="/login" element={<Login />} />
              
              {/* SAAS BUSINESS PANEL */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'saas_admin_global']}><AdminLayout mode="business" /></ProtectedRoute>}>
                <Route index element={<Navigate to="business" replace />} />
                <Route path="business" element={<SaaSAdminDashboard />} />
                <Route path="finance" element={<FinanceManager />} />
                <Route path="hr" element={<StaffDirectory />} />
                <Route path="tenants" element={<TenantManager />} />
              </Route>

              {/* GOD MODE SYSTEM PANEL */}
              <Route path="/system" element={<ProtectedRoute allowedRoles={['god_mode']} requireRoot><AdminLayout mode="god" /></ProtectedRoute>}>
                <Route index element={<Navigate to="console" replace />} />
                <Route path="console" element={<GodModeDashboard />} />
                <Route path="staff" element={<GodConsole />} />
                <Route path="audit" element={<SecurityAudit />} />
                <Route path="explorer" element={<SystemExplorer />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppLoader>
      </HashRouter>
    </ErrorBoundary>
  );
}
