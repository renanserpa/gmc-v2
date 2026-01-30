
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { AppLoader } from '@/components/AppLoader';
import { OmniSearch } from '@/components/layout/OmniSearch';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import AdminLayout from '@/layouts/AdminLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Lazy loading via Aliases
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const RhythmPracticeTV = lazy(() => import('@/pages/RhythmPracticeTV'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const ProfileSelector = lazy(() => import('@/pages/ProfileSelector'));
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'));
const PracticeRoom = lazy(() => import('@/pages/PracticeRoom'));
const ProfessorDashboard = lazy(() => import('@/pages/ProfessorDashboard'));
const TaskManager = lazy(() => import('@/pages/TaskManager'));
const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
const NoticeBoardPage = lazy(() => import('@/pages/NoticeBoardPage'));
const ClassroomRemote = lazy(() => import('@/pages/ClassroomRemote'));
const TeacherAcademy = lazy(() => import('@/pages/TeacherAcademy'));
const SchoolDashboard = lazy(() => import('@/pages/admin/SchoolDashboard'));

export default function App() {
  const { user, role } = useAuth();
  
  // Qualquer usuário de teste ou adm@adm.com ganha acesso à gerência
  const canAccessAdmin = role === 'super_admin' || role === 'admin' || user?.email?.endsWith('@adm.com');

  return (
    <ErrorBoundary>
      <HashRouter>
        <AppLoader>
          <Suspense fallback={<LoadingScreen />}>
            <OmniSearch />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/app" element={<ProfileSelector />} />
              
              {/* Rota Estudante */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Student, UserRole.Admin, UserRole.SuperAdmin]}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="practice" element={<PracticeRoom />} />
                <Route path="rhythm-tv" element={<RhythmPracticeTV />} />
                <Route path="tasks" element={<TaskManager />} />
                <Route path="library" element={<LibraryPage />} />
              </Route>
              
              {/* Rota Professor */}
              <Route 
                path="/professor" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Professor, UserRole.Admin, UserRole.SuperAdmin]}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProfessorDashboard />} />
                <Route path="classroom" element={<ClassroomRemote />} />
                <Route path="tasks" element={<TaskManager />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="notices" element={<NoticeBoardPage />} />
                <Route path="academy" element={<TeacherAcademy />} />
              </Route>

              {/* Rota Gestor de Escola */}
              <Route 
                path="/manager" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.SchoolManager, UserRole.Admin, UserRole.SuperAdmin]}>
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
                  <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.SuperAdmin]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppLoader>
      </HashRouter>
    </ErrorBoundary>
  );
}
