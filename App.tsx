
import React, { Suspense, lazy } from 'react';
import * as RRD from 'react-router-dom';
const { HashRouter, Routes, Route, Navigate } = RRD as any;

import { useAuth } from './contexts/AuthContext.tsx';
import { AppLoader } from './components/AppLoader.tsx';
import Layout from './components/Layout.tsx';
import LoadingScreen from './components/ui/LoadingScreen.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';
import { MaestroProvider } from './contexts/MaestroContext.tsx';

// SPRINT 01 PAGES - ATUALIZADAS
const TeacherDashboard = lazy(() => import('./pages/dev/teacher/Dashboard.tsx'));
const TeacherStudents = lazy(() => import('./pages/dev/teacher/Students.tsx'));
const TeacherClasses = lazy(() => import('./pages/dev/teacher/Classes.tsx'));
const SchoolManager = lazy(() => import('./pages/admin/SchoolManager.tsx'));
const TeacherWhiteboard = lazy(() => import('./pages/dev/teacher/Whiteboard.tsx'));
const TeacherOrchestrator = lazy(() => import('./pages/dev/teacher/Orchestrator.tsx'));
const ClassroomMode = lazy(() => import('./pages/ClassroomMode.tsx'));

const Login = lazy(() => import('./pages/Login.tsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <MaestroProvider>
        <HashRouter>
          <AppLoader>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* TV MODE - No Layout */}
                <Route path="/classroom/tv" element={<ClassroomMode />} />

                <Route element={<Layout />}>
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/students" element={<TeacherStudents />} />
                    <Route path="/teacher/classes" element={<TeacherClasses />} />
                    <Route path="/teacher/whiteboard" element={<TeacherWhiteboard />} />
                    <Route path="/teacher/orchestrator" element={<TeacherOrchestrator />} />
                    <Route path="/admin/school" element={<SchoolManager />} />
                    <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />
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
