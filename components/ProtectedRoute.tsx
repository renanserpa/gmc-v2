
import React from 'react';
// FIX: Using any to bypass react-router-dom export errors
import * as RRD from 'react-router-dom';
const { Navigate, useLocation, Outlet } = RRD as any;
import { useAuth } from '../contexts/AuthContext.tsx';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { children, allowedRoles } = props;
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // AppLoader no App.tsx gerencia isso
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!role) {
     const onboardingPaths = ['/student/link', '/guardian/setup'];
     if (onboardingPaths.some(path => location.pathname.startsWith(path))) {
         return children ? <>{children}</> : <Outlet />;
     }
     
     if (location.pathname !== '/') {
         return <Navigate to="/" replace />;
     }
  }

  if (role && !allowedRoles.includes(role)) {
    console.warn(`[ProtectedRoute] Acesso negado para role ${role} em ${location.pathname}`);
    const fallbackPath = role === 'manager' ? '/manager' : `/${role}`;
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
