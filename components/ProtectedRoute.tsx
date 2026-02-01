
import React from 'react';
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

  if (loading) return null; 

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedRole = role?.toLowerCase() || '';

  // BYPASS ROOT: Soberania total
  const isRoot = user.email === 'serparenan@gmail.com' || normalizedRole === 'super_admin';
  if (isRoot) {
    return children ? <>{children}</> : <Outlet />;
  }

  const hasAccess = allowedRoles.some(r => {
    const req = r.toLowerCase();
    if (req === normalizedRole) return true;
    if (req === 'manager' && normalizedRole === 'school_manager') return true;
    if (req === 'school_manager' && normalizedRole === 'manager') return true;
    return false;
  });

  if (!hasAccess) {
    console.warn(`[Security] Acesso Negado: ${user.email} (${role})`);
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
