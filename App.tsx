
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { AppLoader } from './components/AppLoader';
import { OmniSearch } from './components/layout/OmniSearch';
import { RealtimeNotificationHandler } from './components/RealtimeNotificationHandler';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const ProfileSelector = lazy(() => import('./pages/ProfileSelector'));

// SaaS Admin Pages
const SaaSAdminDashboard = lazy(() => import('./pages/admin/SaaSAdminDashboard'));
const FinanceManager = lazy(() => import('./pages/admin/FinanceManager'));
const TeacherManager = lazy(() => import('./pages/admin/TeacherManager'));
const TenantManager = lazy(() => import('./pages/admin/TenantManager'));
const UserDirectory = lazy(() => import('./pages/admin/UserDirectory'));

// God Mode Pages
const GodConsole = lazy(() => import('./pages/admin/GodConsole'));
const SecurityAudit = lazy(() => import('./pages/admin/SecurityAudit'));
const SQLLab = lazy(() => import('./pages/admin/SQLLab'));
const ClassroomMonitor = lazy(() => import('./pages/admin/ClassroomMonitor'));
const AssetFactory = lazy(() => import('./pages/admin/AssetFactory'));

// Dev Lab Pages
const LiveTools = lazy(() => import('./pages/dev/teacher/LiveTools'));
const ArcadeDev = lazy(() => import('./pages/dev/student/ArcadeDev'));

const RootHandler = () => {
  const { user, role, loading, getDashboardPath } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user && user.email === 'serparenan@gmail.com') return <ProfileSelector />;
  if (user) return <Navigate to={getDashboardPath(role)} replace />;
  return <LandingPage />;
};

const Placeholder = ({ title }: { title: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#02040a]">
    <div className="p-6 bg-slate-900 rounded-[40px] border border-white/5 mb-6 animate-pulse">
      <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{title}</h2>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Draft Mapped • Implementation Pending</p>
  </div>
);

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
                <Route path="dev/teacher/metronome" element={<LiveTools />} />
                <Route path="dev/student/arcade" element={<ArcadeDev />} />
                <Route path="dev/teacher/tuner" element={<Placeholder title="Tuner Pro" />} />
                <Route path="dev/teacher/planner" element={<Placeholder title="Lesson Planner" />} />
                <Route path="dev/student/missions" element={<Placeholder title="Mission Lab" />} />
                <Route path="dev/parent/reports" element={<Placeholder title="Family Reports" />} />
                <Route path="dev/external/contracts" element={<Placeholder title="B2B Contracts" />} />
                
                {/* DESIGN SYSTEM CLUSTER */}
                <Route path="dev/ui/components" element={<Placeholder title="Component Library" />} />
                <Route path="dev/ui/theme" element={<Placeholder title="Theme Preview" />} />
                <Route path="dev/ui/fonts" element={<Placeholder title="Font Tester" />} />
                <Route path="dev/ui/icons" element={<Placeholder title="Icon Gallery" />} />
                <Route path="dev/ui/a11y" element={<Placeholder title="Accessibility PECS" />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppLoader>
      </HashRouter>
    </ErrorBoundary>
  );
}
