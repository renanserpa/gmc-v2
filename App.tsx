
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

// Lazy loading com Error Resilience
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

export default function App() {
  const { user } = useAuth();
  const isGlobalAdmin = user?.email === 'admin@oliemusic.dev' || user?.email?.endsWith('@adm.com');

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
              
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Student]}>
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
              
              <Route 
                path="/professor" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Professor]}>
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
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute 
                    allowedRoles={isGlobalAdmin ? Object.values(UserRole) : [UserRole.Admin]}
                  >
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
