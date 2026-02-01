import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { AppLoader } from '@/components/AppLoader';
import { OmniSearch } from '@/components/layout/OmniSearch';
import { DevSwitcher } from '@/components/admin/DevSwitcher';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import AdminLayout from '@/layouts/AdminLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Lazy components
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const RhythmPracticeTV = lazy(() => import('@/pages/RhythmPracticeTV'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const ProfileSelector = lazy(() => import('@/pages/ProfileSelector'));
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'));
const ArcadePage = lazy(() => import('@/pages/ArcadePage'));
const PracticeRoom = lazy(() => import('@/pages/PracticeRoom'));
const ProfessorDashboard = lazy(() => import('@/pages/ProfessorDashboard'));
const TaskManager = lazy(() => import('@/pages/TaskManager'));
const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
const NoticeBoardPage = lazy(() => import('@/pages/NoticeBoardPage'));
const ClassroomRemote = lazy(() => import('@/pages/ClassroomRemote'));
const TeacherAcademy = lazy(() => import('@/pages/TeacherAcademy'));
const SchoolDashboard = lazy(() => import('@/pages/admin/SchoolDashboard'));

// Wrapper para gerenciar a rota principal dinamicamente
const RootHandler = () => {
  const { user, role, getDashboardPath, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  // DEFAULT ROUTE FOR OWNER
  if (user?.email === 'serparenan@gmail.com') {
    return (
      <AdminLayout>
         <AdminDashboard />
      </AdminLayout>
    );
  }

  if (user && role) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <LandingPage />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppLoader>
          <Suspense fallback={<LoadingScreen />}>
            <OmniSearch />
            <DevSwitcher />
            <Routes>
              {/* Rota Raiz Dinâmica */}
              <Route path="/" element={<RootHandler />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/app" element={<ProfileSelector />} />
              
              {/* Rota Estudante */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'super_admin', 'admin']}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="arcade" replace />} />
                <Route path="arcade" element={<ArcadePage />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="practice" element={<PracticeRoom />} />
                <Route path="rhythm-tv" element={<RhythmPracticeTV />} />
                <Route path="tasks" element={<TaskManager />} />
                <Route path="library" element={<LibraryPage />} />
              </Route>
              
              {/* Rota Professor/Teacher */}
              <Route 
                path="/teacher" 
                element={
                  <ProtectedRoute allowedRoles={['professor', 'super_admin', 'admin']}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="classes" replace />} />
                <Route path="classes" element={<ProfessorDashboard />} />
                <Route path="academy" element={<TeacherAcademy />} />
                <Route path="classroom" element={<ClassroomRemote />} />
                <Route path="tasks" element={<TaskManager />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="notices" element={<NoticeBoardPage />} />
              </Route>

              {/* Redirecionamento legado para professor */}
              <Route path="/professor/*" element={<Navigate to="/teacher/classes" replace />} />

              {/* Rota Gestor de Escola */}
              <Route 
                path="/manager" 
                element={
                  <ProtectedRoute allowedRoles={['school_manager', 'super_admin', 'admin', 'manager']}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SchoolDashboard />} />
              </Route>
              
              {/* Rota Admin Global */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="ecosystem" element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
              </Route>
              
              {/* Rota Guardião */}
              <Route 
                path="/guardian" 
                element={
                  <ProtectedRoute allowedRoles={['guardian', 'super_admin', 'admin']}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="insights" replace />} />
                <Route path="insights" element={<div className="p-10 text-white font-black uppercase">Insights do Guardião em Breve</div>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppLoader>
      </HashRouter>
    </ErrorBoundary>
  );
}