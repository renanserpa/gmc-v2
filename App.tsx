import React, { Suspense, lazy } from 'react';
// Correção na importação do Router: Removido o cast "as any" para garantir tipagem e resolução de módulos
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { UserRole } from './types.ts';
import { useAuth } from './contexts/AuthContext.tsx';
import { AppLoader } from './components/AppLoader.tsx';
import { OmniSearch } from './components/layout/OmniSearch.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Layout from './components/Layout.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import LoadingScreen from './components/ui/LoadingScreen.tsx';
import ErrorBoundary from './components/ui/ErrorBoundary.tsx';

// Lazy loading com comentários de "Magic Comments" para ajudar o Vite a nomear os chunks
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const SystemExplorer = lazy(() => import('./pages/admin/SystemExplorer.tsx'));
const TenantManager = lazy(() => import('./pages/admin/TenantManager.tsx'));
const GlobalEconomy = lazy(() => import('./pages/admin/GlobalEconomy.tsx'));
const BroadcastCenter = lazy(() => import('./pages/admin/BroadcastCenter.tsx'));
const UserManager = lazy(() => import('./pages/admin/UserManager.tsx'));
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth.tsx'));
const GamificationLab = lazy(() => import('./pages/admin/GamificationLab.tsx'));
const SecurityAudit = lazy(() => import('./pages/admin/SecurityAudit.tsx'));
const ArchitectureBoard = lazy(() => import('./pages/admin/ArchitectureBoard.tsx'));
const BrainCenter = lazy(() => import('./pages/BrainCenter.tsx'));

const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const ProfileSelector = lazy(() => import('./pages/ProfileSelector.tsx'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard.tsx'));
const PracticeRoom = lazy(() => import('./pages/PracticeRoom.tsx'));
const ProfessorDashboard = lazy(() => import('./pages/ProfessorDashboard.tsx'));
const TaskManager = lazy(() => import('./pages/TaskManager.tsx'));
const LibraryPage = lazy(() => import('./pages/LibraryPage.tsx'));
const NoticeBoardPage = lazy(() => import('./pages/NoticeBoardPage.tsx'));
const ClassroomRemote = lazy(() => import('./pages/ClassroomRemote.tsx'));
const TeacherAcademy = lazy(() => import('./pages/TeacherAcademy.tsx'));

export default function App() {
  const { user } = useAuth();
  
  // SOBERANIA DE ACESSO: Validação rigorosa de Admin
  const isGlobalAdmin = user?.email === 'admin@oliemusic.dev';

  return (
    <ErrorBoundary> {/* Adicionado para capturar erros de carregamento de módulos */}
      <HashRouter>
        <AppLoader>
          <Suspense fallback={<LoadingScreen />}>
            <OmniSearch />
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/app" element={<ProfileSelector />} />
              
              {/* Jornada do Aluno */}
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
                <Route path="tasks" element={<TaskManager />} />
                <Route path="library" element={<LibraryPage />} />
              </Route>
              
              {/* Jornada do Professor */}
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
              
              {/* MAESTRO ADMIN CONSOLE */}
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
                <Route path="explorer" element={<SystemExplorer />} />
                <Route path="orchestrator" element={<ArchitectureBoard />} />
                <Route path="brain" element={<BrainCenter />} />
                <Route path="tenants" element={<TenantManager />} />
                <Route path="economy" element={<GlobalEconomy />} />
                <Route path="gamification" element={<GamificationLab />} />
                <Route path="security" element={<SecurityAudit />} />
                <Route path="broadcast" element={<BroadcastCenter />} />
                <Route path="users" element={<UserManager />} />
                <Route path="health" element={<SystemHealth />} />
              </Route>
              
              {/* Fallback para evitar 404 dinâmico */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppLoader>
      </HashRouter>
    </ErrorBoundary>
  );
}