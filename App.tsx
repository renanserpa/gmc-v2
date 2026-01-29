import React, { Suspense, lazy } from 'react';
import * as RRD from 'react-router-dom';
const { HashRouter, Routes, Route } = RRD as any;
import { UserRole } from './types.ts';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Layout from './components/Layout.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import { OmniSearch } from './components/layout/OmniSearch.tsx';
import { AppLoader } from './components/AppLoader.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import LoadingScreen from './components/ui/LoadingScreen.tsx';

// Lazy loading com caminhos relativos rigorosos (Removidos @/ e legados)
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const ProfileSelector = lazy(() => import('./pages/ProfileSelector.tsx'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard.tsx'));
const ArcadePage = lazy(() => import('./pages/ArcadePage.tsx'));
const PracticeRoom = lazy(() => import('./pages/PracticeRoom.tsx'));
const ProfessorDashboard = lazy(() => import('./pages/ProfessorDashboard.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const SystemExplorer = lazy(() => import('./pages/admin/SystemExplorer.tsx'));
const DatabaseConsole = lazy(() => import('./pages/admin/DatabaseConsole.tsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

export default function App() {
  const { user } = useAuth();
  
  // LOGICA DE SEGURANÇA GLOBAL: adm@adm.com sempre tem acesso admin
  const isGlobalAdmin = user?.email === 'adm@adm.com';

  return (
    <HashRouter>
      <AppLoader>
        <Suspense fallback={<LoadingScreen />}>
          <OmniSearch />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<ProfileSelector />} />
            
            {/* Área do Aluno - Proteção por Role */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={[UserRole.Student]}><Layout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="arcade" element={<ArcadePage />} />
              <Route path="practice" element={<PracticeRoom />} />
            </Route>
            
            {/* Área do Professor - Proteção por Role */}
            <Route path="/professor" element={<ProtectedRoute allowedRoles={[UserRole.Professor]}><Layout /></ProtectedRoute>}>
              <Route index element={<ProfessorDashboard />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Área Administrativa - Proteção Global */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={isGlobalAdmin ? [UserRole.Admin, UserRole.Student, UserRole.Professor] : [UserRole.Admin]}>
                    <AdminLayout />
                </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="explorer" element={<SystemExplorer />} />
              <Route path="db" element={<DatabaseConsole />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppLoader>
    </HashRouter>
  );
}