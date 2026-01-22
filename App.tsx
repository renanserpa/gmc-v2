import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types.ts';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Layout from './components/Layout.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import { OmniSearch } from './components/layout/OmniSearch.tsx';
import { AppLoader } from './components/AppLoader.tsx';
import { DevAuditMonitor } from './components/admin/DevAuditMonitor.tsx';
import { useAuth } from './contexts/AuthContext.tsx';

// Importa a nova tela de carregamento
import LoadingScreen from './components/ui/LoadingScreen.tsx';

// Lazy load components com caminhos relativos para maior estabilidade
const Login = lazy(() => import('./pages/Login.tsx'));
const ProfileSelector = lazy(() => import('./pages/ProfileSelector.tsx'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard.tsx'));
const ArcadePage = lazy(() => import('./pages/ArcadePage.tsx'));
const PracticeRoom = lazy(() => import('./pages/PracticeRoom.tsx'));
const BlockSequencer = lazy(() => import('./components/studio/BlockSequencer.tsx').then(m => ({ default: m.BlockSequencer })));
const KnowledgeBase = lazy(() => import('./pages/wiki/KnowledgeBase.tsx'));
const ProfessorDashboard = lazy(() => import('./pages/ProfessorDashboard.tsx'));
const GuardianDashboard = lazy(() => import('./pages/GuardianDashboard.tsx'));
const ClassroomMode = lazy(() => import('./pages/ClassroomMode.tsx'));
const ClassroomRemote = lazy(() => import('./pages/ClassroomRemote.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const UserManager = lazy(() => import('./pages/admin/UserManager.tsx'));
const ArchitectureBoard = lazy(() => import('./pages/admin/ArchitectureBoard.tsx'));
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth.tsx'));
const DatabaseConsole = lazy(() => import('./pages/admin/DatabaseConsole.tsx'));
const SchoolDashboard = lazy(() => import('./pages/admin/SchoolDashboard.tsx'));
const TeacherManager = lazy(() => import('./pages/admin/TeacherManager.tsx'));
const FinanceView = lazy(() => import('./pages/admin/FinanceView.tsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.tsx'));
const LinkStudent = lazy(() => import('./pages/LinkStudent.tsx'));
const GuardianSetup = lazy(() => import('./pages/GuardianSetup.tsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx'));
const ToolsPage = lazy(() => import('./pages/ToolsPage.tsx'));
const LibraryPage = lazy(() => import('./pages/LibraryPage.tsx'));
const NoticeBoardPage = lazy(() => import('./pages/NoticeBoardPage.tsx'));
const TeacherAcademy = lazy(() => import('./pages/TeacherAcademy.tsx'));
const BrainCenter = lazy(() => import('./pages/BrainCenter.tsx'));
const PhilosophyLab = lazy(() => import('./pages/chronos/PhilosophyLab.tsx'));
const ProjectCleanup = lazy(() => import('./pages/admin/ProjectCleanup.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

export default function App() {
  const { role } = useAuth();
  
  return (
    <HashRouter>
      <AppLoader>
        <Suspense fallback={<LoadingScreen />}>
          <OmniSearch />
          
          {/* Monitor de Auditoria exclusivo para Administradores */}
          {role === UserRole.Admin && <DevAuditMonitor />}

          <Routes>
            <Route path="/" element={<ProfileSelector />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/student/link" element={<LinkStudent />} />
            <Route path="/student/onboarding" element={<Onboarding />} />
            <Route path="/guardian/setup" element={<GuardianSetup />} />

            <Route 
              path="/student"
              element={
                <ProtectedRoute allowedRoles={[UserRole.Student]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="arcade" element={<ArcadePage />} />
              <Route path="practice" element={<PracticeRoom />} />
              <Route path="studio" element={<BlockSequencer />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="tools" element={<ToolsPage />} />
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
              <Route path="library" element={<LibraryPage />} />
              <Route path="notices" element={<NoticeBoardPage />} />
              <Route path="academy" element={<TeacherAcademy />} />
              <Route path="brain" element={<BrainCenter />} />
              <Route path="chronos" element={<PhilosophyLab />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route 
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManager />} />
              <Route path="architecture" element={<ArchitectureBoard />} />
              <Route path="health" element={<SystemHealth />} />
              <Route path="db" element={<DatabaseConsole />} />
              <Route path="cleanup" element={<ProjectCleanup />} />
            </Route>

            <Route 
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={[UserRole.Manager, UserRole.Admin]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SchoolDashboard />} />
              <Route path="teachers" element={<TeacherManager />} />
              <Route path="finance" element={<FinanceView />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="/classroom-mode" element={<ClassroomMode />} />

            <Route 
              path="/guardian"
              element={
                <ProtectedRoute allowedRoles={[UserRole.Guardian]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<GuardianDashboard />} />
            </Route>

            <Route path="/wiki" element={<Layout />} >
               <Route index element={<KnowledgeBase />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppLoader>
    </HashRouter>
  );
}
