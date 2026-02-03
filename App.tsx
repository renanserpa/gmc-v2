
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { AppLoader } from './components/AppLoader';
import { OmniSearch } from './components/layout/OmniSearch';
import { RealtimeNotificationHandler } from './components/RealtimeNotificationHandler';
import Layout from './components/Layout';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { MaestroProvider } from './contexts/MaestroContext';

// Dashboards por Persona
const TeacherDashboard = lazy(() => import('./pages/dev/teacher/Dashboard'));
const TeacherStudents = lazy(() => import('./pages/dev/teacher/Students'));
const TeacherClasses = lazy(() => import('./pages/dev/teacher/Classes'));
const StudentDashboard = lazy(() => import('./pages/dev/student/Dashboard'));
const ParentDashboard = lazy(() => import('./pages/dev/parent/Dashboard'));
const ManagerDashboard = lazy(() => import('./pages/dev/manager/Dashboard'));
const SaaSAdminDashboard = lazy(() => import('./pages/admin/SaaSAdminDashboard'));
const GodConsole = lazy(() => import('./pages/admin/GodConsole'));

// Outras Páginas
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const ProfileSelector = lazy(() => import('./pages/ProfileSelector'));
const MetronomePage = lazy(() => import('./pages/dev/teacher/Metronome'));
const ExerciseManager = lazy(() => import('./pages/dev/teacher/ExerciseManager'));
const ArcadeDev = lazy(() => import('./pages/dev/student/ArcadeDev'));

const RootHandler = () => {
  const { user, actingRole, loading, getDashboardPath } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user && user.email === 'serparenan@gmail.com') return <ProfileSelector />;
  if (user) return <Navigate to={getDashboardPath(actingRole)} replace />;
  return <LandingPage />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <MaestroProvider>
        <HashRouter>
          <AppLoader>
            <Suspense fallback={<LoadingScreen />}>
              <OmniSearch />
              <RealtimeNotificationHandler />
              <Routes>
                <Route path="/" element={<RootHandler />} />
                <Route path="/login" element={<Login />} />
                
                <Route element={<Layout />}>
                    {/* Maestro / Teacher Routes */}
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/students" element={<TeacherStudents />} />
                    <Route path="/teacher/classes" element={<TeacherClasses />} />
                    
                    {/* Student Routes */}
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/arcade" element={<ArcadeDev />} />
                    <Route path="/student/practice" element={<MetronomePage />} />
                    
                    {/* Guardian / Parent Routes */}
                    <Route path="/guardian/dashboard" element={<ParentDashboard />} />
                    
                    {/* manager Routes */}
                    <Route path="/manager/dashboard" element={<ManagerDashboard />} />

                    {/* SaaS Admin Routes */}
                    <Route path="/admin/business" element={<SaaSAdminDashboard />} />

                    {/* God Mode Routes */}
                    <Route path="/system/console" element={<GodConsole />} />
                    
                    {/* Shared Live Tools Dev */}
                    <Route path="/system/dev/teacher/metronome" element={<MetronomePage />} />
                    <Route path="/system/dev/teacher/orchestrator" element={<ExerciseManager />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AppLoader>
        </HashRouter>
      </MaestroProvider>
    </ErrorBoundary>
  );
}
