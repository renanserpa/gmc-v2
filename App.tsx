import React, { Suspense, lazy } from 'react';
import * as RRD from 'react-router-dom';
const { HashRouter, Routes, Route, Navigate } = RRD as any;

import { UserRole } from './types.ts';
import { useAuth } from './contexts/AuthContext.tsx';
import { AppLoader } from './components/AppLoader.tsx';
import { OmniSearch } from './components/layout/OmniSearch.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Layout from './components/Layout.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import LoadingScreen from './components/ui/LoadingScreen.tsx';

// Lazy loading de Views com caminhos relativos puros
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const ProfileSelector = lazy(() => import('./pages/ProfileSelector.tsx'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard.tsx'));
const PracticeRoom = lazy(() => import('./pages/PracticeRoom.tsx'));
const ArcadePage = lazy(() => import('./pages/ArcadePage.tsx'));
const LibraryPage = lazy(() => import('./pages/LibraryPage.tsx'));
const ProfessorDashboard = lazy(() => import('./pages/ProfessorDashboard.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const SystemExplorer = lazy(() => import('./pages/admin/SystemExplorer.tsx'));
const DatabaseConsole = lazy(() => import('./pages/admin/DatabaseConsole.tsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

export default function App() {
  const { user } = useAuth();
  
  // Regra de Ouro: adm@adm.com é o Root do Kernel
  const isGlobalAdmin = user?.email === 'adm@adm.com';

  return (
    <HashRouter>
      <AppLoader>
        <Suspense fallback={<LoadingScreen />}>
          <OmniSearch />
          <Routes>
            {/* Landing & Autenticação */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<ProfileSelector />} />
            
            {/* Área do Aluno (Dashboard, Prática, Jogos) */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={[UserRole.Student]}><Layout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="practice" element={<PracticeRoom />} />
              <Route path="arcade" element={<ArcadePage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Área do Professor (Cockpit de Aula) */}
            <Route path="/professor" element={<ProtectedRoute allowedRoles={[UserRole.Professor]}><Layout /></ProtectedRoute>}>
              <Route index element={<ProfessorDashboard />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Área Administrativa (God Mode, Diagnóstico, Banco) */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={isGlobalAdmin ? [UserRole.Admin, UserRole.Student, UserRole.Professor, UserRole.Manager] : [UserRole.Admin]}>
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