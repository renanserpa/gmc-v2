
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { AppLoader } from '@/components/AppLoader';
import { OmniSearch } from '@/components/layout/OmniSearch';
import { RealtimeNotificationHandler } from '@/components/RealtimeNotificationHandler';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Lazy components
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const ProfileSelector = lazy(() => import('@/pages/ProfileSelector'));

// SaaS Admin Pages
const SaaSAdminDashboard = lazy(() => import('@/pages/admin/SaaSAdminDashboard'));
const FinanceManager = lazy(() => import('@/pages/admin/FinanceManager'));
const TeacherManager = lazy(() => import('@/pages/admin/TeacherManager'));
const TenantManager = lazy(() => import('@/pages/admin/TenantManager'));
const UserDirectory = lazy(() => import('@/pages/admin/UserDirectory'));

// God Mode Pages
const StaffProvisioning = lazy(() => import('@/pages/admin/StaffProvisioning'));
const GodConsole = lazy(() => import('@/pages/admin/GodConsole'));
const SecurityAudit = lazy(() => import('@/pages/admin/SecurityAudit'));
const SQLLab = lazy(() => import('@/pages/admin/SQLLab'));
const ClassroomMonitor = lazy(() => import('@/pages/admin/ClassroomMonitor'));
const AssetFactory = lazy(() => import('@/pages/admin/AssetFactory'));

// Dev Lab Pages
const MetronomeDev = lazy(() => import('@/pages/dev/teacher/MetronomeDev'));
const ArcadeDev = lazy(() => import('@/pages/dev/student/ArcadeDev'));

const RootHandler = () => {
  const { user, role, loading, getDashboardPath } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user && user.email === 'serparenan@gmail.com') return <ProfileSelector />;
  if (user) return <Navigate to={getDashboardPath(role)} replace />;
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
                <Route path="hr" element={<TeacherManager />} />
                <Route path="tenants" element={<TenantManager />} />
                <Route path="users" element={<UserDirectory />} />
              </Route>

              {/* GOD MODE SYSTEM PANEL */}
              <Route path="/system" element={<ProtectedRoute allowedRoles={['god_mode']} requireRoot><AdminLayout mode="god" /></ProtectedRoute>}>
                <Route index element={<Navigate to="console" replace />} />
                <Route path="console" element={<GodConsole />} />
                <Route path="monitor" element={<ClassroomMonitor />} />
                <Route path="assets" element={<AssetFactory />} />
                <Route path="audit" element={<SecurityAudit />} />
                <Route path="sql" element={<SQLLab />} />
                
                {/* DEV LABORATORY ROUTES */}
                <Route path="dev/teacher/metronome" element={<MetronomeDev />} />
                <Route path="dev/student/arcade" element={<ArcadeDev />} />
                <Route path="dev/teacher/tuner" element={<div className="p-10 text-center font-black uppercase text-slate-700">🚧 Em Construção: Tuner Pro</div>} />
                <Route path="dev/teacher/planner" element={<div className="p-10 text-center font-black uppercase text-slate-700">🚧 Em Construção: Lesson Planner</div>} />
                <Route path="dev/student/missions" element={<div className="p-10 text-center font-black uppercase text-slate-700">🚧 Em Construção: Mission HUD</div>} />
                <Route path="dev/parent/insights" element={<div className="p-10 text-center font-black uppercase text-slate-700">🚧 Em Construção: Parent Insights</div>} />
                <Route path="dev/parent/finance" element={<div className="p-10 text-center font-black uppercase text-slate-700">🚧 Em Construção: Billing Area</div>} />
                <Route path="dev/manager/units" element={<div className="p-10 text-center font-black uppercase text-slate-700">🚧 Em Construção: Multi-Unit BI</div>} />
                <Route path="dev/manager/analytics" element={<div className="p-10 text-center font-black uppercase text-slate-700">🚧 Em Construção: Global Analytics</div>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppLoader>
      </HashRouter>
    </ErrorBoundary>
  );
}
